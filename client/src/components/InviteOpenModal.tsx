import { useState } from "react"
import toast from "react-hot-toast"
import { FiX } from "react-icons/fi";

interface InviteOpenModalProps {
    event: EventObject,
    isOpen: boolean,
    setInviteOpenModal: React.Dispatch<React.SetStateAction<boolean>>,
}

export function InviteOpenModal({event, isOpen, setInviteOpenModal}:InviteOpenModalProps) {
    const [email,setEmail] = useState('')
    const id = event.id
    const title = event.title
    const description = event.description
    const type = event.type
    const timestamp = event.timestamp
    const location = event.location

    async function handleInvite(){
        try{
            if(!email) {
                toast.error('Email is empty')
                return
            }
            const token = sessionStorage.getItem('token') || undefined;
            const response = await fetch(`http://localhost:5000/events/${id}/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ? token : '',
                },
                body: JSON.stringify({
                    title,
                    description,
                    type,
                    timestamp,
                    location,
                    email
                })
            })
            if (!response.ok){
                if (response.status == 404) {
                    toast.error('User not found')
                    return
                }
                else{
                    toast.error('Request failed')
                    throw new Error("Request failed")
                }
            }
            const data = await response.json()
            window.open(data.preview, '_blank')
            setInviteOpenModal(false)
        }catch(err){
            console.log(err)
        }
    } 

    if(!isOpen){
        return
    }
    return (
        <div className="bg-gray-100 rounded-2xl border-1 border-blue-100 shadow-2xl shadow-gray-500 absolute top-1/2 left-1/6 sm:translate-x-1/2 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 flex flex-col justify-between items-center w-70 min-h-40">
            <input type="text" placeholder="Enter email" onChange={(e)=>setEmail(e.target.value)}className="text-lg font-bold text-indigo-950 bg-gray-200 border-1 rounded-xl !p-1 min-w-30 h-8.5 max-w-40 !mt-2"/>
            <FiX className="absolute top-1 right-1 cursor-pointer rounded-full bg-indigo-400" size={20} onClick={()=>setInviteOpenModal(false)}/>
            <button onClick={()=>handleInvite()} className="w-25 bg-blue-300 rounded-xl !p-1 !mb-1 flex justify-center cursor-pointer hover:bg-indigo-400">Send invite</button>
        </div>
    )
}