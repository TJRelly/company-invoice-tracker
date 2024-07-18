// Tell Node that we're in test "mode"
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany;

beforeEach(async () => {
    const results = await db.query(
        `INSERT INTO companies (code, name, description) VALUES ('test', 'TestCompany', 'A company that tests tests') RETURNING code, name, description`
    );
    testCompany = results.rows[0];
});

// Clears Database after each test
afterEach(async () => {
    await db.query(`DELETE FROM companies`);
});

// Ends db session after each test
afterAll(async () => {
    await db.end();
});

describe("GET /companies", () => {
    test("Get a list of companies", async () => {
        const res = await request(app).get("/companies");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ companies: [testCompany] });
    });
});

describe("GET /company/:code", () => {
    test("Gets a single company", async () => {
        const res = await request(app).get(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ company: testCompany });
    });

    test("Responds with 404 for invalid id", async () => {
        const res = await request(app).get(`/companies/0`);
        expect(res.statusCode).toBe(404);
    });
});

describe("POST /companies", () => {
    test("Creates a single company", async () => {
        const res = await request(app).post("/companies").send({
            code: "new_comp",
            name: "New Company",
            description: "The newest company",
        });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            company: {
                code: "new_comp",
                name: "New Company",
                description: "The newest company",
            },
        });
    });
});

describe("PATCH /companies/:code", () => {
    test("Updates a single company", async () => {
        const res = await request(app)
            .patch(`/companies/${testCompany.code}`)
            .send({ name: "updatedComp", description: "updated the company" });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            company: {
                code: testCompany.code,
                name: "updatedComp",
                description: "updated the company",
            },
        });
    });

    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).patch(`/companies/0`);
        expect(res.statusCode).toBe(404);
    });
});

describe("DELETE /companies/:code", () => {
    test("Deletes a single company", async () => {
      const res = await request(app).delete(`/companies/${testCompany.code}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ msg: 'DELETED!' })
    })

    test("Responds with 404 for invalid code", async () => {
        const res = await request(app).patch(`/companies/0`);
        expect(res.statusCode).toBe(404);
    });
  })
