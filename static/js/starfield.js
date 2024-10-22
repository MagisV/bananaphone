// Starfield animation code
const canvas = document.getElementById('starfield');
const context = canvas.getContext('2d');
const speedFactor = 0.05; // Adjust this value to change the overall speed

// Resize the canvas to fill the browser window dynamically
window.addEventListener('resize', resizeCanvas, false);
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();

const numStars = 500; // Adjust the number of stars
const stars = [];

// Initialize stars
for (let i = 0; i < numStars; i++) {
    stars.push(new Star());
}

function Star() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.z = Math.random() * canvas.width;
    this.size = Math.random() * 2 + 1;
    this.speed = Math.random() * 3 + 1;
}

function animate() {
    context.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent background
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numStars; i++) {
        let star = stars[i];
        star.z -= star.speed * speedFactor;

        if (star.z <= 0) {
            star.z = canvas.width;
            star.x = Math.random() * canvas.width;
            star.y = Math.random() * canvas.height;
            star.size = Math.random() * 2 + 1;
            star.speed = Math.random() * 3 + 1;
        }

        const k = 128 / star.z;
        const x = (star.x - canvas.width / 2) * k + canvas.width / 2;
        const y = (star.y - canvas.height / 2) * k + canvas.height / 2;
        const size = (1 - star.z / canvas.width) * star.size * 2;

        // Set the fill style with dynamic opacity
        let opacity = (1 - star.z / canvas.width) + 0.5;
        if (opacity > 1) opacity = 1; // Ensure opacity does not exceed 1

        context.fillStyle = `rgba(255, 255, 255, ${opacity})`;

        // Draw the star
        context.beginPath();
        context.arc(x, y, size, 0, Math.PI * 2);
        context.fill();
    }

    requestAnimationFrame(animate);
}

animate();
