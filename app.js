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

    // Check if hello prediction is greater than 0.6
    const continueBtn = document.querySelector('.continue-btn');
    if (prediction[0].probability >= 0.6) {
        webcam.canvas.style.border = "4px solid #C1C74C";
        continueBtn.classList.add('enabled');
        continueBtn.classList.remove('disabled');
    } else {
        webcam.canvas.style.border = "none";
        continueBtn.classList.add('disabled');
        continueBtn.classList.remove('enabled');
    }
}

// Initialize webcam on page load
document.addEventListener('DOMContentLoaded', () => {
    init();
    
    // Add click handler to continue button
    const continueBtn = document.querySelector('.continue-btn');
    continueBtn.addEventListener('click', () => {
        if (continueBtn.classList.contains('enabled')) {
            // Navigate to next lesson or page
            console.log('Continue button clicked!');
            // Add your navigation logic here
            
        }
    });
});