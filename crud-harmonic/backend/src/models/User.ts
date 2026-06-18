import { NumericLiteral } from "typescript";

export interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
  photo_url?: string;
  bio?: string;
  role?: "user" | "admin";
}

export interface Review {
  id: number;
  user_id: number;
  music_id: string | null;
  artist_id: string | null;
  note: number;
  text: string;
  created_time: Date;
}
