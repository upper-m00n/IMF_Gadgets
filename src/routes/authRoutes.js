const express = require('express')
const bcrypt = require('bcryptjs')
const {PrismaClient} =require('@prisma/client');
const {generateToken}= require("../utils/jwt")

const router= express.Router();
const prisma =new PrismaClient();

//login route

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

// register route

router.post('/register', async(req,res)=>{
    const {name, email, password}= req.body

    try {
        if(!name || !email || !password){
            return res.status(401).json({message:"Credentials required"})
        }

        const existingUser= await prisma.user.findUnique({where:{email}})

        if(existingUser){
            return res.status(409).json({message:"User already exists"})
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const newUser= await prisma.user.create({
            data:{
                name,
                email,
                password:hashedPassword
            }
        });

        res.status(201).json({newUser});
    } catch (err) {
        console.error("Error occured while login",err)
        res.status(500).json({message:"Server error"})
    }
})

module.exports=router;