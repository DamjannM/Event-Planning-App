import express from 'express'
import { notifyAllClients } from "../server";
import prisma from '../prismaClient';

const router = express.Router()

router.get("/:action", async (req, res) => {
  try{
    const { action } = req.params;
    const eventId = Number(req.query.event); 
    const userId = Number(req.query.user);
    
    if (!["accept", "decline"].includes(action)) {
      return res.status(400).json({ message: "Invalid action." });
    }
    
    const status = action === "accept" ? 'accepted' : 'declined';
    await prisma.eventParticipant.update({
      where: {
        event_id_user_id: {
          event_id: eventId,
          user_id: userId,
        },
      },
      data: {
        status: status,
      },
    });
    
    if (status == 'accepted' || status=='declined'){
      notifyAllClients("invite_answer", 'refresh')
    }
    res.send(`<h3>✅ Invitation ${status}!</h3><p>You can now close this tab.</p>`);
  }catch(err){
    console.log(err)
    res.status(500).json({ message: "Error while sending invite." })
  }
});

export default router