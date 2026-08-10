import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOnePayTransactionApi } from "../../api/paymentApi.js";

export default function OnePayResultPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [status, setStatus] = useState("Verifying payment...");

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const params = new URLSearchParams(location.search);
                const verificationData = {
                    status: params.get("status"),
                    reference: params.get("reference"),
                    external_reference: params.get("external_reference"),
                    message: params.get("message")
                };

                if (!verificationData.reference) {
                    setStatus("Invalid payment response. Missing reference.");
                    return;
                }

                const res = await verifyOnePayTransactionApi(verificationData);

                if (res.status === "paid") {
                    setStatus("Payment successful! Redirecting...");
                    setTimeout(() => navigate("/orders", { replace: true }), 2000);
                } else {
                    setStatus("Payment failed or was cancelled. Redirecting...");
                    setTimeout(() => navigate("/orders", { replace: true }), 3000);
                }
            } catch (err) {
                console.error(err);
                setStatus("Error verifying payment. Check your orders page.");
                setTimeout(() => navigate("/orders", { replace: true }), 3000);
            }
        };

        verifyPayment();
    }, [location, navigate]);

    return (
        <main className="min-h-[70vh] flex items-center justify-center p-6">
            <div className="text-center p-8 bg-panel border border-line">
                <h1 className="text-2xl font-display text-warm mb-4">OnePay Transaction</h1>
                <p className="text-muted tracking-wide">{status}</p>
            </div>
        </main>
    );
}
