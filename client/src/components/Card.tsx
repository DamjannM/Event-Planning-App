interface CardProps {
    id: number;
    title: string;
    description: string;
    location: string;
    timestamp: number;
    type: string
}

export function Card({title,description,location,timestamp, type}: CardProps){
    const date = new Date(timestamp)
    const day = date.getDate()
    const month = date.getMonth()
    const year = date.getFullYear()
    const hour = date.getHours()
    const minute = date.getMinutes()
    let slicedDescription = description
    if (description.length > 50) {
        slicedDescription = description.slice(0,50)+ `...`
    }


    return <div className="h-60 min-h-60 min-w-54 w-54 bg-indigo-50 relative flex flex-col justify-between rounded-2xl !p-3 border-1 border-indigo-500 shadow-lg shadow-gray-500 overflow-hidden">
        <div className="flex flex-col justify-between">
        <p className=" text-lg text-indigo-900 font-bold">{title}</p>
        <p className="text-left  text-lg text-indigo-900 leading-tight">{slicedDescription}</p>
        </div>
        <div className="flex flex-col justify-between text-lg text-indigo-900">
            <div>
                <p className="text-left  text-lg text-indigo-900 leading-tight">{type}</p>
                <p className=" leading-tight text-left text-lg text-indigo-900">{location}</p>
            </div>
            <div className="flex">
                <p>{day}.{month}.{year}.</p>
                <p>{(hour<10) ? `0`+ hour : hour}:{(minute <10)? `0`+minute : minute}</p>
            </div>
        </div>
    </div>
}