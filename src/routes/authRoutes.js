const express = require('express')
const bcrypt = require('bcryptjs')
const {PrismaClient} =require('@prisma/client');
const {generateToken}= require("../utils/jwt")

const router= express.Router();
const prisma =new PrismaClient();

router.post('/login',async(req,res)=>{
    const {email,password}=req.body;
    try {
        const user = await prisma.user.findUnique({where:{email}});

        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        const isMatch= await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(401).json({message:"Invalid credentials"})
        }
        const token = generateToken(user);
        res.status(201).json({token})

    } catch (err) {
        console.error("Error occured while login",err)
        res.status(500).json({message:"Server error"})
    }
})

router.post('/register', async(req,res)=>{
    
})