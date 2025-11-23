/* ------------------------------
   LOGIN SYSTEM
------------------------------ */
const roleSelect = document.getElementById("roleSelect");
const usnInput = document.getElementById("usnInput");
const adminPassInput = document.getElementById("adminPass");
const loginBtn = document.getElementById("loginBtn");
const errorMsg = document.getElementById("error");

// Show input fields based on role
roleSelect?.addEventListener("change", () => {
    errorMsg.textContent = "";
    const role = roleSelect.value;

    usnInput?.classList.add("hidden");
    adminPassInput?.classList.add("hidden");

    if (role === "student") usnInput?.classList.remove("hidden");
    if (role === "admin") adminPassInput?.classList.remove("hidden");
});

// Login button click
loginBtn?.addEventListener("click", () => {
    const role = roleSelect.value;

    if (!role) {
        errorMsg.textContent = "Please select a role!";
        return;
    }

    // STUDENT LOGIN
    // STUDENT LOGIN
if (role === "student") {
    const usn = usnInput.value.trim().toUpperCase();

    if (!usn) {
        errorMsg.textContent = "Enter your USN!";
        return;
    }

    // ✅ Add validation for USN format
    const fullUSNPattern = /^[0-9]?[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$/; // e.g., 4CB24CG010
    const shortUSNPattern = /^[A-Z]{2}[0-9]{3}$/;                     // e.g., CG010

    if (!fullUSNPattern.test(usn) && !shortUSNPattern.test(usn)) {
        errorMsg.textContent = "Invalid USN! Must be like 4CB24CG010 or CG010.";
        return;
    }

    const studentObj = { name: "Student User", usn };
    localStorage.setItem("loggedInStudent", JSON.stringify(studentObj));

    // Redirect only if valid
    window.location.href = "student.html";
}

    // ADMIN LOGIN
    if (role === "admin") {
        const password = adminPassInput.value;
        if (password !== "admin123") {
            errorMsg.textContent = "Incorrect Admin Password!";
            return;
        }

        localStorage.setItem("loggedInAdmin", "true");
        window.location.href = "admin.html";
    }
});

/* ------------------------------
   EVENT CREATION (ADMIN PAGE)
------------------------------ */
const eventForm = document.getElementById("event-form");

eventForm?.addEventListener("submit", function(e) {
    e.preventDefault();

    const title = document.getElementById("admin-title").value.trim();
    const desc = document.getElementById("admin-description").value.trim();
    const venue = document.getElementById("admin-venue").value.trim();
    const date = document.getElementById("admin-date").value;
    const time = document.getElementById("admin-time").value;
    const capacity = parseInt(document.getElementById("admin-capacity").value);
    const category = document.getElementById("admin-category").value;
    const poster = document.getElementById("admin-poster").value.trim();
    const regLink = document.getElementById("admin-reglink").value.trim();

    if (!title || !desc || !venue || !date || !time || !capacity || !category) {
        alert("Please fill all required fields!");
        return;
    }

    const events = JSON.parse(localStorage.getItem("events")) || [];

    const newEvent = {
        id: Date.now(),
        title,
        desc,
        venue,
        date,
        time,
        capacity,
        category,
        poster,
        registrationLink: regLink,
        registrations: []
    };

    events.push(newEvent);
    localStorage.setItem("events", JSON.stringify(events));

    alert("Event Created Successfully!");
    eventForm.reset();

    renderAdminEvents(); // Refresh with current filter
});

/* ------------------------------
   FILTER & RENDER EVENTS (ADMIN)
------------------------------ */
const eventFilter = document.getElementById("eventFilter");
let currentFilter = "all";

eventFilter?.addEventListener("change", () => {
    currentFilter = eventFilter.value;
    renderAdminEvents();
});

function renderAdminEvents() {
    const listContainer = document.getElementById("admin-event-list-container");
    if (!listContainer) return;

    const events = JSON.parse(localStorage.getItem("events")) || [];
    const today = new Date();
    let filteredEvents = events;

    // Apply filter based on currentFilter
    if (currentFilter === "upcoming") {
        filteredEvents = events.filter(event => new Date(event.date + ' ' + event.time) >= today);
    } else if (currentFilter === "past") {
        filteredEvents = events.filter(event => new Date(event.date + ' ' + event.time) < today);
    }

    // Clear the container
    listContainer.innerHTML = filteredEvents.length === 0
        ? "<p class='text-gray-500'>No events to display.</p>"
        : "";

    filteredEvents.forEach(event => {
        const eventDateTime = new Date(event.date + ' ' + event.time);
        const status = eventDateTime >= today ? "Upcoming" : "Past";
        const badgeColor = status === "Upcoming" ? "bg-green-500" : "bg-gray-400";

        const eventCard = document.createElement("div");
        eventCard.className = "bg-white p-4 rounded-xl shadow mb-4 transition hover:scale-105 duration-200 relative flex flex-col";

        eventCard.innerHTML = `
            ${event.poster ? `<img src="${event.poster}" alt="Poster" class="w-full h-48 object-cover rounded mb-3"/>` : ""}
            <div class="flex justify-between items-center mb-1">
                <h3 class="text-lg font-bold text-gray-800">${event.title}</h3>
                <span class="px-2 py-1 text-xs text-white rounded ${badgeColor}">${status}</span>
            </div>
            <p class="text-gray-600 mt-1">${event.category.toUpperCase()} | ${event.date} • ${event.time} • ${event.venue}</p>
            <p class="text-gray-700 mt-2">${event.desc}</p>
            ${event.registrationLink ? `<p class="mt-2"><a href="${event.registrationLink}" target="_blank" class="text-blue-600 underline">Registration Link</a></p>` : ""}
            <p class="mt-2 text-gray-800">Capacity: ${event.capacity} | Registered: ${event.registrations.length}</p>
            <div class="mt-3 flex justify-between items-center">
                <!-- Trashbin Delete Icon -->
                <button onclick="deleteEvent(${event.id})" class="hover:text-red-600 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v0a1 1 0 001 1h4a1 1 0 001-1v0a1 1 0 00-1-1m-4 0h4"/>
                    </svg>
                </button>

                <!-- Download Participants Button -->
                <button onclick="downloadParticipants(${event.id})" class="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition">Download List</button>
            </div>
        `;
        listContainer.appendChild(eventCard);
    });
}

/* ------------------------------
   DELETE EVENT
------------------------------ */
function deleteEvent(eventId) {
    if (!confirm("Are you sure you want to delete this event?")) return;

    let events = JSON.parse(localStorage.getItem("events")) || [];
    events = events.filter(event => event.id !== eventId);
    localStorage.setItem("events", JSON.stringify(events));

    renderAdminEvents(); // Refresh the list
    alert("Event deleted successfully!");
}

/* ------------------------------
   DOWNLOAD PARTICIPANTS
------------------------------ */
function downloadParticipants(eventId) {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const event = events.find(ev => ev.id === eventId);
    if(!event) return alert("Event not found!");

    const participants = event.registrations;
    if(participants.length === 0) return alert("No participants registered yet.");

    let csvContent = "data:text/csv;charset=utf-8,Name,USN\n";
    participants.forEach(p => {
        csvContent += `${p.name},${p.usn}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${event.title}_participants.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/* ------------------------------
   LOGOUT
------------------------------ */
const adminLogoutBtn = document.getElementById("admin-logout-btn");

adminLogoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("loggedInAdmin");
    window.location.href = "index.html";
});

// Initial render
document.addEventListener("DOMContentLoaded", renderAdminEvents);

// student- logout

const logoutBtn = document.getElementById("student-logout-btn");

logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("loggedInStudent");
    window.location.href = "index.html";
});


