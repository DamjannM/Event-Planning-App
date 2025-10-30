import { useState } from "react"
import { FaPen, FaTrashAlt } from "react-icons/fa"
import { FaXmark } from "react-icons/fa6";
import { DetailsModal } from "./DetailsModal"
import { UpdateEventModal } from "./UpdateEventModal"
import { toast } from "react-hot-toast";

type EventListItemProps = {
  event: EventObject,
  fetchEvents: ()=>void,
  fetchUserEvents: ()=> void,
  fetchEventTypes: ()=>void,
  fetchEventLocations: ()=>void,
}

export function EventListItem({event,fetchEvents,fetchUserEvents, fetchEventTypes,fetchEventLocations}:EventListItemProps){
    const date = new Date(event.timestamp)
    const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const [showModal, setShowModal] = useState(false)
    const [showUpdateModal, setShowUpdateModal] = useState(false)
    
    async function handleDelete(id:number){
        try{
            const token = sessionStorage.getItem('token') || undefined;
            const response = await fetch(`http://localhost:5000/events/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: token ? token : '',
                }
            })
            console.log(response)
            fetchEvents()
            fetchUserEvents()
            fetchEventLocations()
            fetchEventTypes()
            
        }
        catch(err){
        console.log(err)
        }
    }

    async function cancleEvent(id:number){
        try{
            const token = sessionStorage.getItem('token') || undefined;
            const response = await fetch(`http://localhost:5000/events/cancel/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: token ? token : '',
                }
            })
            console.log(response)
            if (response.ok) toast.success(`Event canceled`)
            fetchEvents()
            fetchUserEvents()
            fetchEventLocations()
            fetchEventTypes()
        }
        catch(err){
        console.log(err)
        }
    }

    return(
        <>
        <div className=" bg-blue-300 h-20 !m-2 rounded-2xl flex justify-between">
            <div onClick={()=>setShowModal(true)} className="cursor-pointer flex flex-col !m-2 text-sm justify-center !pr-2 border-r-1">
                <p>{date.getDate()} {monthsOfYear[date.getMonth()]}</p>
                <p className="text-lg">{(date.getHours()<10)? '0'+date.getHours(): date.getHours()}:{(date.getMinutes()<10)? '0'+date.getMinutes(): date.getMinutes()}</p>
            </div>
            <div onClick={()=>setShowModal(true)} className="cursor-pointer flex text-3xl items-center w-10/12 justify-center">{event.title}</div>
            <div className="flex flex-col !m-2 text-2xl gap-5 justify-center cursor-pointer">{(event.role == 'creator')
            ?<><FaTrashAlt onClick={() => handleDelete(event.id)} /><FaPen onClick={() => setShowUpdateModal(true)} /></> 
            :<FaXmark onClick={()=> cancleEvent(event.id)}/>}</div>
        </div>
        <DetailsModal events={event} setShowModal={setShowModal} isOpen={showModal} monthsOfYear={monthsOfYear}/>
        <UpdateEventModal isOpen={showUpdateModal} setShowUpdateModal={setShowUpdateModal} event={event} fetchEvents={fetchEvents} fetchUserEvents={fetchUserEvents} fetchEventTypes={fetchEventTypes} fetchEventLocations={fetchEventLocations}/>
        </>
    )
}