/** Routes for industries in biztime. */

const express = require("express");
const router = new express.Router();
const db = require("../db");

// Add this route in your Express app
router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM industries`);
        return res.json({ industries: results.rows });
    } catch (e) {
        return next(e);
    }
});

// Add this route in your Express app


// Add this route in your Express app
router.post('/company_industries', async (req, res, next) => {
    try {
        const { company_code, industry_code } = req.body;

        // Check if the company and industry exist
        const checkCompany = await db.query(
            `SELECT code FROM companies WHERE code = $1`,
            [company_code]
        );

        const checkIndustry = await db.query(
            `SELECT code FROM industries WHERE code = $1`,
            [industry_code]
        );

        if (checkCompany.rows.length === 0) {
            return res.status(404).json({ error: 'Company not found' });
        }

        if (checkIndustry.rows.length === 0) {
            return res.status(404).json({ error: 'Industry not found' });
        }

        // Insert the association
        const result = await db.query(
            `INSERT INTO company_industries (company_code, industry_code)
             VALUES ($1, $2)
             ON CONFLICT (company_code, industry_code) DO NOTHING
             RETURNING company_code, industry_code`,
            [company_code, industry_code]
        );

        if (result.rowCount === 0) {
            return res.status(400).json({ error: 'Association already exists or invalid data' });
        }

        return res.status(201).json({ association: result.rows[0] });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;