// navbar function
// Function to handle scrolling
function scrollToSection(sectionId) {
    const targetSection = document.querySelector(`[data-section="${sectionId}"]`);
    if (targetSection) {
        window.scrollTo({
            top: targetSection.offsetTop,
            behavior: 'smooth'
        });
    }
}

// Function to handle navigation
function handleNavigation(sectionId) {
    // Check if we're already on index.html
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
        scrollToSection(sectionId);
    } else {
        // Redirect to index.html with the section parameter
        window.location.href = `index.html?section=${sectionId}`;
    }
}

// Fetch and load navbar content
fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('colorlib-aside').innerHTML = data;

        // Add click event listeners to navigation links
        document.querySelectorAll('a[data-nav-section]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const sectionId = this.getAttribute('data-nav-section');
                handleNavigation(sectionId);
            });
        });
    })
    .catch(error => console.error('Error loading navbar:', error));

// Handle URL parameters to scroll to the correct section on page load
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sectionId = urlParams.get('section');
    if (sectionId) {
        // Scroll to the section after a brief delay to ensure the page has fully loaded
        setTimeout(() => scrollToSection(sectionId), 100); // Adjust the delay if needed
    }
});


// Typing effect text-coder-style
const texts = [
    "Python Lover",
    "Information Intelligence Engineering Student",
    "ML/AI Enthusiast",
    "Ready to learn new technology",
];
const typingSpeed = 100; // Adjust typing speed
const pauseTime = 2000; // Time to pause at the end of each text
let textIndex = 0;
let charIndex = 0;

function typeText() {
    const textElement = document.getElementById('text-coder-style');
    const currentText = texts[textIndex];

    if (charIndex < currentText.length) {
        textElement.innerHTML = `> print("${currentText.substring(0, charIndex + 1)}")`;
        charIndex++;
        setTimeout(typeText, typingSpeed);
    } else {
        setTimeout(() => {
            deleteText();
        }, pauseTime);
    }
}

function deleteText() {
    const textElement = document.getElementById('text-coder-style');
    const currentText = texts[textIndex];

    if (charIndex > 0) {
        textElement.innerHTML = `> print("${currentText.substring(0, charIndex - 1)}")`;
        charIndex--;
        setTimeout(deleteText, typingSpeed);
    } else {
        textIndex = (textIndex + 1) % texts.length;
        setTimeout(typeText, typingSpeed);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const textElement = document.getElementById('text-coder-style');
    if (textElement) {
        typeText();
    }
});

// github projects counter
function getProjectsCount(counterDiv, repoCount) {
    // Create the counter element
    const counterElement = document.createElement('span');
    counterElement.id = 'projects-counter';
    counterElement.className = 'colorlib-counter js-counter';
    counterElement.setAttribute('data-from', '0');
    counterElement.setAttribute('data-to', repoCount);
    counterElement.setAttribute('data-speed', '5000');
    counterElement.setAttribute('data-refresh-interval', '50');
    counterElement.textContent = repoCount; // Update the text content

    // Create the label element
    const labelElement = document.createElement('span');
    labelElement.className = 'colorlib-counter-label';
    labelElement.textContent = 'Projects';

    // Append the counter and label elements to the div
    counterDiv.appendChild(counterElement);
    counterDiv.appendChild(labelElement);
}

document.addEventListener("DOMContentLoaded", function () {
    try {
        const counterDiv = document.getElementById('projects-counter-div');
        if (!counterDiv) {
            throw new Error('Element with id "projects-counter-div" not found');
        }

        const username = 'zerozedsc'; // Replace with your GitHub username
        const url = `https://api.github.com/users/${username}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const repoCount = data.public_repos;
                getProjectsCount(counterDiv, repoCount);
                // console.log(`Repo count: ${repoCount}`); // Debugging log
            })
            .catch(error => {
                console.error('Error fetching GitHub data:', error);
                getProjectsCount(counterDiv, 0);
            });
    } catch (error) {

    }
});

// Change picture of colorlib-counter when in mobile device
document.addEventListener("DOMContentLoaded", function () {
    function isMobileDevice() {
        return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1) || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    }

    function updateBackgroundImage() {
        const counterDiv = document.getElementById('colorlib-counter');
        if (window.matchMedia("(orientation: portrait)").matches) {
            counterDiv.style.backgroundImage = "url('images/cover_bg_1mobile.jpg')";
        } else {
            counterDiv.style.backgroundImage = "url('images/cover_bg_1.jpg')";
        }
    }

    if (isMobileDevice()) {
        updateBackgroundImage();
        window.addEventListener("resize", updateBackgroundImage);
        window.addEventListener("orientationchange", updateBackgroundImage);
    }
});

