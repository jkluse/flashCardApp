const resultDiv = document.querySelector(".results");

function getQuestions(e) {
	const subj = e.target.textContent;
	resultDiv.innerHTML = "";
	fetch(`/api/questions/${subj}`)
		.then((res) => res.json())
		.then((data) => {
			// console.log(data);
			for (let el of data) {
				const html = `
				<div class="card">
					<div class="qdiv front">
						<h2 class="question">${el.question}</h2>
					</div>
					<div class="qdiv back">
						<h2 class="question">${el.answer}</h2>
					</div>
			</div>
          `;
				resultDiv.insertAdjacentHTML("beforeend", html);
			}
			$(".card").flip({ axis: "x", trigger: "click" });
		});
	handleDropDown();
	// Click Flip
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

// Show form
const addCardsBtn = document.querySelector(".add-cards");
const formSection = document.querySelector(".form-section");

addCardsBtn.addEventListener("click", showForm);

function showForm() {
	resultDiv.innerHTML = "";
	formSection.innerHTML = "";
	const html = `
	<form class="form">
	<div><label for="topic">Create a new study set: </label></div>
	<input type="text" name="topic" class="topic" id="topic" placeholder="Enter a new or exsisting topic (ie. Data Structures, Chemistry, etc...)" required pattern=".*\S.*" />
	<br>
	<br>
	<br>
	<br>
	<div class="question-container">
		<div class="q-num">1</div>
		<input type="text" name="question" class="question"  placeholder="Enter term/question...)" required pattern=".*\S.*" />
		<div class="label-text">TERM</div>
		<br>
		<input type="text" name="answer" class="answer"  placeholder="Enter definition/answer...)" required pattern=".*\S.*"/>
		<div class="label-text">DEFINITION</div>
		<br>

		<div class="q-num">2</div>
		<input type="text" name="question" class="question"  placeholder="Enter term/question...)" required pattern=".*\S.*" />
		<div class="label-text">TERM</div>
		<br>
		<input type="text" name="answer" class="answer"  placeholder="Enter definition/answer...)" required pattern=".*\S.*"/>
		<div class="label-text">DEFINITION</div>
		<br>

		<input type="submit" value="Submit">
		</div>
		</form>
	`;
	formSection.insertAdjacentHTML("beforeend", html);
}
