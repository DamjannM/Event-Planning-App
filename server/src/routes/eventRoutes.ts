import express from 'express'
import db from '../db'
import { notifyAllClients } from "../server";

interface EventQuery {
    type?: string;
    location?: string;
    search?: string;
}

const router = express.Router()

//Get all user events for user filtered by type and location
router.get("/", (req, res) => {
  const userId = req.userId!;
  const { type, location, search }: EventQuery = req.query;

  let query = `
    SELECT 
      e.*, 
      ep.role 
    FROM events e
    JOIN event_participants ep ON e.id = ep.event_id
    WHERE ep.user_id = ?
  `;
  const params: any[] = [userId];

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
});

//Get all global events for user filtered by type and location
router.get(`/all`, (req,res)=> {
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
})

//Get all events locations
router.get('/location', (req,res)=> {
    const getEvents = db.prepare('SELECT DISTINCT location FROM events')
    const events = getEvents.all()
    res.json(events)
})

//Get all events type
router.get('/type', (req,res)=> {
    const getEvents = db.prepare('SELECT DISTINCT type FROM events')
    const events = getEvents.all()
    res.json(events)
})

// create an event
router.post('/', (req,res)=> {
    const {description, title, timestamp, location, type, role} = req.body
    const userId = req.userId!

    const existing = db
    .prepare("SELECT * FROM events WHERE user_id = ? AND title = ? AND timestamp = ? AND location = ? AND type = ? AND description = ?")
    .get(userId, title, timestamp,location,type,description);

    if (existing) {
        return res.status(409).json({ message: "You already created this event" });
    }

    const insertEvent = db.prepare(`INSERT INTO events (user_id, description, title, timestamp, location, type) VALUES (?, ?, ?, ?, ?, ?)`)
    const result = insertEvent.run(req.userId!,description, title, timestamp, location, type)

    const newEvent = ({id: result.lastInsertRowid, description, title, timestamp, location, type})

    db.prepare(`INSERT INTO event_participants (event_id, user_id, role)VALUES (?, ?, ?)`).run(result.lastInsertRowid, userId, role);
    if(role == 'creator'){
        notifyAllClients("event_created", newEvent)
    }
    res.json(newEvent)
})

// join event
router.post('/join', (req,res)=> {
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
})

// update event
router.put('/:id', (req,res)=> {
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
})

//delete event
router.delete('/:id', (req,res)=> {
    const {id} = req.params
    const {role} = req.query
    const userId = req.userId!
    const deleteEvent = db.prepare(`DELETE FROM events WHERE id = ? AND user_id = ?`)
    const result = deleteEvent.run(id, userId)
    notifyAllClients("event_deleted", result)
    res.json({message: "Event deleted",
        result
    })
})

//cancle event
router.delete('/cancel/:id', (req,res)=> {
    const {id} = req.params
    const userId = req.userId!
    const cancleEvent = db.prepare(`DELETE FROM event_participants WHERE event_id = ? AND user_id = ?`)
    const result = cancleEvent.run(id, userId)
    
    res.json({message: "Event canceled",
        result
    })
})

export default router