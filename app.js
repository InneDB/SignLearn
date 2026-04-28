let images = [
    "images/sign-hello.png",
    "images/sign-goodbye.png",
    "images/sign-please.png",
    "images/sign-thankyou.png",
];

let labels = [
    "Hello",
    "Goodbye",
    "Please",
    "Thank you",
];

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
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        console.log(classPrediction);
    }

    // Check if current gesture prediction is greater than 0.6
    const continueBtn = document.querySelector('.continue-btn');
    
    // If threshold reached, keep border and button enabled until next lesson
    if (prediction[currentIndex].probability >= 0.6) {
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
    const imageElement = document.querySelector('.camera img');
    const labelElement = document.querySelector('.camera h2');
    const title = document.querySelector('.context-container h3');
    
    if (imageElement) {
        imageElement.src = images[currentIndex];
        imageElement.alt = `image sign-${labels[currentIndex].toLowerCase()}`;
    }
    
    if (labelElement) {
        labelElement.textContent = labels[currentIndex];
    }
    
    if (title) {
        title.textContent = `Learning... (${currentIndex + 1}/${labels.length})`;
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
            if (currentIndex < labels.length - 1) {
                // Move to next image/label
                currentIndex++;
                updateLessonContent();
                console.log(`Moved to lesson ${currentIndex + 1}: ${labels[currentIndex]}`);
            } else {
                // All lessons completed needs fixing 
                console.log('All lessons completed!');
                alert('Congratulations! You have completed all gestures!');
                currentIndex = 0;
                updateLessonContent();
            }
        }
    });
});