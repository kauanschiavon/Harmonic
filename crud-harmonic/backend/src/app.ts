import express from "express";
import cors from "cors";
import "dotenv/config";

import userrouter from "./routes/UserRoutes";
import reviewrouter from "./routes/ReviewRoutes";
import favoriterouter from "./routes/FavoriteRoutes";
import followrouter from "./routes/FollowRoutes";
import playlistrouter from "./routes/PlaylistRoutes";
import songrouter from "./routes/SongRoutes";
import commentrouter from "./routes/CommentRoutes";
import reviewlikerouter from "./routes/ReviewlikeRoutes";
import spotifyrouter from "./routes/SpotifyRoutes";

const app = express();

app.use(cors({
    origin: "http://localhost:5174",
    credentials: true,
}));

app.use(express.json());

app.use(userrouter);
app.use(reviewrouter);
app.use(favoriterouter);
app.use(followrouter);
app.use(playlistrouter);
app.use(songrouter);
app.use(commentrouter);
app.use(reviewlikerouter);
app.use(spotifyrouter);

app.get("/", (req, res) => {
    return res.status(200).json("Harmonic API rodando!");
});

export default app;
