require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const express = require('express');
const app = express();
const gadgetRoutes =require('./routes/gadgetRoutes')

app.use(express.json());

// routes

app.use('/gadgets',gadgetRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`API is running on port ${PORT}`);
});


