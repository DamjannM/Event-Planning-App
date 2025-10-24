import { EventListItem } from "./EventListItem"

type EventListProps = {
    events: EventObject[],
    selectedMonth: number,
    selectedYear: number,
    selectedDay: number,
    fetchEvents: ()=>void
    fetchEventTypes: ()=>void,
    fetchEventLocations: ()=>void,
}

export function EventList({events,selectedMonth,selectedYear,selectedDay,fetchEvents, fetchEventTypes, fetchEventLocations}:EventListProps){

    return(
        <div className=" scroll-smooth flex flex-col flex-1 min-w-80 !mb-5 !mt-3 !mr-5 !ml-5 bg-gray-50 shadow-2xl border-1 border-gray-200 justify-start rounded-3xl text-white overflow-y-auto lg:min-h-[50vh] lg:max-h-[50vh] md:max-h-105 max-h-92">
            {events
                .slice().sort((a,b) => a.timestamp - b.timestamp)
                .map(e => (
                (new Date(e.timestamp).getDate()== selectedDay && new Date(e.timestamp).getMonth()==selectedMonth && new Date(e.timestamp).getFullYear()== selectedYear)
                ?<EventListItem key={e.id} event={e} fetchEvents={fetchEvents} fetchEventLocations={fetchEventLocations} fetchEventTypes={fetchEventTypes}/>
                : ''))}
        </div>
    )
}