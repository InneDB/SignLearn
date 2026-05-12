export default class Gestures {
    constructor() {
        this.gestures = [
            {
                image: "images/sign-hello.png",
                label: "Hello",
                instruction: "Raise your hand up to the side of your forehead near your temple, keep your fingers together and your palm facing outward. Then move your hand outward and slightly away from your head, like a small wave starting from your forehead.",
                predictionIndex: 0,
                threshold: 0.8
            },
            {
                image: "images/sign-goodbye.png",
                label: "Goodbye",
                instruction: "Raise your hand near the side of your head, around ear or cheek level. Keep your palm facing outward, away from your face. Hold your fingers together and straight, like a flat hand. Then bend your fingers slightly toward your palm and open them again, repeating a small motion.",
                predictionIndex: 1,
                threshold: 0.9
            },
            {
                image: "images/sign-please.png",
                label: "Please",
                instruction: "Place your hand flat on the center of your chest, with your palm touching your chest. Keep your fingers together. Move your hand in a small circular motion on your chest. Repeat the gentle circular motion once or twice.",
                predictionIndex: 2,
                threshold: 0.9
            },
            {
                image: "images/sign-thankyou.png",
                label: "Thank you",
                instruction: "Bring your hand up to your chin. Keep your fingers together and your palm facing to yourself. Lightly touch your chin area with your fingertips. Then move your hand forward and away from your face.",
                predictionIndex: 3,
                threshold: 0.9
            }
        ];
    }
}
