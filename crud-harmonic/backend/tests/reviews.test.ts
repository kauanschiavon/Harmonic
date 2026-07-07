import request from "supertest";
import app from "../src/app";

// Artista real do Spotify (Pitbull), usado só como dado de teste fixo
const TEST_ARTIST_ID = "0TnOYISbd1XYRBk9myaseg";

describe("Operação: criar review", () => {
    let userId: number;
    let reviewId: number;

    // cria um usuário descartável só pra esse teste
    beforeAll(async () => {
        const email = `teste_review_${Date.now()}@harmonic.com`;

        const res = await request(app).post("/users").send({
            username: `reviewer_${Date.now()}`.slice(0, 30),
            email,
            password: "senha1234",
        });

        userId = res.body.user.id;
    });

    // limpa o que foi criado, sem deixar lixo no banco
    afterAll(async () => {
        if (reviewId) await request(app).delete(`/reviews/${reviewId}`);
        if (userId) await request(app).delete(`/users/${userId}`);
    });

    it("cria uma review com sucesso", async () => {
        const response = await request(app).post("/reviews").send({
            user_id: userId,
            artist_id: TEST_ARTIST_ID,
            note: 5,
            text: "Álbum incrível, escuto todo dia!",
        });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");
        expect(Number(response.body.note)).toBe(5); // Postgres retorna DECIMAL como string ("5.0")
        expect(response.body.artist_id).toBe(TEST_ARTIST_ID);

        reviewId = response.body.id;
    });

    it("rejeita review sem artist_id (campo obrigatório)", async () => {
        const response = await request(app).post("/reviews").send({
            user_id: userId,
            note: 4,
            text: "Faltou o artista",
        });

        expect(response.status).toBe(400);
    });
});