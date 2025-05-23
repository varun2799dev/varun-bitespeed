const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

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

app.get('/',(req,res)=>{
    res.send('Hello Bitespeed')
})

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
    console.log(`Server started listening on ${PORT}`)
})
