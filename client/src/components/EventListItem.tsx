import { useState } from "react"
import { FaPen, FaTrashAlt } from "react-icons/fa"
import { DetailsModal } from "./DetailsModal"
import { UpdateEventModal } from "./UpdateEventModal"

type EventListItemProps = {
  event: EventObject,
  fetchEvents: ()=>void,
  fetchEventTypes: ()=>void,
  fetchEventLocations: ()=>void,
}

export function EventListItem({event,fetchEvents,fetchEventTypes,fetchEventLocations}:EventListItemProps){
    const date = new Date(event.timestamp)
    const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const [showModal, setShowModal] = useState(false)
    const [showUpdateModal, setShowUpdateModal] = useState(false)
    
    async function handleDelete(id:number){
        try{
            const token = localStorage.getItem('token') || undefined;
            const response = await fetch(`http://localhost:5000/events/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: token ? token : '',
                }
            })
            console.log(response)
            fetchEvents()
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
            <div className="flex flex-col !m-2 text-2xl gap-5 justify-center cursor-pointer"><FaTrashAlt onClick={()=>(handleDelete(event.id), fetchEventLocations(),fetchEventTypes())}/><FaPen onClick={()=>setShowUpdateModal(true)}/></div>
        </div>
        <DetailsModal events={event} setShowModal={setShowModal} isOpen={showModal} monthsOfYear={monthsOfYear}/>
        <UpdateEventModal isOpen={showUpdateModal} setShowUpdateModal={setShowUpdateModal} event={event} fetchEvents={fetchEvents}/>
        </>
    )
}