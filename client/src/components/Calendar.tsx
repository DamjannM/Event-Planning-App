import type { Dayjs } from "dayjs";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

interface DayWithEvent {
  day: number;
  month: number;
  year: number
}

type CalendarProps = {
    daysWithEvents: DayWithEvent[],
    daysOfWeek: string[],
    monthsOfYear: string[],
    currentMonth: number,
    currentYear: number,
    selectedDay: number,
    selectedMonth: number,
    selectedYear: number,
    setCurrentMonth: React.Dispatch<React.SetStateAction<number>>,
    setCurrentYear: React.Dispatch<React.SetStateAction<number>>,
    setSelectedDay: React.Dispatch<React.SetStateAction<number>>
    setSelectedMonth: React.Dispatch<React.SetStateAction<number>>
    setSelectedYear: React.Dispatch<React.SetStateAction<number>>
    currentDate: Dayjs,
}

export function Calendar({daysWithEvents, daysOfWeek, monthsOfYear, currentMonth, currentYear, selectedDay,selectedMonth, selectedYear, setCurrentMonth, setCurrentYear, currentDate, setSelectedDay, setSelectedMonth, setSelectedYear}:CalendarProps){
    
    const daysInMonth = new Date(currentYear,currentMonth +1, 0).getDate()
    const firstDayInMonth = new Date(currentYear,currentMonth, 1).getDay()
    
    const prevMonth = () => {
        setCurrentMonth(prevMonth => (prevMonth === 0 ? 11 : prevMonth -1))
        setCurrentYear(prevYear => (currentMonth === 0 ? prevYear-1 : prevYear))
    }

    const nextMonth = () => {
        setCurrentMonth(month => (month === 11 ? 0 : month +1))
        setCurrentYear(year => (currentMonth === 11 ? year+1 : year))
    }

    const goToToday = () => {
        setCurrentMonth(currentDate.month())
        setCurrentYear(currentDate.year())
        setSelectedDay(currentDate.date())
        setSelectedMonth(currentDate.month())
        setSelectedYear(currentDate.year())
    }
    
    const selectDate = (day:number)=>{
    setSelectedDay(day+1)
    setSelectedMonth(currentMonth)
    setSelectedYear(currentYear)
    }

    const isToday = (day:number) => {
        return (day+1==currentDate.date() && currentMonth == currentDate.month() && currentYear == currentDate.year())? 'bg-blue-300 text-white rounded-full' : ''
    }

    const hasEvent = (day:number) => {
        return (daysWithEvents.some((e)=>(e.day==day+1 && e.month ==currentMonth && e.year == currentYear)))? "after:content-['•'] after:text-blue-800 after:absolute after:bottom-[calc(-12px)] after:text-xl": ''
    }

    const selectedDayBackground = (day:number) => {
        return (selectedDay==day+1 && currentMonth==selectedMonth && currentYear == selectedYear)? "bg-violet-400 text-white rounded-full" : ""
    }

    return (
        <div className="bg-gray-50 !mb-5 !pb-10 !ml-5 !mr-5 !mt-3 shadow-2xl border-1 border-gray-200 rounded-3xl min-w-80 lg:max-h-110 md:max-h-105 max-h-92 md:w-[calc(100%/3)]">
            <div className="">
                <h1 className="text-2xl lg:text-4xl md:text-3xl font-bold text-indigo-950 ">Calendar</h1>
                <div className="relative flex justify-between items-center gap-2 !m-2 !mr-1">
                    <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-indigo-950 lg:text-2xl md:text-2xl">{monthsOfYear[currentMonth]}</h2>
                    <h2 className="text-xl lg:text-2xl md:text-2xl font-bold text-indigo-950">{currentYear}</h2>
                    <button className="bg-blue-300 rounded-xl !p-2 text-white font-bold cursor-pointer !ml-2 hover:bg-indigo-400 " onClick={goToToday}>Today</button>
                    </div>
                    <div className="flex gap-2 absolute right-0">
                        <FaArrowLeft onClick={prevMonth} className="text-indigo-950 cursor-pointer lg:text-2xl md:text-xl"/>
                        <FaArrowRight onClick={nextMonth} className="text-indigo-950 cursor-pointer lg:text-2xl md:text-xl !mr-0"/>
                    </div>
                </div>
                <div className="!my-3 flex justify-between">
                    {daysOfWeek.map((day)=><span key={day} className="w-[calc(100%/7)] text-indigo-950 text-lg lg:text-xl md:text-lg font-bold">{day}</span>)}
                </div>
                <div className="flex flex-wrap">
                    {[...Array(firstDayInMonth).keys()].map((_,index)=>(<span className="w-[calc(100%/7)] flex lg:text-2xl md:text-xl items-center justify-center !my-2" key={index}/>))}

                    {[...Array(daysInMonth).keys()].map(day=><span className={`w-[calc(100%/7)] !my-2 flex lg:text-2xl md:text-xl items-center justify-center 
                        cursor-pointer text-indigo-950 font-bold relative ${selectedDayBackground(day)} ${isToday(day)} ${hasEvent(day)}`} key={day+1} 
                        onClick={()=>selectDate(day)}>{day+1}</span>)}
                </div>
            </div>
        </div>
    )
}