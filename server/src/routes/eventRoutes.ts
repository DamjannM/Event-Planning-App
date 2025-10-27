import express from 'express'
import db from '../db'
import { notifyAllClients } from "../server";

interface EventQuery {
    type?: string;
    location?: string;
    search?: string;
}

const router = express.Router()

//Get all events filtered by type and location
router.get(`/`, (req,res)=> {
    const {type,location,search}:EventQuery = req.query
    let query ='SELECT * FROM events WHERE user_id = ? '
    let params:any[] = [req.userId!]

    if (type && type !== "all") {
    query += " AND type = ?";
    params.push(type);
  }

  if (location && location !== "all") {
    query += " AND location = ?";
    params.push(location);
  }
  if (search && search.trim() !== "") {
    query += " AND (title LIKE ? OR description LIKE ? OR location LIKE ? OR type LIKE ?)";
    const pattern = `%${search}%`;
    params.push(pattern, pattern, pattern, pattern);
  }
    const getEvents = db.prepare(query)
    const events = getEvents.all(...params)
    res.json(events)
})

//Get all events locations
router.get('/location', (req,res)=> {
    const getEvents = db.prepare('SELECT DISTINCT location FROM events WHERE user_id = ?')
    const events = getEvents.all(req.userId!)
    res.json(events)
})

//Get all events type
router.get('/type', (req,res)=> {
    const getEvents = db.prepare('SELECT DISTINCT type FROM events WHERE user_id = ?')
    const events = getEvents.all(req.userId!)
    res.json(events)
})

// create an event
router.post('/', (req,res)=> {
    const {description, title, timestamp, location, type} = req.body
    const insertEvent = db.prepare(`INSERT INTO events (user_id, description, title, timestamp, location, type) VALUES (?, ?, ?, ?, ?, ?)`)
    const result = insertEvent.run(req.userId!,description, title, timestamp, location, type)

    const newEvent = ({id: result.lastInsertRowid, description, title, timestamp, location, type})
    notifyAllClients("event_created", newEvent)
    res.json(newEvent)
})

// update event
router.put('/:id', (req,res)=> {
    const {description,title, timestamp, location, type} = req.body
    const {id} = req.params

    const updatedEvent = db.prepare(`UPDATE events SET description = ?, title =?, timestamp = ?, location = ?, type = ? WHERE id = ?`)
    const result = updatedEvent.run(description,title, timestamp, location, type, id)
    notifyAllClients("event_updated", result)

    res.json({message: "Event updated"})
})

//delete event
router.delete('/:id', (req,res)=> {
    const {id} = req.params
    const userId = req.userId!
    const deleteEvent = db.prepare(`DELETE FROM events WHERE id = ? AND user_id = ?`)
    const result = deleteEvent.run(id, userId)
    notifyAllClients("event_deleted", result)
    res.json({message: "Event deleted"})
})

export default router