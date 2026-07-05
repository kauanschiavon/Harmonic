import express from "express";
import cors from "cors";
import reviewrouter from "./routes/ReviewRoutes"
import userrouter from "./routes/UserRoutes";

import "dotenv/config";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());

app.use(userrouter);
app.use(reviewrouter);


app.get("/", (req, res) => {
    return res.status(200).json("Olá Mundo!");
});

const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor está executando na porta ${PORT}`);

});