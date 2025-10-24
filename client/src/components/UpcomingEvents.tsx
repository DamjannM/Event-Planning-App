import { useCallback, useEffect, useState } from "react";
import { Card } from "./Card";
import {FiPlus} from 'react-icons/fi'
import { CreateEventModal } from "./CreateEventModal";
import dayjs from "dayjs";
import { Calendar } from "./Calendar";
import { EventList } from "./EventList";

interface EventItem {
    id: number,
  title: string;
  description: string;
  timestamp: number;
  location: string;
  type: string;
  user_id: number
}

export function UpcomingEvents(){
    const [openModal, setShowModal] = useState(false)
    const [events, setEvents] = useState<EventItem[] | []>([]) 
    const [eventTypes,setEventTypes] = useState([])
    const [eventLocations,setEventLocations] = useState([])
    
    const currentDate = dayjs()
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    
    const [currentMonth,setCurrentMonth]= useState(currentDate.month())
    const [currentYear,setCurrentYear]= useState(currentDate.year())
    const [selectedDay, setSelectedDay]= useState(currentDate.date())
    const [selectedMonth, setSelectedMonth] = useState(currentMonth)
    const [selectedYear, setSelectedYear] = useState(currentYear)
    const [typeFilter, setTypeFilter] = useState('all')
    const [locationFilter, setLocationFilter] = useState('all')

    const token = localStorage.getItem('token') || undefined;
    
    const fetchEvents = useCallback(async () => {
      try {
        const response = await fetch(`http://localhost:5000/events?type=${typeFilter}&location=${locationFilter}`, {
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
    },[token,typeFilter,locationFilter]
  )

    const fetchEventLocations = useCallback(async () => {
      try {
        const response = await fetch('http://localhost:5000/events/location', {
          headers: {
            Authorization: token ? token : '',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEventLocations(data.map((item:{location:string})=>item.location))
        
      }catch(err){
        console.log(err)
      }
    },[token]
  )

    const fetchEventTypes = useCallback(async () => {
      try {
        const response = await fetch('http://localhost:5000/events/type', {
          headers: {
            Authorization: token ? token : '',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEventTypes(data.map((item:{type:string})=>item.type))
        
      }catch(err){
        console.log(err)
      }
    },[token]
  )
    
    const daysWithEvents = events!.map((e:EventItem)=> ({day: dayjs(e.timestamp).date(),month: dayjs(e.timestamp).month(),year: dayjs(e.timestamp).year()}))
    
    useEffect(()=>{
      fetchEvents()
      fetchEventLocations()
      fetchEventTypes()
    },[fetchEventLocations, fetchEventTypes, fetchEvents])

  return <>
    {openModal ? <CreateEventModal setShowModal={setShowModal} fetchEvents={fetchEvents} fetchEventTypes={fetchEventTypes} fetchEventLocations={fetchEventLocations}/> : null}
    <div className="min-h-80 bg-transparent relative text-sm sm:text-base justify-between flex flex-col !m-2 rounded-2xl  ">
      <div className="flex flex-col sm:flex-row !mb-2 gap-2 items-start sm:items-center">
        <p className="text-xl font-bold text-indigo-950 ">Upcoming Events</p>
        <div className="items-center md:flex gap-2">
          <label className="text-indigo-950 text-lg">Filter by type: </label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} 
          className="text-lg font-bold text-indigo-950 bg-gray-200 border-1 rounded-xl !p-1 min-w-30">
            <option key={'all'} value={'all'}>All</option>
            {eventTypes.map((type:string)=><option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div className="items-center md:flex gap-2">
          <label className="text-indigo-950 text-lg">Filter by location: </label>
          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} 
          className="text-lg font-bold text-indigo-950 bg-gray-200 border-1 rounded-xl !p-1 min-w-30">
            <option key={'all'} value={'all'}>All</option>
            {eventLocations.map((location:string)=><option key={location} value={location}>{location}</option>)}
          </select>
        </div>
        <button
        className="flex items-center justify-center p-3 bg-indigo-500 text-white rounded-full absolute top-2 right-2 w-6 h-6 hover:bg-indigo-700 hover:cursor-pointer">
            <FiPlus onClick={()=>setShowModal(true)} size={20}/>
        </button>
        </div>
        <div className="relative overflow-visible">
            <div className="flex !gap-1.5 overflow-x-scroll scroll-hide !pb-7">
                {events?.slice()
                .sort((a, b) => a.timestamp - b.timestamp)
                .map(e => ((e.timestamp<currentDate.valueOf())? null :
                    <Card key={e.id} event={e}/>
                ))}
            </div>
        </div>
    </div>
    <div className="flex flex-col md:flex-row bg-transparent gap-2">
        <Calendar daysWithEvents={daysWithEvents} daysOfWeek={daysOfWeek} monthsOfYear={monthsOfYear} currentMonth={currentMonth} currentYear={currentYear} setCurrentMonth={setCurrentMonth} setCurrentYear={setCurrentYear} currentDate={currentDate} setSelectedDay={setSelectedDay} setSelectedMonth={setSelectedMonth} setSelectedYear={setSelectedYear}/>
        <EventList events={events}  selectedMonth={selectedMonth} selectedYear={selectedYear} selectedDay={selectedDay} fetchEvents={fetchEvents} fetchEventTypes={fetchEventTypes} fetchEventLocations={fetchEventLocations}/>
    </div>
    </>
}