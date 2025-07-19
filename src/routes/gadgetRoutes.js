const express = require('express');
const router = express.Router();
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient();
const {generateCodenameGemini}= require('../utils/gemini');
const authenticate = require('../middleware/authMiddleware');

// lets generate random success probabillity 
const getRandomSuccessProbability = ()=>{
    return `${Math.floor(Math.random()*51)+50}% sucsess probability`;
}

// GET route for fetching all gadgets and with filter status 

router.get('/',authenticate,async(req,res)=>{
    try {
        const {status}= req.query;

        const gadgets = await prisma.gadget.findMany({
            where: status ? {status}: {},
            orderBy:{createdAt:'desc'}
        })

        const gadgetWithSuccess=gadgets.map((gadget)=>({
            ...gadget,
            missionSuccessProbability:getRandomSuccessProbability(),
        }))

        if(gadgets.length === 0){
            return res.status(400).json({error:"gadgets not found"});
        }

        res.status(201).json({gadgetWithSuccess});
    } catch (error) {
        console.error("cannot get gadgets", error);
        res.status(500).json({ success: false, message: "Failed to fetch gadgets" });
    }
})

//POST
router.post('/',authenticate,async(req,res)=>{
    try {
        const {name, status}=req.body;

        if(!name){
            return res.status(400).json({error:'Name is required'});
        }

        // unique code name check

        const codename = await generateCodenameGemini(name);
        
    
        console.log("codename",codename)

        const newGadget = await prisma.gadget.create({
            data:{
                name,
                codename,
                status:status || 'Available',
            },
        });

        res.status(201).json({success:true, newGadget});
    } catch (error) {
        console.error('Error creating new gadget', error);
        res.status(500).json({error:"Internal server Error"})
    }
});

// patch

router.patch('/:id',authenticate,async (req,res)=>{
    try {
        const {id}= req.params;
        const updates=req.body;

        const checkGadget= await prisma.gadget.findUnique({
            where:{id}
        })

        // Chechk is Gadget exists

        if(!checkGadget){
            return res.status(404).json("Gadget not found");
        }

        const gadget = await prisma.gadget.update({
            where:{id,},
            data:updates
        });

        
        res.status(200).json({success:true, gadget});
        
    } catch (error) {
        console.error("PATCH error:", error);
        res.status(500).json({ success: false, message: "Failed to update gadget." });
    }
})

// delete

router.delete('/:id',authenticate, async(req,res)=>{
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

// post self-destruct route

router.post("/:id/self-destruct",authenticate ,async(req,res)=>{
    const {id} = req.params;

    try {
        //---confirmation code generation here
        const confirmationCode=`CONF-${Math.floor(Math.random()*900000)+100000}`

        const gadget = await prisma.gadget.update({
            where:{id},
            data:{
                status:"Decommissioned",
                decommissionedAt: new Date(),
            }
        });

        //optional error check
        if(!gadget){
            return res.status(400).json({error:"gadget not found"});
        }

        res.status(200).json({success:true,
            message:"Self-destruct is triggered",
            confirmationCode,
            gadget,
        })



    } catch (error) {
        console.error("Self-destruct error:", error);
        res.status(500).json({ success: false, message: "Failed to trigger self-destruct." });
  
    }
    
})

module.exports = router;
