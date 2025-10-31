import express from 'express'
import db from '../db'
import { notifyAllClients } from "../server";

const router = express.Router()

router.get("/:action", (req, res) => {
  try{
    const { action } = req.params;
    const eventId = Number(req.query.event); 
    const userId = Number(req.query.user);
    
    if (!["accept", "decline"].includes(action)) {
      return res.status(400).json({ message: "Invalid action." });
    }
    
    const status = action === "accept" ? 'accepted' : 'declined';
    db.prepare(
      "UPDATE event_participants SET status = ? WHERE event_id = ? AND user_id = ?"
    ).run(status, eventId, userId);
    
    if (status == 'accepted'){
      notifyAllClients("invite_accepted", 'refresh')
    }
    res.send(`<h3>✅ Invitation ${status}!</h3><p>You can now close this tab.</p>`);
  }catch(err){
    console.log(err)
    res.status(500).json({ message: "Error while sending invite." })
  }
});

export default router