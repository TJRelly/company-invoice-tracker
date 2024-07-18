/** Routes for industries in biztime. */

const express = require("express");
const router = new express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(
            `SELECT i.code, i.industry, c.name FROM industries AS i JOIN company_industries AS ci ON i.code = ci.industry_code JOIN companies AS c ON ci.company_code = c.code`
        );

        console.log(results.rows);

        // Create a map to group companies by industry
        const industryMap = new Map();

        results.rows.forEach((row) => {
            const { code, industry, name } = row;

            if (!industryMap.has(code)) {
                industryMap.set(code, { code, industry, companies: [] });
            }

            industryMap.get(code).companies.push(name);
        });

        // Convert the map values to an array
        const industries = Array.from(industryMap.values());

        return res.json(industries);
        
    } catch (e) {
        return next(e);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { code, industry } = req.body;

        const results = await db.query(
            `INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry`,
            [code, industry]
        );

        return res.status(201).json({ industry: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.post("/company_industries", async (req, res, next) => {
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
            return res.status(404).json({ error: "Company not found" });
        }

        if (checkIndustry.rows.length === 0) {
            return res.status(404).json({ error: "Industry not found" });
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
            return res
                .status(400)
                .json({ error: "Association already exists or invalid data" });
        }

        return res.status(201).json({ association: result.rows[0] });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
