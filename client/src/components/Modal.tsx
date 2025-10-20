import { FiX } from "react-icons/fi";
import { Button } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, {Dayjs} from 'dayjs'
import { useState } from "react";

type ModalProps = {
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    fetchEvents:() => Promise<void>,
}

export function Modal({setShowModal, fetchEvents}: ModalProps){
    const today = dayjs();
    // const tomorrow = dayjs().add(1, 'day');
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [location, setLocation] = useState('')
    const [type, setType] = useState('')
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(today)
    const timestamp = selectedDate?.valueOf()

    async function handleSubmit() {
        if (!title || !description || !location || !type || !selectedDate) 
            return (console.log(`You must fill all fields`))
        console.log(timestamp)
        try{
            const token = localStorage.getItem('token') || undefined;
            const response = await fetch(`http://localhost:5000/events`, {
                method: 'POST',
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
            setShowModal(false)
        }catch(err){
            console.log(err)
        }
    }

    return <div className="z-999 absolute top-1/2 left-1/2 flex flex-col justify-between -translate-x-1/2 -translate-y-1/2  h-96 w-2xs bg-white rounded-2xl shadow-xl shadow-gray-600 border-1 border-indigo-500 !p-2 ">
        <div>
            <button className="flex items-center justify-center p-3 bg-indigo-500 text-white rounded-full w-6 h-6 hover:bg-indigo-700 hover:cursor-pointer absolute top-2 right-2" onClick={()=> setShowModal(false)}>
            <FiX size={20}/>
            </button>
            <p className="text-xl">Create Event</p>
            <div className="flex items-center gap-1 !mb-2 ">
                <label className="text-indigo-900">Title:</label>
                <input type="text" placeholder="Title" maxLength={20} className="border-1 border-indigo-500 rounded-xl !p-1 w-full" onChange={(e)=>setTitle(e.target.value)}></input>
            </div>
            <div className="flex items-center gap-1 !mb-2 ">
                <label className="text-indigo-900">Description:</label>
                <input type="text" placeholder="Description" className="border-1 border-indigo-500 rounded-xl !p-1 w-full !focus:border-indigo-600" onChange={(e)=>setDescription(e.target.value)}></input>
            </div>
            <div className="flex items-center gap-1 !mb-2 ">
                <label className="text-indigo-900">Location:</label>
                <input type="text" placeholder="Location" className="border-1 border-indigo-500 rounded-xl !p-1 w-full" onChange={(e)=>setLocation(e.target.value)}></input>
            </div>
            <div className="flex items-center gap-1 !mb-2 ">
                <label className="text-indigo-900">Type:</label>
                <input type="text" placeholder="Type"               className="border-1 border-indigo-500 rounded-xl !p-1 w-full" onChange={(e)=>setType(e.target.value)}></input>
            </div>
            <div className="flex items-center gap-1 !mb-2 ">
                <label className="text-indigo-900">Date: </label>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker 
                onChange={(e) => setSelectedDate(e)}
                defaultValue={today}
                minDate={today}
                ampm={false} 
                views={['year', 'month', 'day', 'hours', 'minutes']}/>
                </LocalizationProvider>
            </div>
        </div>
        <div className="flex justify-center">
        <Button className="!bg-indigo-400 !text-white w-36 " onClick={handleSubmit}>Create Event</Button>
        </div>
    </div>
}