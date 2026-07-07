import request from "supertest";
import app from "../src/app";

describe("Operação: seguir e deixar de seguir usuário", () => {
    let userAId: number; // quem vai seguir
    let userBId: number; // quem vai ser seguido

    beforeAll(async () => {
        const stamp = Date.now();

        const resA = await request(app).post("/users").send({
            username: `follower_${stamp}`.slice(0, 30),
            email: `follower_${stamp}@harmonic.com`,
            password: "senha1234",
        });
        userAId = resA.body.user.id;

        const resB = await request(app).post("/users").send({
            username: `followed_${stamp}`.slice(0, 30),
            email: `followed_${stamp}@harmonic.com`,
            password: "senha1234",
        });
        userBId = resB.body.user.id;
    });

    afterAll(async () => {
        // garante que não sobra relação de follow antes de apagar os usuários
        await request(app)
            .delete(`/users/${userBId}/follow`)
            .send({ follower_id: userAId });

        if (userAId) await request(app).delete(`/users/${userAId}`);
        if (userBId) await request(app).delete(`/users/${userBId}`);
    });

    it("A começa a seguir B", async () => {
        const response = await request(app)
            .post(`/users/${userBId}/follow`)
            .send({ follower_id: userAId });

        expect(response.status).toBe(201);

        const stats = await request(app)
            .get(`/users/${userBId}/stats`)
            .query({ viewer_id: userAId });

        expect(stats.body.is_following).toBe(true);
        expect(stats.body.followers_count).toBe(1);
    });

    it("A deixa de seguir B", async () => {
        const response = await request(app)
            .delete(`/users/${userBId}/follow`)
            .send({ follower_id: userAId });

        expect(response.status).toBe(200);

        const stats = await request(app)
            .get(`/users/${userBId}/stats`)
            .query({ viewer_id: userAId });

        expect(stats.body.is_following).toBe(false);
        expect(stats.body.followers_count).toBe(0);
    });
});
