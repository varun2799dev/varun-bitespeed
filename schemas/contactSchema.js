const mongoose = require('mongoose')

const contactSchema = new mongoose.Schema({
    email : {
        type : String,
        default : null,
        trim : true
    },
    phoneNumber : {
        type : String,
        defualt : null,
        trim : true
    },
    linkedId : {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Contact',
        default : null
    },
    linkPrecedence : {
        type : String,
        enum : ['primary','secondary'],
        required : true,
        default : 'primary'
    },
    deletedAt: {
    type: Date,
    default: null
  }
},{
    timestamps : true
});

const Contact = mongoose.model('Contact',contactSchema)

module.exports = Contact;
