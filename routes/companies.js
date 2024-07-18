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
        const { code } = req.params;
        const results = await db.query(
            `SELECT * FROM companies WHERE code = $1`,
            [code]
        );

        // if no results post an error
        if (results.rows.length === 0)
            throw new ExpressError(`Can't find code of ${code}`, 404);

        return res.json({ company: results.rows[0] });
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
