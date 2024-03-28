const Contact = require('../models/contact');

//form submission
exports.createContact = async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).send({ message: 'Your message has been sent successfully.' });
  } catch (error) {
    console.error('Failed to save contact message:', error);
    res.status(400).send({ error: 'Failed to send message.' });
  }
};
