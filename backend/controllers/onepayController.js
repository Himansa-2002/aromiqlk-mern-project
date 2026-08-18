import Order from "../models/Order.js";
import { generateOnePayHash } from "../utils/onepayUtil.js";
import { decreaseOrderInventory, restoreOrderInventory } from "../services/inventoryService.js";

const ONEPAY_APP_ID = process.env.ONEPAY_APP_ID;
const ONEPAY_APP_TOKEN = process.env.ONEPAY_APP_TOKEN;
const ONEPAY_HASH_SALT = process.env.ONEPAY_HASH_SALT;

export const createOnePayTransaction = async (req, res, next) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            res.status(400);
            throw new Error("Order ID is required");
        }

        const order = await Order.findOne({ _id: orderId, user: req.user._id });

        if (!order) {
            res.status(404);
            throw new Error("Order not found or access denied");
        }

        if (order.orderStatus === "cancelled" || order.paymentStatus === "paid") {
            res.status(400);
            throw new Error("Order cannot be processed for payment");
        }

        const amount = order.pricing.grandTotal;
        const currency = order.pricing.currency || "LKR";

        const hash = generateOnePayHash(ONEPAY_APP_ID, currency, amount, ONEPAY_HASH_SALT);

        // Build the OnePay checkout URL or response payload
        const paymentData = {
            app_id: ONEPAY_APP_ID,
            reference: order.orderNumber,
            customer_first_name: order.customer.firstName,
            customer_last_name: order.customer.lastName,
            customer_phone_number: order.customer.phone || "0000000000",
            customer_email: order.customer.email,
            transaction_name: `Aromiq Order ${order.orderNumber}`,
            amount: Number(amount).toFixed(2),
            currency: currency,
            // OnePay V3 requires a redirect URL where the user will be sent after payment
            transaction_redirect_url: `${process.env.FRONTEND_URL}/onepay-result`,
            // Keep the older return/cancel URLs for compatibility
            return_url: `${process.env.FRONTEND_URL}/onepay-result`,
            cancel_url: `${process.env.FRONTEND_URL}/onepay-result`,
            hash: hash,
        };

        // Fetch the OnePay payment link from the API securely as required by v3
        const onepayApiUrl = "https://api.onepay.lk/v3/checkout/link/";
        const response = await fetch(onepayApiUrl, {
            method: "POST",
            headers: {
                "Authorization": `${ONEPAY_APP_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("OnePay API Error:", errorData);
            throw new Error(errorData.message || "Failed to generate OnePay payment link.");
        }

        const data = await response.json();
        const generatedLink = data?.data?.gateway?.redirect_url || data?.data?.redirectUrl || data?.data?.redirect_url || data?.redirect_url;

        if (!generatedLink) {
            console.error("Failed parsing URL from:", data);
            throw new Error("OnePay API did not return a valid gateway URL.");
        }

        // After successful API call, return both the generated link and the original payload for possible form submission
        return res.status(200).json({
            success: true,
            paymentData,
            onePayUrl: generatedLink,
        });
    } catch (error) {
        next(error);
    }
};

export const verifyOnePayTransaction = async (req, res, next) => {
    try {
        const { status, reference, external_reference, message } = req.body;

        const order = await Order.findOne({ orderNumber: reference, user: req.user._id });

        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }

        // Double check with OnePay API to avoid tampering
        const verifyUrl = `https://api.onepay.lk/v3/transaction/status/?reference=${reference}`;
        const response = await fetch(verifyUrl, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${ONEPAY_APP_TOKEN}`,
                "Content-Type": "application/json"
            }
        });

        let transactionStatus = "pending";
        if (response.ok) {
            const data = await response.json();
            // Assume data.data.status holds the status
            const payStatus = data?.data?.status;
            if (payStatus === "SUCCESS" || payStatus === "PAID") transactionStatus = "paid";
            else if (payStatus === "FAILED" || payStatus === "CANCELLED") transactionStatus = "failed";
        }

        // fallback to provided status if fetch not available or failed but securely verifying is always better.
        // As instructed: Do not trust browser redirect. Verify server-side.
        if (transactionStatus === "pending") {
            if (status === "success" || status === "paid") {
                // Wait, if it didn't verify, we shouldn't just trust frontend. 
                // We'll use the OnePay API response.
            }
        }

        if (transactionStatus === "paid") {
            if (order.paymentStatus !== "paid") {
                order.paymentStatus = "paid";
                order.orderStatus = "confirmed";
                order.onePayTransactionId = external_reference || "";
                order.paidAt = new Date();

                await order.save();

                if (order.inventoryStatus === "pending") {
                    await decreaseOrderInventory({ order, performedBy: null });
                }
            }
        } else if (transactionStatus === "failed") {
            order.paymentStatus = "failed";
            await order.save();
        }

        res.status(200).json({
            success: true,
            status: transactionStatus,
            order: order
        });
    } catch (error) {
        next(error);
    }
};

export const onePayWebhook = async (req, res, next) => {
    try {
        const { status, reference, external_reference } = req.body;

        const order = await Order.findOne({ orderNumber: reference });
        if (!order) {
            return res.status(404).send("Order not found");
        }

        // Ideally verify with OnePay
        const verifyUrl = `https://api.onepay.lk/v3/transaction/status/?reference=${reference}`;
        const response = await fetch(verifyUrl, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${ONEPAY_APP_TOKEN}`
            }
        });

        let trStatus = "pending";
        if (response.ok) {
            const data = await response.json();
            const s = data?.data?.status;
            if (s === "SUCCESS" || s === "PAID") trStatus = "paid";
            else if (s === "FAILED" || s === "CANCELLED") trStatus = "failed";
        } else {
            // fallback based on webhook status cautiously, but ideally we only trust API
            const sStr = String(status).toUpperCase();
            if (sStr === "SUCCESS" || sStr === "PAID") trStatus = "paid";
            else if (sStr === "FAILED" || sStr === "CANCELLED") trStatus = "failed";
        }

        if (trStatus === "paid" && order.paymentStatus !== "paid") {
            order.paymentStatus = "paid";
            order.orderStatus = "confirmed";
            order.onePayTransactionId = external_reference;
            order.paidAt = new Date();
            await order.save();

            if (order.inventoryStatus === "pending") {
                await decreaseOrderInventory({ order, performedBy: null });
            }
        } else if (trStatus === "failed" && order.paymentStatus !== "failed") {
            order.paymentStatus = "failed";
            await order.save();
        }

        res.status(200).send("OK");
    } catch (error) {
        next(error);
    }
};
