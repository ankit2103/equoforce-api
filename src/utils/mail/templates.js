function contactSubject({ firstName, lastName, companyName }) {
  return `New Inquiry from ${firstName} ${lastName} — ${companyName}`;
}

function contactHtml({ firstName, lastName, businessEmail, companyName, service, message }) {
  return `
      <h2>New Contact Form Submission</h2>
      <table cellpadding="6" cellspacing="0" border="0">
        <tr><td><strong>Name:</strong></td><td>${firstName} ${lastName}</td></tr>
        <tr><td><strong>Business Email:</strong></td><td>${businessEmail}</td></tr>
        <tr><td><strong>Company:</strong></td><td>${companyName}</td></tr>
        <tr><td><strong>Service:</strong></td><td>${service || 'Not specified'}</td></tr>
        <tr><td><strong>Message:</strong></td><td>${message || 'Not provided'}</td></tr>
      </table>
    `;
}

function contactText({ firstName, lastName, businessEmail, companyName, service, message }) {
  return `New Inquiry\n\nName: ${firstName} ${lastName}\nBusiness Email: ${businessEmail}\nCompany: ${companyName}\nService: ${service || 'Not specified'}\nMessage: ${message || 'Not provided'}`;
}

function unsubscribeNotificationSubject({ firstName, lastName }) {
  return `Unsubscribe: ${firstName} ${lastName}`;
}

function unsubscribeNotificationHtml({ firstName, lastName, email, companyName }) {
  return `
      <h2>Unsubscribe Notification</h2>
      <p>A contact has unsubscribed.</p>
      <table cellpadding="6" cellspacing="0" border="0">
        <tr><td><strong>Name:</strong></td><td>${firstName} ${lastName}</td></tr>
        <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
        <tr><td><strong>Company:</strong></td><td>${companyName || 'Not specified'}</td></tr>
      </table>
    `;
}

function unsubscribeNotificationText({ firstName, lastName, email, companyName }) {
  return `A contact has unsubscribed.\n\nName: ${firstName} ${lastName}\nEmail: ${email}\nCompany: ${companyName || 'Not specified'}`;
}

module.exports = { contactSubject, contactHtml, contactText, unsubscribeNotificationSubject, unsubscribeNotificationHtml, unsubscribeNotificationText };