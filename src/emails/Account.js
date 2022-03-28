const sgMail = require('@sendgrid/mail');
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'tusarbiswasjr@gmail.com',
        subject: 'Welcome message',
        text: `Hello ${name}, welcome to our application service. Hoping you will enjoy it. If yes you can share it with your friends and family. If not then you can feedback us about your experience so we can improve our services.`
    });

}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'tusarbiswasjr@gmail.com',
        subject: 'See You Soon',
        text: `Hello ${name}, thanks for using our services. Hoping we will see you soon in near future.`
    });
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}