const resultDiv = document.querySelector(".results");

function getQuestions(e) {
	formSection.innerHTML = "";

	const subj = e.target.textContent;
	resultDiv.innerHTML = "";
	editSection.innerHTML = "";

	fetch(`/api/questions/${subj}`)
		.then((res) => res.json())
		.then((data) => {
			for (let el of data) {
				const html = `
				<div class="card" data-id=${el.id}>
					<div class="qdiv front" data-id=${el.id}>
						<h2 class="question" data-id=${el.id}>${el.question}</h2>
					</div>
					<div class="qdiv back" data-id=${el.id}>
						<h2 class="question">${el.answer}</h2>
						</div>
			</div>
			<div class="controls">
				<img class="right-btn" data-id=${el.id} src="./img/right.svg"></img>
				<img class="wrong-btn" data-id=${el.id} src="./img/wrong.svg"></img>
				
			</div>
          `;
				resultDiv.insertAdjacentHTML("beforeend", html);
			}
			$(".card").flip({ axis: "x", trigger: "click" });
		});
	if (dropdownEl.classList.contains("show")) {
		handleDropDown();
	}
}

// Drop down
const library = document.querySelector(".lib-wrapper");
const dropdownEl = document.querySelector(".dropdown");
const listItems = document.querySelector(".list-items");

library.addEventListener("click", handleDropDown);

function handleDropDown() {
	dropdownEl.classList.toggle("show");
}

// on load
function loadLib() {
	listItems.innerHTML = "";
	fetch("/api/subjects")
		.then((res) => res.json())
		.then((result) => {
			// console.log(result);
			for (let sub of result) {
				const html = `<a class="added-subj" href="#">${sub.subject_name}</a>`;
				listItems.insertAdjacentHTML("beforeend", html);
			}
			listItems.addEventListener("click", (e) => {
				getQuestions(e);
			});
		});
}
loadLib();

// Create new Deck
const addCardsBtn = document.querySelector(".add-cards");
const formSection = document.querySelector(".form-section");

addCardsBtn.addEventListener("click", showForm);

function showForm() {
	if (dropdownEl.classList.contains("show")) {
		handleDropDown();
	}

	resultDiv.innerHTML = "";
	formSection.innerHTML = "";
	editSection.innerHTML = "";
	const html = `
	<form class="form">
		<div><label class="form-header" for="topic">Create a new study set: </label></div>
		<input type="text" name="topic" class="topic" id="topic" placeholder="Enter a topic (ie. Data Structures, Chemistry, etc...)" required />
		<br>
		<br>
		<br>
		<div class="question-container">
			<div class="q-num">1</div>
			<input type="text" name="question1" class="question"  placeholder="Enter term...)" required  title="This field is required"/>
			<div class="label-text">TERM</div>
			<br>
			<input type="text" name="answer1" class="answer"  placeholder="Enter definition...)" required  title="This field is required"/>
			<div class="label-text">DEFINITION</div>
			<br>

			<div class="q-num">2</div>
			<input type="text" name="question2" class="question"  placeholder="Enter term...)" required  title="This field is required"/>
			<div class="label-text">TERM</div>
			<br>
			<input type="text" name="answer2" class="answer"  placeholder="Enter definition...)" required  title="This field is required"/>
			<div class="label-text">DEFINITION</div>
			<br>

			<input type="submit" value="Submit" class ="form-submit">
			</div>
		</form>
	`;
	formSection.insertAdjacentHTML("beforeend", html);

	const formEl = document.querySelector(".form");
	formEl.addEventListener("submit", createDeck);
}

// Create new Deck
function createDeck(e) {
	e.preventDefault();
	const data = new FormData(e.target);

	fetch("api/questions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			topic: data.get("topic"),
			qa_pairs: [
				[data.get("question1"), data.get("answer1")],
				[data.get("question2"), data.get("answer2")],
			],
		}),
	})
		.then((res) => res.json())
		.then((result) => {
			loadLib();
			showForm();
		});
}

// Edit Button
const editBtn = document.querySelector(".edit-btn");
const editSection = document.querySelector(".edit-cards");
editBtn.addEventListener("click", editCards);

function editCards() {
	resultDiv.innerHTML = "";
	formSection.innerHTML = "";
	editSection.innerHTML = "";

	fetch("/api/subjects")
		.then((res) => res.json())
		.then((result) => {
			// console.log(result);
			for (let sub of result) {
				const html = `
			<div class="sub-edit-wrapper">
				<p class="added-subj" >${sub.subject_name}</p>
				<button class='edit-btn'><img class="rename-btn" data-id=${sub.id} src="./img/edit.svg"></img></button>
				<button class='delete-btn'><img data-id=${sub.id} src="./img/delete.svg"></button>
			</div>
			`;
				editSection.insertAdjacentHTML("beforeend", html);
			}
			const deleteBtns = document.querySelectorAll(".delete-btn");
			deleteBtns.forEach((btn) => btn.addEventListener("click", deleteTopic));

			const renameBtn = document.querySelectorAll(".rename-btn");
			renameBtn.forEach((btn) => btn.addEventListener("click", rename));
		});
}

function rename(e) {
	const p = this.closest("div").firstElementChild;
	const originalText = p.textContent;
	const form = `
	<form class="edit-form">
	<input id="text" name="text" value=${originalText} required/>
	<button type="submit">Update</button>
	</form>
	`;

	p.innerHTML = form;
	const editText = document.querySelector("#text");
	const editForm = document.querySelector(".edit-form");
	editForm.addEventListener("submit", (e) => {
		handleEditName(e, originalText);
	});
	editText.focus();
}

function handleEditName(e, originalText) {
	e.preventDefault();
	const editForm = document.querySelector(".edit-form");
	const data = new FormData(e.target);
	const updatedName = data.get("text");
	console.log(originalText, updatedName);

	// replace input form with updated name
	// 1. fetch PATCH with updatedName
	fetch(`/api/subjects/${originalText}/${updatedName}`, {
		method: "PATCH",
	});
	// 2. Reload editCards
	editCards();
	loadLib();
}

function deleteTopic(e) {
	const topicId = e.target.getAttribute("data-id");
	fetch(`/api/subjects/${topicId}`, { method: "DELETE" })
		.then((res) => res.json())
		.then((result) => {
			console.log(result);
			editCards();
			loadLib();
		});
}
