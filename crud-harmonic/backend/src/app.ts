import express from "express";


const app = express();

app.use(express.json());


app.get("/", (req, res) => {
    return res.status(200).json("Olá Mundo!");
});

const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor está executando na porta ${PORT}`);
});