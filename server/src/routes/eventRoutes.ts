import express from 'express'
import { notifyAllClients } from "../server";
import nodemailer from 'nodemailer'
import prisma from '../prismaClient';


interface EventQuery {
    type?: string;
    location?: string;
    search?: string;
}
interface EventParticipant {
  id: number;
  status: "accepted" | "declined" | "pending";
}
interface Event {
  id: number;
  title: string;
  event_participants: EventParticipant[];
}

const router = express.Router()

//Get all event participants
router.get("/ep", async (req, res) => {
  try{
    // let query = `
    // SELECT *
    // FROM event_participants
    // `;
    // const data = db.prepare(query).all()
    const data = await prisma.eventParticipant.findMany()
    res.json(data)
  }catch(err){
    console.log(err)
    res.status(500).json({ message: "Error getting all event participants." })
  }
})

//Get all user events for user filtered by type and location
router.get("/", async (req, res) => {
  try {
    const userId = req.userId!;
    const { type, location, search }: EventQuery = req.query;
    const status = "accepted";

    const where: any = {
      event_participants: {
        some: {
          user_id: userId,
          status: status,
        },
      },
    };

    if (type && type !== "all") {
      where.type = type;
    }

    if (location && location !== "all") {
      where.location = location;
    }

    if (search && search.trim() !== "") {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { type: { contains: search, mode: "insensitive" } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        event_participants: {
          where: { user_id: userId },
          select: { role: true },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    const result = events.map((e: { event_participants: { role: any; }[]; }) => ({
      ...e,
      role: e.event_participants[0]?.role ?? null,
    }));

    res.json(result);
  } catch (err) {
    console.error("Error fetching user events:", err);
    res.status(500).json({ message: "Error getting all user events." });
  }
});

//Get all global events for user filtered by type and location
router.get("/all", async (req, res) => {
  try {
    const { type, location, search }: EventQuery = req.query;
    const where: any = {};

    if (type && type !== "all") {
      where.type = type;
    }

    if (location && location !== "all") {
      where.location = location;
    }

    if (search && search.trim() !== "") {
      const pattern = search.trim();
      where.OR = [
        { title: { contains: pattern, mode: "insensitive" } },
        { description: { contains: pattern, mode: "insensitive" } },
        { location: { contains: pattern, mode: "insensitive" } },
        { type: { contains: pattern, mode: "insensitive" } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { timestamp: "asc" }, 
    });

    res.json(events);
  } catch (err) {
    console.error("Error fetching global events:", err);
    res.status(500).json({ message: "Error getting global events." });
  }
});

//Get all events locations
router.get('/location', async (req,res)=> {
  try{
    // const getEvents = db.prepare('SELECT DISTINCT location FROM events')
    // const events = getEvents.all()
    const events = await prisma.event.findMany({
      distinct: ['location'],      
      select: { location: true },  
    });
    res.json(events)
  }catch(err){
    console.log(err)
    res.status(500).json({ message: "Error getting all event locations." })
  }
})

//Get all events type
router.get('/type', async (req,res)=> {
  try{
    const events = await prisma.event.findMany({
      distinct: ['type'],      
      select: { type: true },
    });
    res.json(events)
  }catch(err){
    console.log(err)
    res.status(500).json({ message: "Error getting all event types." })
  }
})

// create an event
router.post("/", async (req, res) => {
  try {
    const { description, title, timestamp, location, type, role } = req.body;
    const userId = req.userId!;
    const status = "accepted";

    const existing = await prisma.event.findFirst({
      where: {
        user_id: userId,
        title,
        timestamp,
        location,
        type,
        description,
      },
    });

    if (existing) {
      return res.status(409).json({ message: "You already created this event" });
    }

    const newEvent = await prisma.event.create({
      data: {
        user_id: userId,
        description,
        title,
        timestamp,
        location,
        type,
      },
    });

    await prisma.eventParticipant.create({
      data: {
        event_id: newEvent.id,
        user_id: userId,
        role,
        status,
      },
    });

    if (role === "creator") {
      notifyAllClients("event_created", newEvent);
    }

    res.json(newEvent);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ message: "Error creating event." });
  }
});

// join event
router.post("/join", async (req, res) => {
  try {
    const { id, role, status } = req.body;
    const userId = req.userId!;

    const existing = await prisma.eventParticipant.findFirst({
      where: {
        user_id: userId,
        event_id: id,
        status: "accepted",
      },
    });

    if (existing) {
      return res.status(409).json({ message: "You already joined this event" });
    }

    const participant = await prisma.eventParticipant.create({
      data: {
        event_id: id,
        user_id: userId,
        role,
        status,
      },
    });

    res.json(participant);
  } catch (err) {
    console.error("Error joining event:", err);
    res.status(500).json({ message: "Error joining event." });
  }
});

// update event
router.put("/:id", async (req, res) => {
  try {
    const { description, title, timestamp, location, type } = req.body;
    const { id } = req.params;

    const updatedEvent = await prisma.event.update({
      where: { id: Number(id) },
      data: {
        description,
        title,
        timestamp,
        location,
        type,
      },
    });

    notifyAllClients("event_updated", title);

    res.json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ message: "Error updating event." });
  }
});

