/** Routes for companies in biztime. */

const express = require("express");
const ExpressError = require("../expressError");
const router = new express.Router();
const db = require("../db");
const slugify = require("slugify");

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({ companies: results.rows });
    } catch (e) {
        return next(e);
    }
});

router.get("/:code", async (req, res, next) => {
    try {
        const results = await db.query(
            `SELECT c.code, c.name, c.description, i.industry FROM companies AS c LEFT JOIN company_industries AS ci ON c.code = ci.company_code LEFT JOIN industries AS i ON ci.industry_code = i.code WHERE c.code = $1`,
            [req.params.code]
        );
        console.log(results.rows)
        // if no results post an error
        if (results.rows.length === 0)
            throw new ExpressError(`Can't find code of ${code}`, 404);

        let { code, name, description } = results.rows[0];
        let industries = results.rows.map((r) => r.industry);

        return res.json({ code, name, description, industries });
    } catch (e) {
        return next(e);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { code, name, description } = req.body;

        formattedCode = slugify(code, {
            replacement: "_",
            lower: true,
            strict: true,
        });

        const results = await db.query(
            `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`,
            [formattedCode, name, description]
        );

        return res.status(201).json({ company: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.patch("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query(
            "UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description",
            [name, description, code]
        );
        if (results.rows.length === 0) {
            throw new ExpressError(
                `Can't update company with code of ${code}`,
                404
            );
        }
        return res.send({ company: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.delete("/:code", async (req, res, next) => {
    try {
        const code = req.params.code;

        const results = await db.query(
            "DELETE FROM companies WHERE code = $1",
            [code]
        );

        if (results.rowCount === 0)
            throw new ExpressError(
                `Can't find company with code of ${code}`,
                404
            );

        return res.send({ msg: "DELETED!" });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
