import express from "express";
import cors from "cors";
import reviewrouter from "./routes/ReviewRoutes"
import userrouter from "./routes/UserRoutes";
import favoriterouter from  "./routes/FavoriteRoutes"
import followrouter from "./routes/FollowRoutes";
import playlistrouter from "./routes/PlaylistRoutes";
import reviewlikerouter from "./routes/ReviewlikeRoutes";
import songrouter from "./routes/SongRoutes";
import "dotenv/config";
import reviewlikerouter from "./routes/ReviewlikeRoutes";
import albumrouter from "./routes/AlbumRoutes";


const app = express();

app.use(cors({
    origin: "http://localhost:5174",
    credentials: true,
}));

app.use(express.json());
app.use(reviewlikerouter);
app.use(userrouter);
app.use(reviewlikerouter);
app.use(reviewrouter);
app.use(favoriterouter);
app.use(followrouter);
app.use(playlistrouter);
app.use(songrouter);
app.use(albumrouter);


app.get("/", (req, res) => {
    return res.status(200).json("Olá Mundo!");
});

export default app;
