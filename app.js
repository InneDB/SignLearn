import Gestures from "./Gestures.js";
const gesturesSource = new Gestures();
const gestures = gesturesSource.gestures;

// Legacy arrays for backwards compatibility
const images = gestures.map(lesson => lesson.image);
const labels = gestures.map(lesson => lesson.label);

// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "./model/";

let model, webcam, labelContainer, maxPredictions;
let currentIndex = 0; // Track which image/label we're on
let gestureDetected = false; // Track if gesture threshold has been reached
let lessonCompleted = false; // Track whether the lesson flow has finished
let predictionReady = false; // Wait until the timer has completed before accepting gestures
let predictionTimer = null;

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
    const continueBtn = document.querySelector('.continue-btn');
    if (!predictionReady) {
        webcam.canvas.style.border = "none";
        if (continueBtn) {
            continueBtn.classList.add('disabled');
            continueBtn.classList.remove('enabled');
        }
        return;
    }

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
    if (prediction[currentLesson.predictionIndex].probability >= currentLesson.threshold) {
        gestureDetected = true;
    }
    
    // Display border and button state based on detection
    if (gestureDetected) {
        webcam.canvas.style.border = "4px solid #C1C74C";
        if (continueBtn) {
            continueBtn.classList.add('enabled');
            continueBtn.classList.remove('disabled');
        }
    } else {
        webcam.canvas.style.border = "none";
        if (continueBtn) {
            continueBtn.classList.add('disabled');
            continueBtn.classList.remove('enabled');
        }
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
        const titles = ["Learning...", "Keep going...", "Halfway there...", "Almost there.."];
        title.textContent = titles[currentIndex];
    }

    const instructionsElement = document.querySelector('.instructions');
    if (instructionsElement) {
        instructionsElement.innerHTML = currentLesson.instruction;
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

    // Start the 5-second countdown before gesture detection begins
    startPredictionDelay();

    // Update progress bar based on the current lesson index
    updateProgressBar();
}

function startPredictionDelay() {
    predictionReady = false;
    gestureDetected = false;

    if (predictionTimer) {
        clearTimeout(predictionTimer);
    }

    predictionTimer = setTimeout(() => {
        predictionReady = true;
    }, 5000);
}

function updateProgressBar() {
    const progressbarFill = document.querySelector('.progressbar-fill');
    if (!progressbarFill) return;

    const totalLessons = gestures.length;
    const progress = totalLessons > 0 ? (currentIndex / totalLessons) * 100 : 100;

    progressbarFill.style.width = `${progress}%`;
}

function showFinishedMessage() {
    const cameraWrapper = document.querySelector('.camera-wrapper');
    if (cameraWrapper) {
        cameraWrapper.remove();
    }

    const finishedMessage = document.createElement('h4');
    finishedMessage.textContent = 'Finished✨';
    finishedMessage.className = 'finished-message';
    finishedMessage.style.textAlign = 'center';
    finishedMessage.style.marginTop = '3em';
    finishedMessage.style.fontSize = '4em';

    document.querySelector('.context-container h3').innerHTML = "Done";
    document.querySelector('.context-container p').innerHTML = "";

    const contextContainer = document.querySelector('.context-container');
    if (contextContainer) {
        contextContainer.appendChild(finishedMessage);
    }

    const continueBtn = document.querySelector('.continue-btn');
    if (continueBtn) {
        lessonCompleted = true;
        continueBtn.classList.add('enabled');
        continueBtn.classList.remove('disabled');
        continueBtn.style.display = '';
        continueBtn.style.position = 'fixed';
        continueBtn.style.bottom = '4em';
        continueBtn.style.right = '4em';
        continueBtn.style.top = 'auto';
    }
}

// Initialize page behavior on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Index page progressbar initialization
    const basicsProgressbar = document.querySelector('.thebasics .progressbar-fill');
    if (basicsProgressbar) {
        basicsProgressbar.style.width = '0%';
        if (localStorage.getItem('lesson_basics_completed') === 'true') {
            basicsProgressbar.style.width = '100%';
            basicsProgressbar.style.backgroundColor = '#C1C74C';
        }
    }

    // Unlock alphabet lesson if basics completed
    if (localStorage.getItem('lesson_basics_completed') === 'true') {
        const theAlphabet = document.querySelector('.thealphabet');
        if (theAlphabet) {
            theAlphabet.style.opacity = '1';
            theAlphabet.style.backgroundColor = '#AA9BF8';
            const lockImg = theAlphabet.querySelector('img');
            if (lockImg) {
                lockImg.style.display = 'none';
            }
        }
    }

    // Basics lesson page initialization
    const webcamContainer = document.getElementById('webcam-container');
    if (webcamContainer) {
        init();
        updateLessonContent();

        const continueBtn = document.querySelector('.continue-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                if (continueBtn.classList.contains('enabled')) {
                    if (lessonCompleted) {
                        window.location.href = 'index.html';
                        return;
                    }

                    if (currentIndex < gestures.length - 1) {
                        // Move to next image/label
                        currentIndex++;
                        updateLessonContent();
                        console.log(`Moved to lesson ${currentIndex + 1}: ${gestures[currentIndex].label}`);
                    } else {
                        // All gestures completed
                        console.log('All gestures completed!');
                        localStorage.setItem('lesson_basics_completed', 'true');
                        const progressbarFill = document.querySelector('.progressbar-fill');
                        if (progressbarFill) {
                            progressbarFill.style.width = '100%';
                        }
                        showFinishedMessage();
                    }
                }
            });
        }
    }
});