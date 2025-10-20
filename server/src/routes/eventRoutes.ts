import express from 'express'
import db from '../db'

const router = express.Router()

//Get all events
router.get('/', (req,res)=> {
    const getEvents = db.prepare('SELECT * FROM events WHERE user_id = ?')
    const events = getEvents.all(req.userId!)
    res.json(events)
})

// create an event
router.post('/', (req,res)=> {
    const {description, title, timestamp, location, type} = req.body
    const insertEvent = db.prepare(`INSERT INTO events (user_id, description, title, timestamp, location, type) VALUES (?, ?, ?, ?, ?, ?)`)
    const result = insertEvent.run(req.userId!,description, title, timestamp, location, type)

    res.json({id: result.lastInsertRowid, description, title, timestamp, location, type})
})

// update event
router.put('/:id', (req,res)=> {
    const {description,title, timestamp, location, type} = req.body
    const {id} = req.params

    const updatedEvent = db.prepare(`UPDATE events SET description = ?, title =?, timestamp = ?, location = ?, type = ? WHERE id = ?`)
    const result = updatedEvent.run(description,title, timestamp, location, type, id)

    res.json({message: "Event updated"})
})

//delete event
router.delete('/:id', (req,res)=> {
    const {id} = req.params
    const userId = req.userId!
    const deleteEvent = db.prepare(`DELETE FROM events WHERE id = ? AND user_id = ?`)
    deleteEvent.run(id, userId)
    res.json({message: "Event deleted"})
})

export default router