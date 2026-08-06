// ======================================================
// MISS QUASSIE STYLING
// ADMIN DASHBOARD V2
// Version 2.0
// ======================================================


// ======================================================
// API
// ======================================================

console.log("ADMIN DASHBOARD V2 LOADED");

const API_URL = "http://localhost:5000";


// ======================================================
// GLOBAL DATA
// ======================================================

let enquiries = [];

let filteredEnquiries = [];

let currentPage = 1;

const rowsPerPage = 10;

let analyticsChart = null;

let lastSeenEnquiryId = 0;

let notificationQueue = [];

let notificationTimer = null;

let latestNotificationEnquiry = null;


// ======================================================
// DOM ELEMENTS
// ======================================================

const tableBody =
document.querySelector("#tableBody");

const searchInput =
document.querySelector("#searchInput");

const loadingIndicator =
document.querySelector("#loadingIndicator");

const emptyState =
document.querySelector("#emptyState");


// Dashboard Cards

const totalCard =
document.getElementById("totalCount");

const pendingCard =
document.getElementById("newCount");

const contactedCard =
document.getElementById("contactedCount");

const repliedCard =
document.getElementById("todayCount");


// ======================================================
// MODALS
// ======================================================

const viewModal =
document.getElementById("viewModal");

const replyModal =
document.getElementById("replyModal");

const deleteModal =
document.getElementById("deleteModal");


// ======================================================
// VIEW MODAL DETAILS
// ======================================================

const detailName =
document.getElementById("detailName");

const detailEmail =
document.getElementById("detailEmail");

const detailService =
document.getElementById("detailService");

const detailMessage =
document.getElementById("detailMessage");

const detailDate =
document.getElementById("detailDate");


// ======================================================
// REPLY MODAL
// ======================================================

const replyEmail =
document.getElementById("replyEmail");

const replySubject =
document.getElementById("replySubject");

const replyMessage =
document.getElementById("replyMessage");

const sendReplyBtn =
document.getElementById("sendReplyBtn");


// ======================================================
// DELETE MODAL
// ======================================================

const confirmDelete =
document.getElementById("confirmModal");

const cancelDelete =
document.getElementById("cancelModal");

// ======================================================
// INITIALIZE DASHBOARD
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    initializeDashboard();

});


// ======================================================
// INITIALIZE
// ======================================================

async function initializeDashboard() {

    showLoading();

    await loadEnquiries();

    initializeSearch();

    hideLoading();

}

// ======================================================
// LOADING
// ======================================================


// ======================================================
// EMPTY STATE
// ======================================================

function showEmptyState() {

    if (emptyState) {

        emptyState.style.display = "block";

    }

}


function hideEmptyState() {

    if (emptyState) {

        emptyState.style.display = "none";

    }

}

// ======================================================
// LOAD ENQUIRIES
// ======================================================

async function loadEnquiries() {

    try {

        const response =
            await fetch(`${API_URL}/enquiries`);

        if (!response.ok) {

            throw new Error("Failed to load enquiries.");

        }

        enquiries =
            await response.json();

        filteredEnquiries =
            [...enquiries];

        if (enquiries.length === 0) {

            showEmptyState();

        } else {

            hideEmptyState();

        }

        updateDashboardCards();

        renderTable();

    }

    catch (error) {

        console.error(error);

        alert("Unable to load enquiries.");

    }

}

// ======================================================
// DASHBOARD CARDS
// ======================================================

// =======================================
// MONTHLY ANALYTICS CHART
// =======================================

function updateAnalyticsChart() {

    const stats =
        getMonthlyStatistics();

    const ctx =
        document.getElementById("analyticsChart");

    if (!ctx) return;

    if (analyticsChart) {

        analyticsChart.destroy();

    }

    analyticsChart =
        new Chart(ctx, {

            type: "bar",

            data: {

                labels: stats.labels,

                datasets: [

                    {

                        label: "Enquiries",

                        data: stats.data,

                        backgroundColor:
                        "#C9A96E",

                        borderRadius: 8

                    }

                ]

            },

            options: {

                responsive: true,

                plugins: {

                    legend: {

                        display: false

                    }

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {

                            precision: 0

                        }

                    }

                }

            }

        });

}
// =======================================
// MONTHLY STATISTICS
// =======================================

function getMonthlyStatistics() {

    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];

    const monthlyData = new Array(12).fill(0);

    enquiries.forEach(enquiry => {

        const month =
            new Date(enquiry.created_at).getMonth();

        monthlyData[month]++;

    });

    return {

        labels: months,

        data: monthlyData

    };

}

// ======================================================
// SEARCH
// ======================================================

