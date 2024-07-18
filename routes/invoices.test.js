// Tell Node that we're in test "mode"
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testInvoice;
let testCompany;

beforeEach(async () => {
    // Adds test company to the database
    const compResults = await db.query(
        `INSERT INTO companies (code, name, description) VALUES ('test', 'TestCompany', 'A company that tests tests') RETURNING code, name, description`
    );

    testCompany = compResults.rows[0];

    // Adds test invoice to the database
    const invoiceResults = await db.query(
        `INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ('test', '100', 'false', null) RETURNING id, comp_code, amt, paid, add_date, paid_date`
    );

    testInvoice = invoiceResults.rows[0];
});

afterEach(async () => {
    await Promise.all([
        db.query(`DELETE FROM invoices`),
        db.query(`DELETE FROM companies`),
    ]);
});

afterAll(async () => {
    await db.end();
});

describe("GET /invoices", () => {
    test("Get a list with one invoice", async () => {
        const res = await request(app).get("/invoices");

        expect(res.statusCode).toBe(200);
        // Adjust the expected object to match the received structure
        const expectedInvoice = {
            ...testInvoice,
            add_date: testInvoice.add_date.toISOString(), // Convert Date to string
        };

        expect(res.body).toEqual({ invoices: [expectedInvoice] });
    });
});

describe("GET /invoices/:id", () => {
    test("Gets a single invoice", async () => {
        const res = await request(app).get(`/invoices/${testInvoice.id}`);
        expect(res.statusCode).toBe(200);

        const expectedInvoice = {
            ...testInvoice,
            add_date: testInvoice.add_date.toISOString(), // Convert Date to string
        };

        const expectedResponse = {
            company: testCompany,
            invoice: expectedInvoice,
        };

        expect(res.body).toEqual(expectedResponse);
    });

    test("Responds with 404 for invalid id", async () => {
        const res = await request(app).get(`/invoices/0`);
        expect(res.statusCode).toBe(404);
    });
});

describe("POST /invoices", () => {
    test("Creates a single invoice", async () => {
        const res = await request(app).post("/invoices").send({
            comp_code: testCompany.code,
            amt: 100,
            paid: false,
            paid_date: null,
        });

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            invoice: {
                comp_code: testCompany.code,
                amt: 100,
                paid: false,
                paid_date: null,
                add_date: expect.any(String), // Check for the add_date field
            },
        });
    });
});

describe("PATCH /invoices/:id", () => {
    test("Updates a single invoice", async () => {
        const res = await request(app)
            .patch(`/invoices/${testInvoice.id}`)
            .send({ amt: 250 });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            invoice: {
                ...testInvoice,
                amt: 250, // Updated amount
                add_date: expect.any(String), // Assuming add_date is returned as a string
            },
        });
    });

    test("Responds with 404 for invalid id", async () => {
        const res = await request(app).patch(`/invoices/0`).send({ amt: 250 });
        expect(res.statusCode).toBe(404);
    });
});

describe("DELETE /invoices/:id", () => {
    test("Deletes a single invoice", async () => {
        const res = await request(app).delete(`/invoices/${testInvoice.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ msg: "DELETED!" });
    });
});
