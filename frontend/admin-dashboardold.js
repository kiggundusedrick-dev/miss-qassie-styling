// ======================================================
// MISS QASSIE ADMIN DASHBOARD
// ======================================================

const API_URL = "http://localhost:5000";

const token = localStorage.getItem("adminToken");

if (!token) {

    window.location.href = "admin-in.html";

}

// ===============================
// DOM ELEMENTS
// ===============================

const tableBody =
document.getElementById("tableBody");

const totalCount =
document.getElementById("totalCount");

const newCount =
document.getElementById("newCount");

const contactedCount =
document.getElementById("contactedCount");

const todayCount =
document.getElementById("todayCount");

const loadingIndicator =
document.getElementById("loadingIndicator");

const emptyState =
document.getElementById("emptyState");

const notificationBox =
document.getElementById("notificationBox");

const searchInput =
document.getElementById("searchInput");

const serviceFilter =
document.getElementById("serviceFilter");

const statusFilter =
document.getElementById("statusFilter");

const sortFilter =
document.getElementById("sortFilter");

let enquiries = [];

let filteredEnquiries = [];

async function apiFetch(url, options = {}) {

    const response = await fetch(

        `${API_URL}${url}`,

        {

            ...options,

            headers: {

                Authorization: `Bearer ${token}`,

                ...(options.headers || {})

            }

        }

    );

    if (response.status === 401) {

        localStorage.removeItem("adminToken");

        localStorage.removeItem("adminName");

        window.location.href = "admin-login.html";

        return;

    }

    return response;

}

async function loadEnquiries() {

    try {

        loadingIndicator.style.display = "flex";

        const response = await apiFetch("/enquiries");

        if (!response.ok) {

            throw new Error("Failed to load enquiries");

        }

        enquiries = await response.json();

        filteredEnquiries = [...enquiries];

        updateDashboardCards();

        renderTable();

        updateChart();

        updateNotifications();

    }

    catch(error){

        console.error(error);

    }

    finally{

        loadingIndicator.style.display = "none";

    }

}

function updateDashboardCards(){

    totalCount.textContent =
    enquiries.length;

    newCount.textContent =
    enquiries.filter(

        e => e.status === "new"

    ).length;

    contactedCount.textContent =
    enquiries.filter(

        e => e.status === "contacted"

    ).length;

    const today =
    new Date().toDateString();

    todayCount.textContent =
    enquiries.filter(

        e =>

        new Date(
            e.created_at
        ).toDateString() === today

    ).length;

}

function applyFilters(){

    const search =
    searchInput.value.toLowerCase().trim();

    filteredEnquiries = enquiries.filter(enquiry => {

        const matchesSearch =

            enquiry.name.toLowerCase().includes(search) ||

            enquiry.email.toLowerCase().includes(search) ||

            enquiry.service.toLowerCase().includes(search);

        const matchesService =

            serviceFilter.value === "all" ||

            enquiry.service === serviceFilter.value;

        const matchesStatus =

            statusFilter.value === "all" ||

            enquiry.status === statusFilter.value;

        return (

            matchesSearch &&
            matchesService &&
            matchesStatus

        );

    });

    filteredEnquiries.sort((a,b)=>{

        const dateA =
        new Date(a.created_at);

        const dateB =
        new Date(b.created_at);

        if(sortFilter.value==="newest"){

            return dateB-dateA;

        }

        return dateA-dateB;

    });

    renderTable();

}

function renderTable(){

    tableBody.innerHTML="";

    if(filteredEnquiries.length===0){

        emptyState.style.display="block";

        return;

    }

    emptyState.style.display="none";

    filteredEnquiries.forEach(enquiry=>{

        const row=document.createElement("tr");

        row.innerHTML=`

            <td>${enquiry.name}</td>

            <td>${enquiry.email}</td>

            <td>${enquiry.service}</td>

            <td>${new Date(enquiry.created_at).toLocaleDateString()}</td>

            <td>

                <button class="view-btn"
                    data-id="${enquiry.id}">
                    View
                </button>

                <button class="reply-btn"
                    data-id="${enquiry.id}">
                    Reply
                </button>

                <button class="delete-btn"
                    data-id="${enquiry.id}">
                    Delete
                </button>

            </td>

            <td>${enquiry.status}</td>

        `;

        tableBody.appendChild(row);

    });

}

searchInput.addEventListener("input",applyFilters);

serviceFilter.addEventListener("change",applyFilters);

statusFilter.addEventListener("change",applyFilters);

sortFilter.addEventListener("change",applyFilters);

function updateNotifications(){

    const newItems=enquiries.filter(

        e=>e.status==="new"

    ).length;

    if(newItems>0){

        notificationBox.textContent=

        `🔔 ${newItems} new enquiry(s)`;

    }

    else{

        notificationBox.textContent=

        "🔔 No new notifications";

    }

}

