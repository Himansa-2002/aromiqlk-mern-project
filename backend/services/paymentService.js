import crypto from "crypto";

const generateTransactionId = () => {
  const timestamp = Date.now();

  const randomValue = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `TXN-${timestamp}-${randomValue}`;
};

export const resolvePaymentProvider = (paymentMethod) => {
  if (paymentMethod === "cash_on_delivery") {
    return "cash_on_delivery";
  }

  if (paymentMethod === "bank_transfer") {
    return "manual";
  }

  if (paymentMethod === "card") {
    /*
     * Replace "other" with "payhere" or "stripe"
     * when a real payment provider is integrated.
     */
    return "other";
  }

  const error = new Error("Unsupported payment method");

  error.statusCode = 400;
  throw error;
};

export const createPaymentReference = () => {
  return generateTransactionId();
};

export const getInitialPaymentStatus = (paymentMethod) => {
  if (paymentMethod === "cash_on_delivery") {
    return "pending";
  }

  if (paymentMethod === "bank_transfer") {
    return "pending";
  }

  return "processing";
};

export const buildPaymentInstructions = ({
  paymentMethod,
  transactionId,
  amount,
  currency,
}) => {
  if (paymentMethod === "cash_on_delivery") {
    return {
      type: "cash_on_delivery",
      message: "Payment will be collected when the order is delivered.",
    };
  }

  if (paymentMethod === "bank_transfer") {
    return {
      type: "bank_transfer",
      message:
        "Transfer the exact order amount and submit the transaction reference for verification.",
      transactionId,
      amount,
      currency,
    };
  }

  return {
    type: "card",
    message:
      "Card payment record created. Connect a payment gateway to generate a checkout URL.",
    transactionId,
    amount,
    currency,
    checkoutUrl: null,
  };
};