//delete event
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const event = await prisma.event.findFirst({
      where: {
        id: Number(id),
        user_id: userId,
      },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found or not authorized to delete." });
    }

    const deletedEvent = await prisma.event.delete({
      where: { id: Number(id) },
    });
    notifyAllClients("event_deleted", deletedEvent);

    res.json({
      message: "Event deleted successfully",
      event: deletedEvent,
    });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ message: "Error deleting event." });
  }
});

//cancle event
router.delete("/cancel/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const participant = await prisma.eventParticipant.findFirst({
      where: {
        event_id: Number(id),
        user_id: userId,
      },
    });

    if (!participant) {
      return res.status(404).json({ message: "You are not a participant of this event." });
    }

    const deleted = await prisma.eventParticipant.delete({
      where: { id: participant.id },
    });

    res.json({
      message: "Event participation canceled successfully",
      deleted,
    });
  } catch (err) {
    console.error("Error canceling event:", err);
    res.status(500).json({ message: "Error canceling event." });
  }
});

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
  const { email, title, description, type, location, timestamp } = req.body;
  const userId = req.userId!;

  try {
    const isCreator = await prisma.eventParticipant.findFirst({
      where: {
        event_id: Number(id),
        user_id: userId,
        role: "creator",
      },
    });

    if (!isCreator) {
      return res.status(403).json({ message: "Only creators can send invites." });
    }

    const invitedUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!invitedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const existingInvite = await prisma.eventParticipant.findFirst({
      where: {
        event_id: Number(id),
        user_id: invitedUser.id,
      },
    });

    if (existingInvite) {
      return res.status(409).json({ message: "User already invited to this event." });
    }

    await prisma.eventParticipant.create({
      data: {
        event_id: Number(id),
        user_id: invitedUser.id,
        role: "visitor",
        status: "pending",
      },
    });

    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const baseUrl = "http://localhost:5000";
    const acceptUrl = `${baseUrl}/invite/accept?event=${id}&user=${invitedUser.id}`;
    const declineUrl = `${baseUrl}/invite/decline?event=${id}&user=${invitedUser.id}`;

    const info = await transporter.sendMail({
      from: '"Event Planner" <no-reply@eventapp.com>',
      to: email,
      subject: "You’ve been invited to an event!",
      html: `
        <h3>📅 Event Invitation</h3>
        <p>You’ve been invited to join the event: <b>${title}</b>.</p>
        <p>${description}</p>
        <p><b>Location:</b> ${location}</p>
        <p><b>Type:</b> ${type}</p>
        <p><b>Date:</b> ${new Date(timestamp).toLocaleString()}</p>
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
    console.error("Error sending invitation:", err);
    res.status(500).json({ message: "Error sending invitation." });
  }
});

//OVERVIEW
router.get("/attendance", async (req, res) => {
  const userId = req.userId!;
  try {
    const events = await prisma.event.findMany({
      where: { user_id: userId },
      include: {
        event_participants: {
          where: { role: "visitor" },
          select: { status: true },
        },
      },
      orderBy: { timestamp: "desc" },
    });

    const result = events.map((e: Event) => {
      const total_invited = e.event_participants.length;
      const accepted = e.event_participants.filter((p: EventParticipant) => p.status === "accepted").length;
      const declined = e.event_participants.filter((p: EventParticipant) => p.status === "declined").length;
      const pending = e.event_participants.filter((p: EventParticipant) => p.status === "pending").length;
;

      const attendance_rate =
        total_invited > 0 ? parseFloat(((accepted * 100) / total_invited).toFixed(1)) : 0.0;

      return {
        event_id: e.id,
        title: e.title,
        total_invited,
        accepted,
        declined,
        pending,
        attendance_rate,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Error fetching attendance data:", err);
    res.status(500).json({ message: "Error fetching attendance overview." });
  }
});

export default router