function initializeSearch() {

    searchInput.addEventListener("input", function () {

        const keyword =
            this.value
            .toLowerCase();

        filteredEnquiries =
            enquiries.filter(enquiry =>

                enquiry.first_name
                .toLowerCase()
                .includes(keyword)

                ||

                enquiry.last_name
                .toLowerCase()
                .includes(keyword)

                ||

                enquiry.email
                .toLowerCase()
                .includes(keyword)

                ||

                enquiry.service
                .toLowerCase()
                .includes(keyword)

            );

        renderTable();

    });

}

// ======================================================
// TABLE
// ======================================================

function renderTable() {

    tableBody.innerHTML = "";

    if (filteredEnquiries.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:30px;">
                    No enquiries found.
                </td>
            </tr>
        `;

        return;

    }

    filteredEnquiries.forEach(enquiry => {

        const row =
            document.createElement("tr");

        row.dataset.id = enquiry.id;

        row.innerHTML = `

            <td>
                ${enquiry.first_name}
                ${enquiry.last_name}
            </td>

            <td>
                ${enquiry.email}
            </td>

            <td>
                ${enquiry.service}
            </td>

            <td>
                ${new Date(
                    enquiry.created_at
                ).toLocaleDateString()}
            </td>

            <td>

                <button class="viewBtn">
                    👁 View
                </button>

                <button class="replyBtn">
                    ✉ Reply
                </button>

                <button class="deleteBtn">
                    🗑 Delete
                </button>

            </td>

            <td>

                ${
                    enquiry.replied

                    ?

                    `<span class="statusBadge replied">
                        Replied
                    </span>`

                    :

                    enquiry.contacted

                    ?

                    `<span class="statusBadge contacted">
                        Contacted
                    </span>`

                    :

                    `<button class="contactBtn">
                        Mark Contacted
                    </button>`
                }

            </td>

        `;

        tableBody.appendChild(row);

        attachRowEvents(row, enquiry);

    });

}

// ======================================================
// ROW EVENTS
// ======================================================

function attachRowEvents(row, enquiry) {

    // ==========================
    // VIEW BUTTON
    // ==========================

    const viewBtn =
        row.querySelector(".viewBtn");

    viewBtn.addEventListener("click", () => {

        detailName.textContent =
            `${enquiry.first_name} ${enquiry.last_name}`;

        detailEmail.textContent =
            enquiry.email;

        detailService.textContent =
            enquiry.service;

        detailMessage.textContent =
            enquiry.message;

        detailDate.textContent =
            new Date(
                enquiry.created_at
            ).toLocaleString();

        viewModal.style.display = "flex";

    });

}

// ======================================================
// ROW EVENTS
// ======================================================

function attachRowEvents(row, enquiry) {

    // -----------------------
    // VIEW
    // -----------------------

    const viewBtn =
        row.querySelector(".viewBtn");

    viewBtn.onclick = function () {

        detailName.textContent =
            `${enquiry.first_name} ${enquiry.last_name}`;

        detailEmail.textContent =
            enquiry.email;

        detailService.textContent =
            enquiry.service;

        detailMessage.textContent =
            enquiry.message;

        detailDate.textContent =
            new Date(
                enquiry.created_at
            ).toLocaleString();

        viewModal.style.display =
            "flex";

    };



    // -----------------------
    // REPLY
    // -----------------------

    const replyBtn =
        row.querySelector(".replyBtn");

    replyBtn.onclick = function () {

        replyEmail.textContent =
            enquiry.email;

        replySubject.value =
            "Re: Your Styling Enquiry";

        replyMessage.value =
`Hello ${enquiry.first_name},

Thank you for contacting Miss Quassie Styling.

`;

        replyModal.style.display =
            "flex";

    };

}    

// ======================================================
// VIEW MODAL
// ======================================================

const closeViewModal =
document.getElementById("closeViewModal");

const closeX =
document.getElementById("closeX");

if (closeViewModal) {

    closeViewModal.addEventListener("click", () => {

        viewModal.style.display = "none";

    });

}

if (closeX) {

    closeX.addEventListener("click", () => {

        viewModal.style.display = "none";

    });

}

window.addEventListener("click", (event) => {

    if (event.target === viewModal) {

        viewModal.style.display = "none";

    }

});

   // ======================================================
// REPLY MODAL
// ======================================================

const closeReplyBtn =
document.getElementById("closeReplyBtn");

if (closeReplyBtn) {

    closeReplyBtn.addEventListener("click", () => {

        replyModal.style.display = "none";

    });

}

window.addEventListener("click", (event) => {

    if (event.target === replyModal) {

        replyModal.style.display = "none";

    }

});