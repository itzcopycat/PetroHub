const contactThankYouTemplate = (name) => `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden;">

    <!-- Header -->
    <div style="background-color: #1a1a1a; padding: 24px 32px; text-align: center;">
      <span style="font-size: 26px; font-weight: bold; color: #f7941d;">PetroHub</span>
      <p style="margin: 6px 0 0; font-size: 13px; font-style: italic; color: #4a90d9; font-weight: bold;">
        Powering Every Kitchen!
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 32px;">
      <h2 style="color: #1a1a1a; margin-top: 0;">Thank you, ${name}! 🎉</h2>
      <p style="color: #444; font-size: 15px; line-height: 1.6;">
        We've received your message and our team is already on it. You can expect a response from us within
        <strong style="color: #f7941d;">24 hours</strong>.
      </p>

      <div style="background-color: #fff7ed; border-left: 4px solid #f7941d; padding: 14px 18px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0; color: #555; font-size: 14px;">
          Need urgent help? Call us directly at <strong>+91 9876543210</strong> during working hours (Mon–Sat, 9 AM – 8 PM).
        </p>
      </div>

      <p style="color: #444; font-size: 15px; line-height: 1.6;">
        In the meantime, feel free to explore your account or book a cylinder if you haven't already.
      </p>

      <div style="text-align: center; margin-top: 32px;">
        <a href="https://yourdomain.com/book-cylinder"
           style="background-color: #f7941d; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
          Book a Cylinder
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #1a1a1a; padding: 18px 32px; text-align: center;">
      <p style="margin: 0; color: #aaa; font-size: 12px;">
        © ${new Date().getFullYear()} PetroHub · Kolkata, India
      </p>
      <p style="margin: 4px 0 0; color: #666; font-size: 11px;">
        This is an automated message, please do not reply directly to this email.
      </p>
    </div>

  </div>
`;

module.exports = contactThankYouTemplate;