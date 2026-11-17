import express from "express";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/api/jatekok", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM jatekok WHERE raktaron = TRUE ORDER BY ar ASC");
        res.status(200).json(rows);
    } catch (error) {
        console.error("Hiba a játékok lekérdezésekor:", error);
        res.status(500).json({ error: "Szerverhiba történt a lekérdezés során." });
    }
});

app.get("/api/jatekok/szures", async (req, res) => {
    const { mufaj } = req.query;

    if (!mufaj) {
        return res.status(400).json({ error: "A műfaj megadása kötelező!" });
    }

    try {
        const [rows] = await pool.query("SELECT * FROM jatekok WHERE mufaj = ? ORDER BY ertekeles DESC", [mufaj]);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Hiba a műfaj szerinti szűréskor:", error);
        res.status(500).json({ error: "Szerverhiba történt a szűrés során." });
    }
});

app.get("/api/jatekok/kereses", async (req, res) => {
    const cim = req.query.cim ?? "";
    const maxAr = req.query.maxAr ? Number(req.query.maxAr) : 999999;

    try {
        const [rows] = await pool.query("SELECT * FROM jatekok WHERE cim LIKE ? AND ar <= ?", [`%${cim}%`, maxAr]);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Hiba a keresés során:", error);
        res.status(500).json({ error: "Szerverhiba történt a keresés során." });
    }
});

app.get("/api/jatekok/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query("SELECT * FROM jatekok WHERE id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "A keresett játék nem található." });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Hiba az egyedi játék lekérdezésekor:", error);
        res.status(500).json({ error: "Szerverhiba történt a lekérdezés során." });
    }
});

app.get("/api/statisztika", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT mufaj, COUNT(*) AS darabszam, ROUND(AVG(ar), 0) AS atlag_ar FROM jatekok GROUP BY mufaj ORDER BY darabszam DESC");
        res.status(200).json(rows);
    } catch (error) {
        console.error("Hiba a statisztika lekérdezésekor:", error);
        res.status(500).json({ error: "Szerverhiba történt a statisztika lekérdezése során." });
    }
});

app.listen(PORT, () => {
    console.log(`A szerver fut a http://localhost:${PORT} címen.`);
});
