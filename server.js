import express from "express";
import pg from "pg";
import "dotenv/config";

const db = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
});
const server = express();
const PORT = process.env.PORT || 3000;

server.use(express.static("public"));

server.get("/api/questions/:sub", (req, res) => {
	const sub = req.params.sub;

	db.query("SELECT s.subject_name, qa.question, qa.answer FROM question_answer qa JOIN subject s ON s.id = qa.subject_id WHERE s.subject_name = $1;", [sub]).then((result) => {
		res.json(result.rows);
	});
});

server.get("/api/subjects", (req, res) => {
	db.query("SELECT * FROM subject").then((result) => {
		res.send(result.rows);
	});
});

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
