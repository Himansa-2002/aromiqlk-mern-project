import sendEmail from '../utils/sendEmail.js';

const sendWelcomeEmail = async (user) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-w-lg mx-auto p-6 bg-[#090b0e] text-[#e0e2e5] border border-[#2a303c]">
            <h1 style="color: #c9a961; text-align: center;">Welcome to Aromiq.lk!</h1>
            <p>Hi ${user.firstName},</p>
            <p>Thank you for joining aromiq.lk. We are thrilled to have you experience our collection of luxury fragrances.</p>
            <p>You can now log in, save your delivery addresses, and track your orders seamlessly.</p>
            <p style="margin-top: 30px; text-align: center;">
                <a href="${process.env.FRONTEND_URL}/login" style="background-color: #c9a961; color: #090b0e; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 4px;">Sign In to Your Account</a>
            </p>
            <p style="margin-top: 40px; font-size: 12px; color: #6b7280; text-align: center;">© ${new Date().getFullYear()} Aromiq.lk. All rights reserved.</p>
        </div>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Welcome to Aromiq.lk - Your Luxury Journey Begins',
            html
        });
    } catch (err) {
        console.error("Failed to send welcome email:", err);
    }
};

const sendPasswordResetEmail = async (user, resetUrl) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-w-lg mx-auto p-6 bg-[#090b0e] text-[#e0e2e5] border border-[#2a303c]">
            <h1 style="color: #c9a961; text-align: center;">Reset Your Password</h1>
            <p>Hi ${user.firstName},</p>
            <p>We received a request to reset your password. Click the button below to set a new one. This link will expire in 10 minutes.</p>
            <p style="margin-top: 30px; text-align: center;">
                <a href="${resetUrl}" style="background-color: #c9a961; color: #090b0e; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 4px;">Reset Password</a>
            </p>
            <p style="margin-top: 20px;">If you did not make this request, please ignore this email.</p>
        </div>
    `;

    await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        html
    });
};

const sendOrderConfirmationEmail = async (user, order) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-w-lg mx-auto p-6 bg-[#090b0e] text-[#e0e2e5] border border-[#2a303c]">
            <h1 style="color: #c9a961; text-align: center;">Order Confirmed!</h1>
            <p>Hi ${user.firstName},</p>
            <p>Thank you for your purchase. We have received your order <strong>#${order.orderNumber}</strong> and it is now being processed.</p>
            <div style="background-color: rgba(201, 169, 97, 0.1); padding: 15px; margin: 20px 0; border-left: 4px solid #c9a961;">
                <p style="margin: 0;"><strong>Total Amount:</strong> Rs ${order.pricing.grandTotal.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</p>
                <p style="margin: 5px 0 0;"><strong>Payment Method:</strong> ${order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'Card'} </p>
            </div>
            <p style="margin-top: 30px; text-align: center;">
                <a href="${process.env.FRONTEND_URL}/order-details/${order.orderNumber}" style="background-color: #c9a961; color: #090b0e; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 4px;">View Order Details</a>
            </p>
        </div>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: `Order Confirmation - ${order.orderNumber}`,
            html
        });
    } catch (err) {
        console.error("Failed to send order confirmation email:", err);
    }
};

const sendOrderStatusEmail = async (user, order) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-w-lg mx-auto p-6 bg-[#090b0e] text-[#e0e2e5] border border-[#2a303c]">
            <h1 style="color: #c9a961; text-align: center;">Order Update</h1>
            <p>Hi ${user.firstName},</p>
            <p>The status of your order <strong>#${order.orderNumber}</strong> has been updated to: <strong style="color: #c9a961; text-transform: uppercase;">${order.orderStatus}</strong>.</p>
            ${order.trackingNumber ? `<p>Your tracking number is: <strong>${order.trackingNumber}</strong></p>` : ''}
            <p style="margin-top: 30px; text-align: center;">
                <a href="${process.env.FRONTEND_URL}/order-details/${order.orderNumber}" style="background-color: #c9a961; color: #090b0e; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 4px;">Track Order</a>
            </p>
        </div>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: `Update on Order ${order.orderNumber}`,
            html
        });
    } catch (err) {
        console.error("Failed to send order status email:", err);
    }
};

export const emailService = {
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendOrderConfirmationEmail,
    sendOrderStatusEmail
};
