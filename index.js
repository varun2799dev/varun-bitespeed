const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const Contact = require('./schemas/contactSchema')
dotenv.config()

const app = express()

app.use(express.json())

mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
    console.log('MongoDB connected')
})
.catch((e)=>{
    console.error(`Error connecting to MongoDB ${e}`)
})



app.post('/identify',async (req,res)=>{
   try{
        const {email,phoneNumber} = req.body
    
        if(!email && !phoneNumber){
            return res.status(400).json({error : 'Email and phone number required'})
        }

        const matchedContacts =  await Contact.find({
            $or : [
                {email : email || null},
                {phoneNumber : phoneNumber || null}
            ]
        });

       if (matchedContacts.length === 0) {
      const newContact = await Contact.create({
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkedId: null,
        linkPrecedence: 'primary'
      });

      return res.status(200).json({
        contact: {
          primaryContactId: newContact._id,
          emails: [newContact.email].filter(Boolean),
          phoneNumbers: [newContact.phoneNumber].filter(Boolean),
          secondaryContactIds: []
        }
      });
    }

    //Found few matches so find out their Ids which are primary and secondary both and seach all contacts in the DB
    const contactIds = matchedContacts.map(c => c._id.toString());
    const linkedIds = matchedContacts
      .filter(c => c.linkedId)
      .map(c => c.linkedId.toString());

    const allIds = [...new Set([...contactIds, ...linkedIds])];

    const relatedContacts = await Contact.find({
      $or: [
        { _id: { $in: allIds } },
        { linkedId: { $in: allIds } }
      ]
    });
    
     const primaryContact = relatedContacts.reduce((earliest, contact) => {
      if (
        contact.linkPrecedence === 'primary' &&
        (!earliest || contact.createdAt < earliest.createdAt)
      ) {
        return contact;
      }
      return earliest;
    }, null);

    //Trying to find whether the relatedcontacts which is the existing records are having email and phone number if there is a match then name it secondary
    const existingEmails = relatedContacts.map(c => c.email).filter(Boolean);
    const existingPhones = relatedContacts.map(c => c.phoneNumber).filter(Boolean);

    const isNewEmail = email && !existingEmails.includes(email);
    const isNewPhone = phoneNumber && !existingPhones.includes(phoneNumber);

    if (isNewEmail || isNewPhone) {
      await Contact.create({
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkedId: primaryContact._id,
        linkPrecedence: 'secondary'
      });
    }

       
        


        }
    }
    catch(error){
        console.error(error)
        res.status(500).json({error : 'Internal Server Error'})

    }


})



app.get('/',(req,res)=>{
    res.send('Hello Bitespeed')
})

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
    console.log(`Server started listening on ${PORT}`)
})
