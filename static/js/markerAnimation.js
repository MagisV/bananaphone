// Easing function for decelerating effect (ease-out)
function easeOutQuad(t) {
    return t * (2 - t);
}

// Function to animate marker movement and percentage updates
function animateMarker(previousBananaPercentage, previousPhonePercentage, targetBananaPercentage, targetPhonePercentage, duration) {

    const marker = document.getElementById('marker');
    const dynamicLine = document.getElementById('dynamic-line');
    const bananaPercentageElement = document.getElementById('banana-percentage');
    const phonePercentageElement = document.getElementById('phone-percentage');
    const submitButton = document.querySelector('#similarity-form button');

    let start = null;

    // Disable the submit button during animation
    submitButton.disabled = true;

    function animate(timestamp) {
        if (!start) start = timestamp;
        let elapsed = timestamp - start;
        let progress = Math.min(elapsed / duration, 1); // Ensure progress does not exceed 1

        // Apply easing function
        let easedProgress = easeOutQuad(progress);

        // Calculate current percentages
        let currentBananaPercentage = previousBananaPercentage + (targetBananaPercentage - previousBananaPercentage) * easedProgress;
        let currentPhonePercentage = previousPhonePercentage + (targetPhonePercentage - previousPhonePercentage) * easedProgress;

        // Update marker position
        let markerPosition = currentBananaPercentage;
        marker.style.left = `calc(${markerPosition}% - 5px)`; // Adjust for marker width

        // Update dynamic line gradient
        dynamicLine.style.background = `linear-gradient(to right, yellow ${markerPosition}%, purple ${markerPosition}%)`;

        // Update percentage texts
        bananaPercentageElement.textContent = `${Math.round(currentBananaPercentage)}%`;
        phonePercentageElement.textContent = `${Math.round(currentPhonePercentage)}%`;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // At the end of the animation, set values to exact targets
            currentBananaPercentage = targetBananaPercentage;
            currentPhonePercentage = targetPhonePercentage;
            markerPosition = currentBananaPercentage;
            marker.style.left = `calc(${markerPosition}% - 5px)`;
            dynamicLine.style.background = `linear-gradient(to right, yellow ${markerPosition}%, purple ${markerPosition}%)`;
            bananaPercentageElement.textContent = `${Math.round(currentBananaPercentage)}%`;
            phonePercentageElement.textContent = `${Math.round(currentPhonePercentage)}%`;

            // Re-enable the submit button after animation completes
            submitButton.disabled = false;
        }
    }

    requestAnimationFrame(animate);
}


document.addEventListener('DOMContentLoaded', function() {
    // Initialize previous percentages
    let previousBananaPercentage = 50;
    let previousPhonePercentage = 50;

    // Get DOM elements
    const marker = document.getElementById('marker');
    const dynamicLine = document.getElementById('dynamic-line');
    const bananaPercentageElement = document.getElementById('banana-percentage');
    const phonePercentageElement = document.getElementById('phone-percentage');
    const submitButton = document.querySelector('#similarity-form button');

    // Calculate initial marker position
    let initialMarkerPosition = previousBananaPercentage;
    marker.style.left = `calc(${initialMarkerPosition}% - 5px)`; // Adjust for marker width
    dynamicLine.style.background = `linear-gradient(to right, yellow ${initialMarkerPosition}%, purple ${initialMarkerPosition}%)`;

    // Update percentage texts
    bananaPercentageElement.textContent = `${previousBananaPercentage}%`;
    phonePercentageElement.textContent = `${previousPhonePercentage}%`;

    document.getElementById('similarity-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        const wordInput = document.getElementById('word');
        const word = wordInput.value;

        // Send AJAX request to the server
        fetch('/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: `word=${encodeURIComponent(word)}`
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                // Update the marker position and percentage displays with animation
                const targetBananaPercentage = data.banana;
                const targetPhonePercentage = data.phone;

                // Start animation (duration in milliseconds)
                animateMarker(previousBananaPercentage, previousPhonePercentage, targetBananaPercentage, targetPhonePercentage, 4000);

                // Update previous percentages for the next animation
                previousBananaPercentage = targetBananaPercentage;
                previousPhonePercentage = targetPhonePercentage;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while processing your request.');
        });
    });
});