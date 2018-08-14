const { EMAIL_CONFIG } = require('../../config/env');
const { createTransport } = require('nodemailer');

class MailService {
  constructor() {
    this.transport = createTransport(EMAIL_CONFIG.transport);
  }

  send({ from, to, subject, text}) {
    const options = Object.assign({}, EMAIL_CONFIG.options, { from, to, subject, text});
    return this.transport.sendMail(options);
  }
}

module.exports = new MailService();