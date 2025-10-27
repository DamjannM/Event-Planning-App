import { FaXmark } from "react-icons/fa6";

type DetailsModalProps = {
    isOpen: boolean
    events: EventObject
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    monthsOfYear: string[]
}

export function DetailsModal({events,setShowModal, isOpen, monthsOfYear}:DetailsModalProps){
    const day = new Date(events.timestamp)
    const hours = (day.getHours()<10)? "0"+day.getHours() : day.getHours()
    const minutes = (day.getMinutes()<10)? "0"+day.getMinutes() : day.getMinutes()
    if(!isOpen){
        return
    }
    
    return (
        <div className="bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[50vh] min-w-[50vw] w-[75vw] sm:w-[50vw] rounded-2xl border-1 border-blue-200 shadow-2xl flex flex-col justify-between">
            <div>
                <p className="text-indigo-950 text-2xl md:text-3xl font-bold !mr-6">{events.title} </p>
                <p className="text-indigo-950 text-lg md:text-xl lg:text-2xl !mr-6">{events.type}</p>
            </div>
            <p className="text-indigo-950 text-lg !mr-6">{events.description}</p>
            <div className="flex justify-between !m-3">
                <p className="text-indigo-950 md:text-xl lg:text-2xl">{events.location}</p>
                <div className="flex gap-3">
                <p className="text-indigo-950 md:text-xl lg:text-2xl">{day.getDate()}. {monthsOfYear[day.getMonth()+1]} {day.getFullYear()}.</p>
                <p className="text-indigo-950 md:text-xl lg:text-2xl flex items-center">{hours}:{minutes}</p>
                </div>
            </div>
            <FaXmark className="text-white bg-indigo-500 hover:bg-indigo-600 absolute text-2xl font-bold top-1 right-1 cursor-pointer rounded-full" onClick={()=>setShowModal(false)}/>
        </div>
    )
}