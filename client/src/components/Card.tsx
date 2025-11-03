import toast from "react-hot-toast"
import { BsCalendarPlus } from "react-icons/bs"

interface CardProps {
    event: EventObject,
    fetchUserEvents: ()=> void
}

export function Card({event, fetchUserEvents}: CardProps){
    const date = new Date(event.timestamp)
    const day = date.getDate()
    const month = date.getMonth()
    const year = date.getFullYear()
    const hour = date.getHours()
    const minute = date.getMinutes()
    let slicedDescription = event.description
    if (event.description.length > 50) {
        slicedDescription = event.description.slice(0,50)+ `...`
    }

    async function joinEvent() {
        try{
            const token = sessionStorage.getItem('token') || undefined;
            const response = await fetch(`http://localhost:5000/events/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ? token : '',
                },
                body: JSON.stringify({
                    id: event.id,
                    role: 'visitor',
                    status: 'accepted'
                })
            })
            if (response.status==409){
                toast.error(`You already joined this event`)
                throw new Error(`Error: ${response.status}`);
            }
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            console.log(data);
            fetchUserEvents()
        }catch(err){
            console.log(err)
        }
    }

    return <div className="h-60 min-h-60 min-w-54 w-54 bg-gray-50 relative flex flex-col justify-between rounded-2xl !p-3 border-1 border-blue-300 shadow-lg shadow-gray-500 overflow-hidden">
        <div className="flex flex-col justify-between">
            <div className="flex justify-between items-center">
                <p className=" text-lg text-indigo-900 font-bold">{event.title}</p>
                <BsCalendarPlus className="cursor-pointer " onClick={()=>joinEvent()}/>
            </div>
        <p className="text-left  text-lg text-indigo-900 leading-tight">{slicedDescription}</p>
        </div>
        <div className="flex flex-col justify-between text-lg text-indigo-900">
            <div>
                <p className="text-left  text-lg text-indigo-900 leading-tight">{event.type}</p>
                <p className=" leading-tight text-left text-lg text-indigo-900">{event.location}</p>
            </div>
            <div className="flex justify-between">
                <p>{day}.{month+1}.{year}.</p>
                <p>{(hour<10) ? `0`+ hour : hour}:{(minute <10)? `0`+minute : minute}</p>
            </div>
        </div>
    </div>
}