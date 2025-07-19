require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require('express');
const app = express();
const gadgetRoutes =require('./routes/gadgetRoutes')
const authRoutes= require('./routes/authRoutes')

app.use(express.json());

// routes

app.use('/gadgets',gadgetRoutes);
app.use('/auth',authRoutes);

app.get('/', (req,res)=>{
    res.json({message:"API is working"});
})

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`API is running on port ${PORT}`);
});


