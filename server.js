import express from "express";
import pg from "pg";
import "dotenv/config";

const db = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
});
const server = express();
const PORT = process.env.PORT || 3000;

server.use(express.json());
server.use(express.static("public"));

server.get("/api/questions/:sub", (req, res) => {
	const sub = req.params.sub;

	db.query("SELECT qa.id, s.subject_name, qa.question, qa.answer FROM question_answer qa JOIN subject s ON s.id = qa.subject_id WHERE s.subject_name = $1;", [sub]).then((result) => {
		res.json(result.rows);
	});
});

server.get("/api/subjects", (req, res) => {
	db.query("SELECT * FROM subject").then((result) => {
		res.send(result.rows);
	});
});

server.patch("/api/subjects/:oldName/:newName", (req, res) => {
	const old = req.params.oldName;
	const updated = req.params.newName;
	if (!req.params.oldName || !req.params.newName) {
		res.status(400).json({ status: "fail", message: "Usage: /api/subjects/(original name)/(updated name)" });
	}

	db.query("UPDATE subject SET subject_name = $1 WHERE subject_name = $2 RETURNING *;", [updated, old]).then((result) => {
		// console.log(result.rows);
		if (result.rows.length === 0) return res.status(500).json({ status: "fail", message: "Sever error! Try again" });

		res.status(201).json({ status: "success", data: result.rows[0] });
	});
});

server.post("/api/questions", (req, res) => {
	const topic = req.body.topic;
	const qa_pairs = req.body.qa_pairs;

	//create new topic RETURNING id
	db.query("INSERT INTO subject (subject_name) VALUES ($1) RETURNING id", [topic])
		.then((result) => {
			if (result.rows.length === 0) res.sendStatus(500);

			//With id, add all qa_pairs to question_answer table
			const id = Number(result.rows[0].id);

			db.query("INSERT INTO question_answer (question, answer, subject_id) VALUES($1, $2, $3), ($4, $5, $6) RETURNING *", [
				qa_pairs[0][0],
				qa_pairs[0][1],
				id,
				qa_pairs[1][0],
				qa_pairs[1][1],
				id,
			]).then((result) => {
				if (result.rows.length === 0) res.sendStatus(500);
			});
			res.status(201).json({
				message: "success",
				data: result.rows,
			});
		})
		.catch((err) => {
			throw err;
		});
});

server.delete("/api/subjects/:id", (req, res) => {
	const id = Number(req.params.id);
	if (!id || !Number.isInteger(id)) return res.status(400).json({ status: "fail", reason: "Missing or invalid id" });

	db.query("DELETE FROM question_answer WHERE subject_id = $1 returning subject_id;", [id])
		.then((result) => {
			if (result.rows.length === 0) return res.status(404).json({ status: "fail", reason: "Topic Not found" });

			return db.query("DELETE FROM subject WHERE id = $1 RETURNING subject_name;", [id]);
		})
		.then((result) => {
			if (result.rows.length === 0) return res.status(404).json({ status: "fail", reason: "Topic Not found" });

			res.status(200).json({ status: "success", deleted: result.rows[0].subject_name });
		});
});

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
