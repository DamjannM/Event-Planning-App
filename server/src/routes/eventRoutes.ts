import express from 'express'
import db from '../db'
import { notifyAllClients } from "../server";
import nodemailer from 'nodemailer'

interface EventQuery {
    type?: string;
    location?: string;
    search?: string;
}

const router = express.Router()

//Get all event participants
router.get("/ep", (req, res) => {
  try{
    const userId = req.userId!;
    
    let query = `
    SELECT *
    FROM event_participants
    `;
    
    const data = db.prepare(query).all()
    res.json(data)
  }catch(err){
    console.log(err)
    res.status(500).json({ message: "Error getting all event participants." })
  }
})

//Get all user events for user filtered by type and location
router.get("/", (req, res) => {
  try{
    const userId = req.userId!;
    const { type, location, search }: EventQuery = req.query;
    const status = 'accepted'
    
    let query = `
    SELECT 
    e.*, 
    ep.role 
    FROM events e
    JOIN event_participants ep ON e.id = ep.event_id
    WHERE ep.user_id = ? AND ep.status = ?
    `;
  const params: any[] = [userId, status];
  
  if (type && type !== "all") {
    query += " AND e.type = ?";
    params.push(type);
  }
  
  if (location && location !== "all") {
    query += " AND e.location = ?";
    params.push(location);
  }
  
  if (search && search.trim() !== "") {
    query +=
    " AND (e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ? OR e.type LIKE ?)";
    const pattern = `%${search}%`;
    params.push(pattern, pattern, pattern, pattern);
  }
  
  const getEvents = db.prepare(query);
  const events = getEvents.all(...params);
  
  res.json(events);
}catch(err){
  console.log(err)
  res.status(500).json({ message: "Error getting all user events." })
}
});

//Get all global events for user filtered by type and location
router.get(`/all`, (req,res)=> {
  try{
    const {type,location,search}:EventQuery = req.query
    let query ='SELECT * FROM events'
    let params:any[] = []
    
    if (type && type !== "all") {
      (params.length==0) ? query+=' WHERE type = ?' : query += " AND type = ?"
      params.push(type);
    }
    
    if (location && location !== "all") {
      (params.length==0) ? query+=' WHERE location = ?' : query += " AND location = ?"
      params.push(location);
    }
    
    if (search && search.trim() !== "") {
      (params.length==0) 
      ? query+=' WHERE (title LIKE ? OR description LIKE ? OR location LIKE ? OR type LIKE ?)'
    :query += " AND (title LIKE ? OR description LIKE ? OR location LIKE ? OR type LIKE ?)"
    const pattern = `%${search}%`;
    params.push(pattern, pattern, pattern, pattern);
  }
  const getEvents = db.prepare(query)
  const events = getEvents.all(...params)
  res.json(events)
}catch(err){
  console.log(err)
  res.status(500).json({ message: "Error getting global events." })
}
})

//Get all events locations
router.get('/location', (req,res)=> {
  try{
    const getEvents = db.prepare('SELECT DISTINCT location FROM events')
    const events = getEvents.all()
    res.json(events)
  }catch(err){
    console.log(err)
    res.status(500).json({ message: "Error getting all event locations." })
  }
})

//Get all events type
router.get('/type', (req,res)=> {
  try{
    const getEvents = db.prepare('SELECT DISTINCT type FROM events')
    const events = getEvents.all()
    res.json(events)
  }catch(err){
    console.log(err)
    res.status(500).json({ message: "Error getting all event types." })
  }
})

// create an event
router.post('/', (req,res)=> {
  try{
    const {description, title, timestamp, location, type, role} = req.body
    const userId = req.userId!
    const status = 'accepted'
    
    const existing = db
    .prepare("SELECT * FROM events WHERE user_id = ? AND title = ? AND timestamp = ? AND location = ? AND type = ? AND description = ?")
    .get(userId, title, timestamp,location,type,description);
    
    if (existing) {
      return res.status(409).json({ message: "You already created this event" });
    }
    
    const insertEvent = db.prepare(`INSERT INTO events (user_id, description, title, timestamp, location, type) VALUES (?, ?, ?, ?, ?, ?)`)
    const result = insertEvent.run(req.userId!,description, title, timestamp, location, type)
    
    const newEvent = ({id: result.lastInsertRowid, description, title, timestamp, location, type})
    
    db.prepare(`INSERT INTO event_participants (event_id, user_id, role, status)VALUES (?, ?, ?, ?)`).run(result.lastInsertRowid, userId, role, status);
    if(role == 'creator'){
      notifyAllClients("event_created", newEvent)
    }
    res.json(newEvent)
  }catch(err){
    console.log(err)
    res.status(500).json({ message: "Error creating event." })
  }
})

