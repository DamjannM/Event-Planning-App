export{}

declare global {
    interface EventObject {
        description: string,
        id: number,
        location: string,
        timestamp: number,
        title: string,
        user_id: number
        type: string
        role: string
    }
}