import express from "express";
import cors from "cors";
import "dotenv/config";

import userRouter from "./routes/UserRoutes";
import playlistRouter from "./routes/PlaylistRoutes";
import spotifyRouter from "./routes/SpotifyRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use(userRouter);
app.use(playlistRouter);
app.use(spotifyRouter);

app.get("/", (req, res) => {
    return res.status(200).json({ message: "Harmonic API rodando!" });
});

const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor está executando na porta ${PORT}`);
});
