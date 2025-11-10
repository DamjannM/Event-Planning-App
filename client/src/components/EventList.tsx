import { EventListItem } from "./EventListItem"

type EventListProps = {
    events: EventObject[],
    selectedMonth: number,
    selectedYear: number,
    selectedDay: number,
    fetchEvents: ()=>void
    fetchUserEvents: ()=> void,
    fetchEventTypes: ()=>void,
    fetchEventLocations: ()=>void,
    showDetailsModal: boolean,
    handleOpenModal: (events:EventObject| undefined)=> void
}

export function EventList({events,selectedMonth,selectedYear,selectedDay,fetchEvents,fetchUserEvents, fetchEventTypes, fetchEventLocations, showDetailsModal, handleOpenModal}:EventListProps){
    if (!events) return null;
    const filteredEvents = events
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp)
    .filter(
        (e) =>
        new Date(e.timestamp).getDate() === selectedDay &&
        new Date(e.timestamp).getMonth() === selectedMonth &&
        new Date(e.timestamp).getFullYear() === selectedYear
  );
    return(
        <div className=" scroll-smooth flex flex-col flex-1 min-w-80 !mb-5 !mt-3 !mr-5 !ml-5 bg-gray-50 shadow-2xl border-1 border-gray-200 justify-start rounded-3xl text-white overflow-y-auto lg:min-h-[50vh] lg:max-h-[50vh] md:max-h-105 max-h-92">
            <h1 className="text-indigo-950 text-xl italic !ml-14">{selectedDay}.{selectedMonth+1}.{selectedYear}.</h1>
            {filteredEvents.length >0 ? events
                .slice().sort((a,b) => a.timestamp - b.timestamp)
                .map(e => (
                    (new Date(e.timestamp).getDate()== selectedDay && new Date(e.timestamp).getMonth()==selectedMonth && new Date(e.timestamp).getFullYear()== selectedYear)
                    ?<EventListItem key={e.id} event={e} fetchEvents={fetchEvents} fetchUserEvents={fetchUserEvents} fetchEventLocations={fetchEventLocations} fetchEventTypes={fetchEventTypes}
                    showDetailsModal={showDetailsModal} handleOpenModal={handleOpenModal}/>
                    : '')) : <div className="text-black text-xl !ml-12">You dont have events for selected date</div>}
            {}
        </div>
    )
}