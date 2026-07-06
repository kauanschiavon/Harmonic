import express from "express";
import cors from "cors";
import reviewrouter from "./routes/ReviewRoutes"
import userrouter from "./routes/UserRoutes";
import favoriterouter from  "./routes/FavoriteRoutes"
import followrouter from "./routes/FollowRoutes";
import playlistrouter from "./routes/PlaylistRoutes"
import commentrouter from "./routes/CommentRoutes"
import reviewlikerouter from "./routes/ReviewlikeRoutes"
import artistrouter from "./routes/ArtistRoutes"
import "dotenv/config";

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
app.use(commentrouter);
app.use(reviewlikerouter);
app.use(artistrouter);

app.get("/", (req, res) => {
    return res.status(200).json("Olá Mundo!");
});

const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor está executando na porta ${PORT}`);

});