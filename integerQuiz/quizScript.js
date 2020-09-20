let questions

function loadQuestions() {
    document.getElementById("btn").className = "d-none"
    const questionsDiv = document.getElementById("question")
    const h4AnswerTitle = document.createElement("h4")
    const h4QuestionTitle = document.createElement("h4")
    h4QuestionTitle.innerHTML = "Question"
    h4AnswerTitle.innerHTML = "Answers"
    for (let i = 0; i < data.length; i++) {
        const questionDiv = document.createElement("div")
        const questionElmnt = document.createElement("h5")
        questionElmnt.innerHTML = data[i].question
        questionDiv.appendChild(questionElmnt)
        const answersDiv = document.createElement("div")
        const explanationDiv = document.createElement("div")
        for (let x = 0; x < data[i].answers.length; x++) {
            const answerDiv = document.createElement("div")
            const answerElmnt = document.createElement("button")

            answerElmnt.innerHTML = data[i].answers[x]
            answerElmnt.className = "m-2 btn btn-primary"
            answerElmnt.value = x + 1
            answerDiv.appendChild(answerElmnt)
            answersDiv.appendChild(answerDiv)
            let event_listener = () => {
                while (explanationDiv.firstChild) {
                    explanationDiv.removeChild(explanationDiv.firstChild)
                }
                const explanationElmnt = document.createElement("p")
                explanationElmnt.classList.add("explanation");
                explanationElmnt.innerHTML = data[i].explanation
                const rightOrWrongElmnt = document.createElement("p")
                if (data[i].correct.indexOf(parseInt(answerElmnt.value)) !== -1) {
                    answerElmnt.innerHTML = answerElmnt.innerHTML +
                      '&nbsp;&nbsp;&nbsp;&nbsp;<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-check2" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" /></svg>'
                    rightOrWrongElmnt.innerHTML = "You are correct!"
                } else {
                    answerElmnt.innerHTML = answerElmnt.innerHTML +
                      '&nbsp;&nbsp;&nbsp;&nbsp;<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-x-octagon" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.54.146A.5.5 0 0 1 4.893 0h6.214a.5.5 0 0 1 .353.146l4.394 4.394a.5.5 0 0 1 .146.353v6.214a.5.5 0 0 1-.146.353l-4.394 4.394a.5.5 0 0 1-.353.146H4.893a.5.5 0 0 1-.353-.146L.146 11.46A.5.5 0 0 1 0 11.107V4.893a.5.5 0 0 1 .146-.353L4.54.146zM5.1 1L1 5.1v5.8L5.1 15h5.8l4.1-4.1V5.1L10.9 1H5.1z" /><path fill-rule="evenodd" d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" /></svg>'
                    rightOrWrongElmnt.innerHTML = "Wrong answer"
                }
                explanationDiv.appendChild(rightOrWrongElmnt)
                explanationDiv.appendChild(explanationElmnt)
                answerElmnt.removeEventListener("click", event_listener)
            }
            answerElmnt.addEventListener("click", event_listener)
        }
        questionsDiv.appendChild(questionDiv)
        questionsDiv.appendChild(answersDiv)
        questionsDiv.appendChild(explanationDiv)
    }
}

let btn = document.getElementById("btn")
btn.addEventListener("click", () => {
    loadQuestions()
})