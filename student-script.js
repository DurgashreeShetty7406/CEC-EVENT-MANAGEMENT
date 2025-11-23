// Get DOM elements
const eventsContainer = document.getElementById('eventsContainer');
const categoryButtons = document.querySelectorAll('.category-btn');
const logoutBtn = document.getElementById("student-logout-btn");

// Get logged-in student info
const student = JSON.parse(localStorage.getItem("loggedInStudent"));
if (!student) window.location.href = "index.html"; // Redirect if not logged in

// Logout functionality
logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("loggedInStudent");
    window.location.href = "index.html";
});

// Show events based on category
function showEvents(category) {
    eventsContainer.innerHTML = "";
    const events = JSON.parse(localStorage.getItem("events")) || [];
    if(events.length === 0) return;

    const filtered = events.filter(e => e.category.toLowerCase() === category.toLowerCase());
    filtered.forEach(event => {
        const slotsLeft = event.capacity - event.registrations.length;
        const alreadyRegistered = event.registrations.some(r => r.usn === student.usn);

        const eventCard = document.createElement('div');
        eventCard.className = "bg-white p-4 rounded-xl shadow hover:shadow-lg transition duration-200 flex flex-col";

        eventCard.innerHTML = `
            ${event.poster ? `<img src="${event.poster}" alt="${event.title}" class="w-full h-40 object-cover rounded mb-3">` : ""}
            <h3 class="text-xl font-semibold mb-1">${event.title}</h3>
            <p class="text-gray-700 mb-1">${event.desc}</p>
            <p class="text-gray-500 mb-1"><strong>Category:</strong> ${event.category}</p>
            <p class="text-gray-500 mb-1"><strong>Date:</strong> ${event.date}</p>
            <p class="text-gray-500 mb-1"><strong>Time:</strong> ${event.time}</p>
            <p class="text-gray-500 mb-1"><strong>Venue:</strong> ${event.venue}</p>
            <p class="text-gray-500 mb-1"><strong>Slots Left:</strong> ${slotsLeft}</p>
            <button class="mt-2 px-4 py-2 rounded text-white ${alreadyRegistered || slotsLeft===0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}"
                ${alreadyRegistered || slotsLeft===0 ? 'disabled' : ''} onclick="registerEvent(${event.id})">
                ${alreadyRegistered ? 'Registered' : slotsLeft===0 ? 'Full' : 'Register'}
            </button>
        `;
        eventsContainer.appendChild(eventCard);
    });
}

// Register student for event
function registerEvent(eventId) {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const event = events.find(e => e.id === eventId);

    if (!event) return alert("Event not found!");
    if (event.registrations.some(r => r.usn === student.usn)) return alert("Already registered!");
    if (event.registrations.length >= event.capacity) return alert("Event is full!");

    event.registrations.push({ name: student.name, usn: student.usn });
    localStorage.setItem("events", JSON.stringify(events));

    alert("Registered Successfully!");
    showEvents(event.category); // Refresh events in the same category
}

// Initialize with default category
function initialize() {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    if (events.length > 0) showEvents('technical');
}

// Category filter buttons
categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => showEvents(btn.dataset.category));
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', initialize);

