export interface Review {
  id?: number;
  user_id?: number;
  music_id?: string | null;
  artist_id?: string | null;
  note: number;
  text: string;
  created_time?: Date;
}
