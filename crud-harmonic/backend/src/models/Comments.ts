export interface Comment{
    id?: number;
    user_id: number;
    review_id: number;
    text: string;
    created_time?: Date;
}   