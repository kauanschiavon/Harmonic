export interface Review {
  id?: number;
  user_id?: number;
  music_id?: string | null;
  artist_id: string;
  note?: number;
  text?: string;
  create_time?: Date;
}
