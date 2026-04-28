// Define lessons with image, label, prediction index, and threshold
let gestures = [
    {
        image: "images/sign-hello.png",
        label: "Hello",
        predictionIndex: 0,
        threshold: 0.1
    },
    {
        image: "images/sign-goodbye.png",
        label: "Goodbye",
        predictionIndex: 1,
        threshold: 0.9
    },
    {
        image: "images/sign-please.png",
        label: "Please",
        predictionIndex: 2,
        threshold: 0.9
    },
    {
        image: "images/sign-thankyou.png",
        label: "Thank you",
        predictionIndex: 3,
        threshold: 0.9
    }
];

// Legacy arrays for backwards compatibility
let images = gestures.map(lesson => lesson.image);
let labels = gestures.map(lesson => lesson.label);

// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "./model/";

let model, webcam, labelContainer, maxPredictions;
let currentIndex = 0; // Track which image/label we're on
let gestureDetected = false; // Track if gesture threshold has been reached

// Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(280, 280, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    webcam.canvas.style.borderRadius = "15px";
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    
    // Get current lesson
    const currentLesson = gestures[currentIndex];
    
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        console.log(classPrediction);
    }

    // Check if current gesture prediction meets the lesson's threshold
    const continueBtn = document.querySelector('.continue-btn');
    
    // If threshold reached, keep border and button enabled until next lesson
    if (prediction[currentLesson.predictionIndex].probability >= currentLesson.threshold) {
        gestureDetected = true;
    }
    
    // Display border and button state based on detection
    if (gestureDetected) {
        webcam.canvas.style.border = "4px solid #C1C74C";
        continueBtn.classList.add('enabled');
        continueBtn.classList.remove('disabled');
    } else {
        webcam.canvas.style.border = "none";
        continueBtn.classList.add('disabled');
        continueBtn.classList.remove('enabled');
    }
}

// Update image and label based on current index
function updateLessonContent() {
    const currentLesson = gestures[currentIndex];
    const imageElement = document.querySelector('.camera img');
    const labelElement = document.querySelector('.camera h2');
    const title = document.querySelector('.context-container h3');
    
    if (imageElement) {
        imageElement.src = currentLesson.image;
        imageElement.alt = `image sign-${currentLesson.label.toLowerCase()}`;
    }
    
    if (labelElement) {
        labelElement.textContent = currentLesson.label;
    }
    
    if (title) {
        title.textContent = `Learning... (${currentIndex + 1}/${gestures.length})`;
    }
    
    // Reset gesture detection for new lesson
    gestureDetected = false;
    
    // Reset button state
    const continueBtn = document.querySelector('.continue-btn');
    if (continueBtn) {
        continueBtn.classList.add('disabled');
        continueBtn.classList.remove('enabled');
    }
    
    // Reset border
    const webcamCanvas = document.querySelector('#webcam-container canvas');
    if (webcamCanvas) {
        webcamCanvas.style.border = "none";
    }
}

// Initialize webcam on page load
document.addEventListener('DOMContentLoaded', () => {
    init();
    updateLessonContent();
    
    // Add click handler to continue button
    const continueBtn = document.querySelector('.continue-btn');
    continueBtn.addEventListener('click', () => {
        if (continueBtn.classList.contains('enabled')) {
            if (currentIndex < gestures.length - 1) {
                // Move to next image/label
                currentIndex++;
                updateLessonContent();
                console.log(`Moved to lesson ${currentIndex + 1}: ${gestures[currentIndex].label}`);
            } else {
                // All gestures completed
                console.log('All gestures completed!');
                // Mark lesson as complete in localStorage
                localStorage.setItem('lesson_basics_completed', 'true');
                alert('Congratulations! You have completed all gestures!');
                // Redirect to index page
                window.location.href = 'index.html';
            }
        }
    });
});