const express = require('express');
const router = express.Router();
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient();
const {generateCodenameGemini}= require('../utils/gemini')

// lets generate random success probabillity 
const getRandomSuccessProbability = ()=>{
    return `${Math.floor(Math.random()*51)+50}% sucsess probability`;
}

// GET
router.get('/',async(req,res)=>{
    try {
        const {status} = req.query;

        const gadgets = await prisma.gadget.findMany({
            where: status ? {status} : {},
            orderBy: {createdAt : 'desc'},
        });

        const gadgetWithSuccess = gadgets.map((gadget)=> ({
            ...gadget,
            missionSuccessProbability: getRandomSuccessProbability(),
        }));

        res.status(200).json(gadgetWithSuccess);

    } catch (error) {
        console.error('Error fetching gadgets:',error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

//POST
router.post('/',async(req,res)=>{
    try {
        const {name, status}=req.body;

        if(!name){
            return res.status(400).json({error:'Name is required'});
        }

        // using gemini-pro for generating codename

        const codename = await generateCodenameGemini();

        const newGadget = await prisma.gadget.create({
            data:{
                name,
                codename,
                status:status || 'Available',
            },
        });

        res.status(201).json(newGadget);
    } catch (error) {
        console.error('Error creating new gadget', error);
        res.status(500).json({error:"Internal server Error"})
    }
});

// patch

router.patch('/:id',async (req,res)=>{
    try {
        const {id}= req.params;
        const updates=req.body;

        const gadget = await prisma.gadget.update({
            where:{id,},
            data:updates
        });

        if(!gadget){
            return res.status(400).json({error:"gadget not found"});
        }

        res.status(200).json({success:true, gadget});
        
    } catch (error) {
        console.error("PATCH error:", error);
        res.status(500).json({ success: false, message: "Failed to update gadget." });
    }
})

// delete

router.delete('/:id', async(req,res)=>{
    try {
     const {id} = req.params;

        const gadget = await prisma.gadget.update({
            where:{id},
            data:{
                status:"Decommissioned",
                decommissionedAt: new Date()
            }
        });

        if(!gadget){
            return res.status(400).json({error:"gadget not found"});
        }

        res.status(200).json({success:true, message:"Gadget decommissioned", gadget})

        
    } catch (error) {
        console.error("DELETE error:", error);
        res.status(500).json({ success: false, message: "Failed to decommission gadget." });
    }
})

module.exports = router;
