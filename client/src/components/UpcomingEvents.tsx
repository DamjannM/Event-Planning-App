import { useEffect, useState } from "react";
import { Card } from "./Card";
import {FiPlus} from 'react-icons/fi'
import { Modal } from "./Modal";

interface Event {
    id: number,
  title: string;
  description: string;
  timestamp: number;
  location: string;
  type: string;
}

export function UpcomingEvents(){
    const [openModal, setShowModal] = useState(false)
    const [events, setEvents] = useState<Event[] | null>(null) 

    const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token') || undefined;
      const response = await fetch('http://localhost:5000/events', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? token : '',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data)
    
    }catch(err){
      console.log(err)
    }
  }
  useEffect(()=>{
    fetchEvents()
  },[])
    return <>
    {openModal ? <Modal setShowModal={setShowModal} fetchEvents={fetchEvents}/> : null}
    <div className="bg-white relative text-sm sm:text-base justify-between flex flex-col w-screen !m-2 !p-2 rounded-2xl  ">
        <div className="flex justify-between !mb-2">
        <p className="text-xl font-bold text-indigo-950 ">Upcoming Events</p>
        <button
        className="flex items-center justify-center p-3 bg-indigo-500 text-white rounded-full absolute top-2 right-2 w-6 h-6 hover:bg-indigo-700 hover:cursor-pointer">
            <FiPlus onClick={()=>setShowModal(true)} size={20}/>
        </button>
        </div>
        <div className="relative overflow-visible">
            <div className="flex !gap-1.5 overflow-x-scroll scroll-hide !pb-7">
                {events?.slice()
                .sort((a, b) => a.timestamp - b.timestamp)
                .map(e => (
                    <Card key={e.id} title={e.title} description={e.description} timestamp={e.timestamp} location={e.location} type={e.type} id={e.id}/>
                ))}
            </div>
        </div>
    </div>
    </>
}