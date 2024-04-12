// script.js

const questions = [
    { question: 'Select the Gender of the Affected Cattle', options: ['Female', 'Male'] },
    { question: 'Select the Breed of the Cattle', options: ['jry', 'hf', 'mg', 'nd'] },
    { question: 'Is the cattle vaccinated within a Year?', options: ['Yes', 'No'] },
    { question: 'Enter the Age of the Cattle (in months)', type: 'slider', min: 1, max: 120 },
    { question: 'What is the duration since the first symptoms appeared?', options: ['1 week', '2 weeks', '3 weeks', '4 weeks'] },
    { question: 'What percentage of skin lesions can be found on the body of cattle?', options: ['< 30%', '< 60%', '> 60%'],images: { 
        '< 30%': 'download.jpg', 
        '< 60%': 'download.jpg', 
        '> 60%': 'download.jpg' 
    } },
    { question: 'Are there any concurrent diseases in the cattle?', options: ['Yes', 'No'] }
];
// script.js

const initialPage = document.getElementById('initial-page');
const predictionPage = document.getElementById('prediction-page');
const startPredictionsBtn = document.getElementById('start-predictions-btn');

let currentQuestionIndex = 0;
const questionContainer = document.getElementById('question');
const optionsContainer = document.getElementById('options');
const resultContainer = document.getElementById('result-container');
const resultText = document.getElementById('result');

function showQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    questionContainer.textContent = currentQuestion.question;

    optionsContainer.innerHTML = '';
    if (currentQuestion.options) {
        currentQuestion.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.addEventListener('click', () => selectOption(option));
            button.classList.add('button-separator'); // Add separator class
            optionsContainer.appendChild(button);
        });
    } else if (currentQuestion.type === 'slider') {
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = currentQuestion.min;
        slider.max = currentQuestion.max;
        slider.value = currentQuestion.min;
        slider.addEventListener('input', () => updateSliderValue(slider.value));
        optionsContainer.appendChild(slider);

        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = currentQuestion.min;
        optionsContainer.appendChild(valueDisplay);
    }
}


function updateSliderValue(value) {
    const valueDisplay = optionsContainer.querySelector('span');
    valueDisplay.textContent = value;

    // Log the value to check if it's being captured correctly
    console.log('Slider value:', value);
}


function selectOption(option) {
    // Check if an option is selected
    if (!option && questions[currentQuestionIndex].type !== 'slider') {
        alert("Please select an option.");
        return; // Exit the function if no option is selected and the question is not a slider
    }

    // Update answer based on question type
    if (questions[currentQuestionIndex].type === 'slider') {
        const sliderValue = optionsContainer.querySelector('input[type="range"]').value; // Get the value directly from the slider input
        answers.push(sliderValue);
        console.log('Slider value stored in answers:', sliderValue);
    } else {
        answers.push(option);
    }

    console.log('Answers:', answers); // Log the answers array
    console.log('Current question index:', currentQuestionIndex); // Log the current question index
    console.log('Total number of questions:', questions.length); // Log the total number of questions
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
}






function showResult() {
    // Preprocess input data
    const sex_m = answers[0];
    const breed = answers[1];
    const vaccinated = answers[2];
    const age = parseInt(answers[3]);
    const duration = answers[4];
    const severity = answers[5];
    const concurrent = answers[6];
    
    // Convert age to age group
    let age_group;
    if (age < 24) {
        age_group = 1;
    } else if (age < 60) {
        age_group = 2;
    } else {
        age_group = 3;
    }

    // Convert severity to severity_cover
    let severity_cover;
    if (severity === '< 30%') {
        severity_cover = 1;
    } else if (severity === '< 60%') {
        severity_cover = 2;
    } else {
        severity_cover = 3;
    }

    // Convert duration to duration_day
    let duration_day;
    switch(duration) {
        case '1 week':
            duration_day = 1;
            break;
        case '2 weeks':
            duration_day = 2;
            break;
        case '3 weeks':
            duration_day = 3;
            break;
        case '4 weeks':
            duration_day = 4;
            break;
    }

    // Convert vaccinated to binary
    const vaccinated_binary = vaccinated === 'Yes' ? 1 : 0;

    // Convert concurrent to binary
    const concurrent_binary = concurrent === 'Yes' ? 1 : 0;

    // Create preprocessed input data object
    const new_data_point_encoded = {
        sex_m: sex_m === 'Male' ? 1 : 0,
        breed_jry: breed === 'jry' ? 1 : 0,
        breed_hf: breed === 'hf' ? 1 : 0,
        breed_mg: breed === 'mg' ? 1 : 0,
        breed_nd: breed === 'nd' ? 1 : 0,
        vaccinated: vaccinated_binary,
        age: age_group,
        duration: duration_day,
        severity: severity_cover,
        concurrent: concurrent_binary
    };

    // Make prediction
    fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(new_data_point_encoded)
    })
    .then(response => response.json())
    .then(data => {
        const prediction = data.prediction;
        const prob_survival = data.prob_survival; // Probability of survival
        resultText.textContent = `The chances of survival are: ${prob_survival.toFixed(2)}%`;
        resultContainer.style.display = 'block';
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle error
    });

    nextButton.textContent = "Predict Again";
    // Add event listener to the next button to refresh the page when clicked
    nextButton.addEventListener("click", () => {
        location.reload(); // Refresh the page
    });
}


const answers = [];
const nextButton = document.getElementById('next-btn');
document.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'next-btn') {
        selectOption();
    }
});


// Start by showing the first question
showQuestion();
