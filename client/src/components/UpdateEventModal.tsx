import { FiX } from "react-icons/fi";
import { Button } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useEffect, useState } from "react";
import dayjs, { Dayjs } from 'dayjs'

type UpdateEventModalProps = {
    isOpen: boolean,
    event: EventObject
    setShowUpdateModal: React.Dispatch<React.SetStateAction<boolean>>,
    fetchEvents:()=>void
    fetchEventLocations:()=>void
    fetchEventTypes:()=>void
}

export function UpdateEventModal({isOpen,event,setShowUpdateModal,fetchEvents, fetchEventTypes, fetchEventLocations}:UpdateEventModalProps){
    const today = dayjs();
    const [title, setTitle] = useState(event.title)
    const [description, setDescription] = useState(event.description)
    const [location, setLocation] = useState(event.location)
    const [type, setType] = useState(event.type)
    const date = dayjs(event.timestamp)
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs(event.timestamp))
    const timestamp = selectedDate?.valueOf()

    async function handleUpdate(id:number) {
        if (!title || !description || !location || !type || !selectedDate) 
            return (console.log(`You must fill all fields`))
        try{
            const token = localStorage.getItem('token') || undefined;
            const response = await fetch(`http://localhost:5000/events/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ? token : '',
                },
                body: JSON.stringify({
                    title,
                    description,
                    location,
                    type,
                    timestamp
                })
            })
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            console.log(data);
            fetchEvents()
            fetchEventLocations()
            fetchEventTypes()
            setShowUpdateModal(false)
        }catch(err){
            console.log(err)
        }
    }

    useEffect(()=>{
        if(event){
            setDescription(event.description)
            setTitle(event.title)
            setLocation(event.location)
            setType(event.type)
            setSelectedDate(dayjs(event.timestamp))
        }
},[event])

    if(!isOpen){
        return
    }
    return <div className="text-indigo-950 z-999 absolute top-1/2 left-1/2 flex flex-col justify-between -translate-x-1/2 -translate-y-1/2  h-96 w-2xs bg-white rounded-2xl shadow-xl shadow-gray-600 border-1 border-indigo-500 !p-2 ">
        <div>
            <button className="flex items-center justify-center p-3 bg-indigo-500 text-white rounded-full w-6 h-6 hover:bg-indigo-700 
            hover:cursor-pointer absolute top-2 right-2" 
            onClick={()=> setShowUpdateModal(false)}>
            <FiX size={20}/>
            </button>
            <p className="text-xl">Update Event</p>
            <div className="flex items-center gap-1 !mb-2 ">
                <label className="text-indigo-900">Title:</label>
                <input type="text" required placeholder="Title" maxLength={20} className="border-1 border-indigo-500 rounded-xl !p-1 w-full" 
                onChange={(e)=>setTitle(e.target.value)}
                value={title}></input>
            </div>
            <div className="flex items-center gap-1 !mb-2 ">
                <label className="text-indigo-900">Description:</label>
                <input type="text" required placeholder="Description" className="border-1 border-indigo-500 rounded-xl !p-1 w-full !focus:border-indigo-600" 
                onChange={(e)=>setDescription(e.target.value)}
                value={description}></input>
            </div>
            <div className="flex items-center gap-1 !mb-2 ">
                <label className="text-indigo-900">Location:</label>
                <input type="text" required placeholder="Location" className="border-1 border-indigo-500 rounded-xl !p-1 w-full" 
                onChange={(e)=>setLocation(e.target.value)}
                value={location}></input>
            </div>
            <div className="flex items-center gap-1 !mb-2 ">
                <label className="text-indigo-900">Type:</label>
                <input type="text" placeholder="Type" required className="border-1 border-indigo-500 rounded-xl !p-1 w-full" 
                onChange={(e)=>setType(e.target.value)}
                value={type}></input>
            </div>
            <div className="flex items-center gap-1 !mb-2 ">
                <label className="text-indigo-900">Date: </label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker 
                onChange={(e) => setSelectedDate(e)}
                defaultValue={date}
                minDate={today}
                ampm={false} 
                views={['year', 'month', 'day', 'hours', 'minutes']}/>
                </LocalizationProvider>
            </div>
        </div>
        <div className="flex justify-center">
        <Button className="!bg-indigo-400 !text-white w-36 " onClick={()=>handleUpdate(event.id)}>Update Event</Button>
        </div>
    </div>
}