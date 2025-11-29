const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send order notification email
const sendOrderNotification = async (order, user) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'Soluwasemiloba@gmail.com',
    subject: `New Order Received - ${order.orderId}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #007bff; text-align: center; margin-bottom: 30px;">New Order Notification</h1>

          <div style="margin-bottom: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Order Details</h2>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #333;">Customer Information</h3>
            <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Phone:</strong> ${user.phone || 'Not provided'}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #333;">Shipping Address</h3>
            <p>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</p>
            <p>${order.shippingAddress.address}</p>
            <p>${order.shippingAddress.city}, ${order.shippingAddress.state}</p>
            <p>${order.shippingAddress.country || 'Nigeria'} ${order.shippingAddress.postalCode || ''}</p>
            <p><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
            <p><strong>Email:</strong> ${order.shippingAddress.email}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #333;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Product</th>
                  <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Quantity</th>
                  <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Price</th>
                  <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 12px;">${item.title}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.quantity}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₦${item.price.toLocaleString()}</td>
                    <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₦${item.itemTotal.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h3 style="color: #333; margin-top: 0;">Order Summary</h3>
            <p><strong>Subtotal:</strong> ₦${order.pricing.subtotal.toLocaleString()}</p>
            <p><strong>Tax (7.5% VAT):</strong> ₦${order.pricing.tax.toLocaleString()}</p>
            <p><strong>Shipping:</strong> ₦${order.pricing.shipping.toLocaleString()}</p>
            <p style="font-size: 18px; font-weight: bold; color: #007bff;"><strong>Total:</strong> ₦${order.pricing.total.toLocaleString()}</p>
          </div>

          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            <p>This is an automated notification from ShopEase.</p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order notification email sent for order ${order.orderId}`);
  } catch (error) {
    console.error('Error sending order notification email:', error);
    throw error;
  }
};

module.exports = {
  sendOrderNotification
};
