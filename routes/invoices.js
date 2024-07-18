/** Routes for invoices in biztime. */

const express = require("express");
const ExpressError = require("../expressError");
const router = new express.Router();
const db = require("../db");

const date_time = new Date();

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices`);
        return res.json({ invoices: results.rows });
    } catch (e) {
        return next(e);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const invoiceResults = await db.query(
            `SELECT * FROM invoices WHERE id = $1`,
            [id]
        );

        // if no results post an error
        if (invoiceResults.rows.length === 0)
            throw new ExpressError(`Can't find id of ${id}`, 404);

        // get company results
        const companyResults = await db.query(
            `SELECT * FROM companies WHERE code = $1`,
            [invoiceResults.rows[0].comp_code]
        );

        return res.json({
            invoice: invoiceResults.rows[0],
            company: companyResults.rows[0],
        });
    } catch (e) {
        return next(e);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { comp_code, amt, paid, paid_date } = req.body;
        const results = await db.query(
            `INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ($1, $2, $3, $4) RETURNING comp_code, amt, paid, add_date, paid_date`,
            [comp_code, amt, paid, paid_date]
        );
        return res.status(201).json({ invoice: results.rows[0] });
    } catch (e) {
        console.error(e);
        return next(e);
    }
});

router.patch("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amt, paid } = req.body;

        const paidResults = await db.query(
            `SELECT paid FROM invoices WHERE id=$1`,
            [id]
        );

        paidStatus = paidResults.rows[0].paid;
        console.log(paidStatus);
        // If paying unpaid invoice: sets paid_date to today
        if (!paidStatus) {
            results = await db.query(
                "UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING id, comp_code, amt, paid, add_date, paid_date",
                [amt, paid, date_time, id]
            );
        } else {
            // If un-paying: sets paid_date to null
            results = await db.query(
                "UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING id, comp_code, amt, paid, add_date, paid_date",
                [amt, paid, null, id]
            );
        }

        // if invoice is not found
        if (results.rows.length === 0) {
            throw new ExpressError(
                `Can't update invoice with id of ${id}`,
                404
            );
        }

        return res.send({ invoice: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const id = req.params.id;

        const results = await db.query("DELETE FROM invoices WHERE id = $1", [
            id,
        ]);

        if (results.rowCount === 0)
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404);

        return res.send({ msg: "DELETED!" });
    } catch (e) {
        return next(e);
    }
});

module.exports = router;
