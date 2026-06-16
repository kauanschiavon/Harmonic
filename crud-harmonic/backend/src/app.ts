import express from "express";

import router from "./routes/UserRoutes";

import "dotenv/config";

const app = express();

app.use(express.json());

app.use(router);

app.get("/", (req, res) => {
    return res.status(200).json("Olá Mundo!");
});

const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor está executando na porta ${PORT}`);

});