import express from "express";
import cors from "cors";
import reviewrouter from "./routes/ReviewRoutes"
import userrouter from "./routes/UserRoutes";
import favoriterouter from  "./routes/FavoriteRoutes"
import followrouter from "./routes/FollowRoutes";
import playlistrouter from "./routes/PlaylistRoutes"
import songrouter from "./routes/SongRoutes";
import "dotenv/config";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());

app.use(userrouter);
app.use(reviewrouter);
app.use(favoriterouter);
app.use(followrouter);
app.use(playlistrouter);
app.use(songrouter);


app.get("/", (req, res) => {
    return res.status(200).json("Olá Mundo!");
});

export default app;