// join event
router.post('/join', (req,res)=> {
  try{
    const {id , role} = req.body
    const userId = req.userId!
    
    const existing = db
    .prepare("SELECT * FROM event_participants WHERE user_id = ? AND event_id = ?")
    .get(userId, id);
    
    if (existing) {
      return res.status(409).json({ message: "You already joined this event" });
    }
    
    const event =db.prepare(`INSERT INTO event_participants (event_id, user_id, role) VALUES (?, ?, ?)`).run(id, userId, role);
    res.json(event)
  }catch(err){
    console.log(err)
    res.status(500).json({ message: "Error joining event." })
  }
})

// update event
router.put('/:id', (req,res)=> {
  try{
    const {description,title, timestamp, location, type} = req.body
    const {id} = req.params
    
    const updatedEvent = db.prepare(`UPDATE events SET description = ?, title =?, timestamp = ?, location = ?, type = ? WHERE id = ?`)
    const result = updatedEvent.run(description,title, timestamp, location, type, id)
    notifyAllClients("event_updated", title)
    
    res.json({
      message: "Event updated",
      title
    }
  )
}catch(err){
  console.log(err)
  res.status(500).json({ message: "Error updating event." })
}
})

//delete event
router.delete('/:id', (req,res)=> {
  try{
    const {id} = req.params
    const userId = req.userId!
    const deleteEvent = db.prepare(`DELETE FROM events WHERE id = ? AND user_id = ?`)
    const result = deleteEvent.run(id, userId)
    notifyAllClients("event_deleted", result)
    res.json({message: "Event deleted",
      result
    })
  }catch(err){
    console.log(err)
    res.status(500).json({ message: "Error deleting event." })
  }
})

//cancle event
router.delete('/cancel/:id', (req,res)=> {
  try{
    const {id} = req.params
    const userId = req.userId!
    const cancleEvent = db.prepare(`DELETE FROM event_participants WHERE event_id = ? AND user_id = ?`)
    const result = cancleEvent.run(id, userId)
    
    res.json({message: "Event canceled",
      result
    })
  }catch(err){
    console.log(err)
    res.status(500).json({ message: "Error canceling event." })
  }
})

//EMAIL
async function createTestTransporter() {
  const testAccount = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

router.post("/:id/invite", async (req, res) => {
  const { id } = req.params; 
  const { email,title,description,type,location,timestamp } = req.body; 
  const userId = req.userId!; 

  try {
    const isCreator = db.prepare(`
      SELECT role FROM event_participants
      WHERE event_id = ? AND user_id = ?
    `).get(id, userId);

    if (!isCreator || isCreator.role !== "creator") {
      return res.status(403).json({ message: "Only creators can send invites." });
    }

    const invitedUser = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email);
    if (!invitedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    db.prepare(`
      INSERT INTO event_participants (event_id, user_id, role, status)
      VALUES (?, ?, 'visitor', 'pending')
    `).run(id, invitedUser.id);

    const transporter = await createTestTransporter();

    const baseUrl = "http://localhost:5000";
    const acceptUrl = `${baseUrl}/invite/accept?event=${id}&user=${invitedUser.id}`;
    const declineUrl = `${baseUrl}/invite/decline?event=${id}&user=${invitedUser.id}`;

    const info = await transporter.sendMail({
      from: '"Event Planner" <no-reply@eventapp.com>',
      to: email,
      subject: "You’ve been invited to an event!",
      html: `
        <h3>📅 Event Invitation</h3>
        <p>You’ve been invited to join an event ${title}.</p>
        <p>${description}</p>
        <p>${location}</p>
        <p>${type}</p>
        <p>${new Date(timestamp)}</p>
        <a href="${acceptUrl}">✅ Accept</a> |
        <a href="${declineUrl}">❌ Decline</a>
      `,
    });

    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    res.json({
      message: "Invitation sent successfully!",
      preview: nodemailer.getTestMessageUrl(info),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending invitation." });
  }
});


export default router