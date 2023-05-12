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
          <div class="qdiv flip-card-front">
            <h2 class="question">${el.question}</h2>
            
          </div>
          <div class="qdiv flip-card-back">
            <h2 class="question">${el.answer}</h2>
            
          </div>
          `;
				resultDiv.insertAdjacentHTML("beforeend", html);
			}
		});
	handleDropDown();
}

// Drop down
const library = document.querySelector(".lib-wrapper");
const dropdownEl = document.querySelector(".dropdown");
const listItems = document.querySelector(".list-items");
console.log(listItems);

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
