const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Contact = require("./schemas/contactSchema");
dotenv.config();

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((e) => {
    console.error(`Error connecting to MongoDB: ${e}`);
  });

// POST /identify route
app.post("/identify", async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res
        .status(400)
        .json({ error: "Email or phone number is required" });
    }

    // Find existing matching contacts
    const matchedContacts = await Contact.find({
      $or: [{ email: email || null }, { phoneNumber: phoneNumber || null }],
    });

    // No match -> create new primary contact
    if (matchedContacts.length === 0) {
      const newContact = await Contact.create({
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkedId: null,
        linkPrecedence: "primary",
      });

      return res.status(200).json({
        contact: {
          primaryContactId: newContact._id,
          emails: [newContact.email].filter(Boolean),
          phoneNumbers: [newContact.phoneNumber].filter(Boolean),
          secondaryContactIds: [],
        },
      });
    }

    // Found some matches
    const contactIds = matchedContacts.map((c) => c._id.toString());
    const linkedIds = matchedContacts
      .filter((c) => c.linkedId)
      .map((c) => c.linkedId.toString());

    const allIds = [...new Set([...contactIds, ...linkedIds])];

    const relatedContacts = await Contact.find({
      $or: [{ _id: { $in: allIds } }, { linkedId: { $in: allIds } }],
    });

    // Find earliest primary contact
    const primaryContact = relatedContacts.reduce((earliest, contact) => {
      if (
        contact.linkPrecedence === "primary" &&
        (!earliest || contact.createdAt < earliest.createdAt)
      ) {
        return contact;
      }
      return earliest;
    }, null);

    // Check if the input is a new email or phone number
    const existingEmails = relatedContacts.map((c) => c.email).filter(Boolean);
    const existingPhones = relatedContacts
      .map((c) => c.phoneNumber)
      .filter(Boolean);

    const isNewEmail = email && !existingEmails.includes(email);
    const isNewPhone = phoneNumber && !existingPhones.includes(phoneNumber);

    if (isNewEmail || isNewPhone) {
      await Contact.create({
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkedId: primaryContact._id,
        linkPrecedence: "secondary",
      });
    }

    // Final response construction
    const finalRelated = await Contact.find({
      $or: [{ _id: primaryContact._id }, { linkedId: primaryContact._id }],
    });

    const emails = [
      ...new Set(finalRelated.map((c) => c.email).filter(Boolean)),
    ];
    const phones = [
      ...new Set(finalRelated.map((c) => c.phoneNumber).filter(Boolean)),
    ];
    const secondaryIds = finalRelated
      .filter((c) => c.linkPrecedence === "secondary")
      .map((c) => c._id);

    return res.status(200).json({
      contact: {
        primaryContactId: primaryContact._id,
        emails,
        phoneNumbers: phones,
        secondaryContactIds: secondaryIds,
      },
    });
  } catch (error) {
    console.error("Error in /identify route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("Hello Bitespeed");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started listening on port ${PORT}`);
});
