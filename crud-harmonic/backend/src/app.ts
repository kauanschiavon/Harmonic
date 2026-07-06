import express from "express";
import reviewrouter from "./routes/ReviewRoutes"
import userrouter from "./routes/UserRoutes";
import favoriterouter from  "./routes/FavoriteRoutes"
import playlistrouter from "./routes/PlaylistRoutes"
import commentrouter from "./routes/CommentRoutes"
import "dotenv/config";

const app = express();

app.use(express.json());

app.use(userrouter);
app.use(reviewrouter);
app.use(favoriterouter);
app.use(playlistrouter);
app.use(commentrouter);

app.get("/", (req, res) => {
    return res.status(200).json("Olá Mundo!");
});

const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor está executando na porta ${PORT}`);

});