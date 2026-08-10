 

if (!token) {
    window.location.replace("admin-login.html");
}

// ======================================
// LOGOUT
// ======================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        const confirmLogout = confirm(
            "Are you sure you want to logout?"
        );

        if (!confirmLogout) {
            return;
        }

        // Remove JWT token
        localStorage.removeItem("adminToken");

        // Remove stored admin details
        localStorage.removeItem("adminName");
        localStorage.removeItem("adminRole");

        // Keep or remove remembered email depending on your preference.
        // Since "Remember Me" only remembers the email, we leave it.

        window.location.href = "admin-login.html";

    });

}

// ======================================
// BACK TO WEBSITE
// ======================================

const websiteBtn = document.getElementById("websiteBtn");

if (websiteBtn) {

    websiteBtn.addEventListener("click", () => {

        window.location.href = "./index.html";

    });

}

// ---------------------------
// DELETE MODAL
// ---------------------------

const deleteModal =
document.getElementById(
  "modalOverlay"
);

const confirmDelete =
document.getElementById(
  "confirmModal"
);

const cancelDelete =
document.getElementById(
  "cancelModal"
);

// ---------------------------
// VIEW MODAL
// ---------------------------

const viewModal =
document.getElementById(
  "viewModal"
);

const closeViewModal =
document.getElementById(
  "closeViewModal"
);

const closeX =
document.getElementById(
  "closeX"
);

const detailName =
document.getElementById(
  "detailName"
);

const detailEmail =
document.getElementById(
  "detailEmail"
);

const detailService =
document.getElementById(
  "detailService"
);

const detailMessage =
document.getElementById(
  "detailMessage"
);

const detailDate =
document.getElementById(
  "detailDate"
);

const detailReplyStatus =
document.getElementById("detailReplyStatus");

const detailReplySubject =
document.getElementById("detailReplySubject");

const detailReplyMessage =
document.getElementById("detailReplyMessage");

const detailReplyDate =
document.getElementById("detailReplyDate");

// ---------------------------
// REPLY MODAL
// ---------------------------

const replyModal =
document.getElementById(
  "replyModal"
);

const replyEmail =
document.getElementById(
  "replyEmail"
);

const replySubject =
document.getElementById(
  "replySubject"
);

const replyMessage =
document.getElementById(
  "replyMessage"
);

const sendReplyBtn =
document.getElementById(
  "sendReplyBtn"
);

const closeReplyBtn =
document.getElementById(
  "closeReplyBtn"
);

// ---------------------------
// DASHBOARD CARDS
// ---------------------------

const totalCount =
document.getElementById(
  "totalCount"
);

const newCount =
document.getElementById(
  "newCount"
);

const contactedCount =
document.getElementById(
  "contactedCount"
);

const todayCount =
document.getElementById(
  "todayCount"
);

// ---------------------------
// SEARCH
// ---------------------------

const searchInput =
document.getElementById(
  "searchInput"
);

const serviceFilter =
document.getElementById("serviceFilter");

const statusFilter =
document.getElementById("statusFilter");

const sortFilter =
document.getElementById("sortFilter");

// ---------------------------
// TABLE
// ---------------------------

const tableBody =
document.getElementById(
  "tableBody"
);



const exportPdfBtn = document.getElementById("exportPdfBtn");
const exportExcelBtn = document.getElementById("exportExcelBtn");

let analyticsChart = null;

let lastSeenEnquiryId =
Number(localStorage.getItem("lastSeenEnquiryId")) || 0;

// ---------------------------
// GLOBAL VARIABLES
// ---------------------------

let enquiries = [];

let filteredEnquiries = [];

let notificationQueue = [];

let notificationTimer = null;

let latestNotificationEnquiry = null;

// =======================================
// PAGINATION
// =======================================

let currentPage = 1;

const rowsPerPage = 10;

/* ===============================
   NOTIFICATION SOUND
================================ */
const notificationSound = new Audio(
  "sounds/notification.wav"
);

notificationSound.volume = 0.5;

// =======================================
// LOADING
// =======================================

function showLoading() {

  const loader =
      document.getElementById("loadingIndicator");

  if (loader) {
      loader.style.display = "flex";
  }

}


function hideLoading() {

  const loader =
      document.getElementById("loadingIndicator");

  if (loader) {
      loader.style.display = "none";
  }

}

// =======================================
// EMPTY STATE
// =======================================

function showEmptyState() {

  const empty =
      document.getElementById("emptyState");

  const table =
      document.getElementById("enquiriesTable");

  if (empty) {
      empty.style.display = "block";
  }

  if (table) {
      table.style.display = "none";
  }
}


function hideEmptyState() {

  const empty =
      document.getElementById("emptyState");

  const table =
      document.getElementById("enquiriesTable");

  if (empty) {
      empty.style.display = "none";
  }

  if (table) {
      table.style.display = "table";
  }
}

// =====================================================
// LOAD ENQUIRIES FROM DATABASE
// =====================================================

async function loadEnquiries() {

  showLoading();

  try {

    console.log("========== AUTH DEBUG ==========");
console.log("TOKEN EXISTS:", !!token);
console.log("TOKEN LENGTH:", token ? token.length : 0);
console.log("TOKEN:", token);
console.log("================================");

    const response = await fetch(
      "https://miss-qassie-backend.onrender.com/enquiries",
      {
          headers: {
            "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
          }
      }
  );

  if (!response.ok) {
    console.log("Fetch failed:", response.status);
    throw new Error("Failed to load enquiries");
}

       enquiries =
      await response.json();

      updateAnalyticsChart();

      filteredEnquiries = [...enquiries];

      if (enquiries.length === 0) {
      
          showEmptyState();
      
      } else {
      
          hideEmptyState();
      
          updateDashboardCards();
      
          renderTable();
      
      }

    hideLoading();

    if (enquiries.length > 0) {
      lastSeenEnquiryId = Math.max(
          ...enquiries.map(enquiry => enquiry.id)
      );
  }

  }
  catch (error) {

    console.error(error);

    alert(
      "Failed to load enquiries."
    );

  }

  finally {

    hideLoading();

}

}

// =====================================================
// DASHBOARD CARDS
// =====================================================

function updateDashboardCards() {

  totalCount.textContent =
    enquiries.length;

  contactedCount.textContent =
    enquiries.filter(
      enquiry => enquiry.contacted
    ).length;

  const today =
    new Date();

  const todayEnquiries =
    enquiries.filter(
      enquiry => {

        const date =
          new Date(
            enquiry.created_at
          );

        return (

          date.getDate() ===
          today.getDate()

          &&

          date.getMonth() ===
          today.getMonth()

          &&

          date.getFullYear() ===
          today.getFullYear()

        );

      }
    );

  todayCount.textContent =
    todayEnquiries.length;

  const newEnquiries =
    enquiries.filter(
      enquiry =>
        !enquiry.contacted
    );

  newCount.textContent =
    newEnquiries.length;

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

// =====================================================
// SEARCH
// =====================================================

function applyFilters() {

  const searchValue =
      searchInput.value
      .toLowerCase()
      .trim();

  const serviceValue =
      serviceFilter.value;

  const statusValue =
      statusFilter.value;

  filteredEnquiries = enquiries.filter(enquiry => {

      // SEARCH
      const matchesSearch =

          (`${enquiry.first_name} ${enquiry.last_name}`)
          .toLowerCase()
          .includes(searchValue)

          ||

          enquiry.email
          .toLowerCase()
          .includes(searchValue)

          ||

          enquiry.service
          .toLowerCase()
          .includes(searchValue);

      // SERVICE FILTER
      const matchesService =

          serviceValue === "all"

          ||

          enquiry.service === serviceValue;

      // STATUS FILTER
      let matchesStatus = true;

      if (statusValue === "new") {

          matchesStatus =
              !enquiry.contacted &&
              !enquiry.replied;

      }

      else if (statusValue === "contacted") {

          matchesStatus =
              enquiry.contacted;

      }

      else if (statusValue === "replied") {

          matchesStatus =
              enquiry.replied;

      }

      return (

          matchesSearch &&

          matchesService &&

          matchesStatus

      );

    });

      // SORTING

filteredEnquiries.sort((a, b) => {

  const dateA = new Date(a.created_at);

  const dateB = new Date(b.created_at);

  if (sortFilter.value === "newest") {

      return dateB - dateA;

  }

  return dateA - dateB;

});

 

  currentPage = 1;

renderTable();

renderPagination();

}

searchInput.addEventListener(
  "keyup",
  applyFilters
);

serviceFilter.addEventListener(
  "change",
  applyFilters
);

statusFilter.addEventListener(
  "change",
  applyFilters
);

sortFilter.addEventListener(
  "change",
  applyFilters
);

// =====================================================
// RENDER TABLE
// =====================================================

function renderTable() {

  tableBody.innerHTML = "";

  // Calculate pagination
  const start =
      (currentPage - 1) * rowsPerPage;

  const end =
      start + rowsPerPage;

  const pageItems =
      filteredEnquiries.slice(start, end);

  pageItems.forEach(enquiry => {

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

          `<div>

              <span class="statusBadge pending">
                  Pending
              </span>

              <br><br>

              <button class="contactBtn">
                  Mark Contacted
              </button>

          </div>`
      }

      </td>

      `;

      tableBody.appendChild(row);

      attachRowEvents(row, enquiry);

  });

  renderPagination();

}

// =======================================
// PAGINATION
// =======================================

function renderPagination() {

  let pagination =
      document.getElementById("pagination");

  if (!pagination) {

      pagination =
          document.createElement("div");

      pagination.id = "pagination";

      pagination.className = "pagination";

      document
          .getElementById("enquiriesTable")
          .after(pagination);

  }

  pagination.innerHTML = "";

  const totalPages =
      Math.ceil(
          filteredEnquiries.length /
          rowsPerPage
      );

  for (let i = 1; i <= totalPages; i++) {

      const button =
          document.createElement("button");

      button.textContent = i;

      if (i === currentPage) {

          button.classList.add("active");

      }

      button.onclick = function () {

          currentPage = i;

          renderTable();

      };

      pagination.appendChild(button);

  }

}

// =====================================================
// ATTACH EVENTS TO EACH ROW
// =====================================================

function openEnquiryModal(enquiry) {

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

      if (enquiry.replied) {

        detailReplyStatus.textContent = "✔ Replied";
    
        detailReplySubject.textContent =
            enquiry.reply_subject || "-";
    
        detailReplyMessage.textContent =
            enquiry.reply_message || "-";
    
        detailReplyDate.textContent =
            enquiry.replied_at
            ? new Date(enquiry.replied_at).toLocaleString()
            : "-";
    
    }
    else {
    
        detailReplyStatus.textContent = "Not yet replied";
    
        detailReplySubject.textContent = "-";
    
        detailReplyMessage.textContent = "-";
    
        detailReplyDate.textContent = "-";
    
    }

  viewModal.style.display = "flex";

}

function attachRowEvents(row, enquiry) {

  // -----------------------
  // VIEW BUTTON
  // -----------------------

  const viewButton =
    row.querySelector(".viewBtn");

    viewButton.onclick = function () {

      openEnquiryModal(enquiry);
  
  };

  // -----------------------
  // DELETE BUTTON
  // -----------------------

  const deleteButton =
    row.querySelector(".deleteBtn");

  deleteButton.onclick =
    function () {

      deleteModal.style.display =
         "flex";

         document.getElementById("deleteClientName").textContent =
`${enquiry.first_name} ${enquiry.last_name}`;

      cancelDelete.onclick =
        function () {

          deleteModal.style.display =
            "none";

        };

      confirmDelete.onclick =
        async function () {

          deleteModal.style.display =
            "none";

          try {

            await fetch(
              `https://miss-qassie-backend.onrender.com/enquiries/${enquiry.id}`,
              {
                  method: "DELETE",
                  headers: {
                      Authorization: `Bearer ${token}`
                  }
              }
          );

            loadEnquiries();

            showToast(
              "Enquiry Deleted",
              `${enquiry.first_name} ${enquiry.last_name} has been removed.`
          );

          }
          catch (error) {

            console.error(error);

            alert(
              "Failed to delete enquiry."
            );

          }

        };

    };

  // -----------------------
  // MARK CONTACTED
  // -----------------------

  const contactButton =
row.querySelector(".contactBtn");

// Only add the event if the button exists
if (contactButton) {

  contactButton.onclick =
  async function () {

    try {

       await fetch(
        `https://miss-qassie-backend.onrender.com/enquiries/${enquiry.id}/contacted`,
        {
          method: "PUT",
          headers:{
            Authorization:`Bearer ${token}`
          }
      }
      );

      await loadEnquiries();

    }
    catch (error) {

      console.error(error);

      alert(
        "Failed to update enquiry."
      );

    }

  };

}

  // -----------------------
  // REPLY BUTTON
  // -----------------------

  const replyButton =
    row.querySelector(".replyBtn");

  replyButton.onclick =
    function () {

      replyModal.style.display =
        "flex";

      replyEmail.textContent =
        enquiry.email;

      replySubject.value =
        "Re: Your Styling Enquiry";

      replyMessage.value =
`Hello ${enquiry.first_name},

Thank you for contacting Miss Qassie Styling.

`;

      sendReplyBtn.onclick =
        async function () {

          try {
            
            const response = await fetch(
              "https://miss-qassie-backend.onrender.com/reply",
              {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({
                      enquiryId: enquiry.id,
                      email: enquiry.email,
                      subject: replySubject.value,
                      message: replyMessage.value
                  })
              }
          );
          
          const data = await response.json();
          
          if (!response.ok) {
              throw new Error(data.message);
          }
          
          alert(data.message);
          
              // Update database
              const replyUpdate =
              await fetch(
                `https://miss-qassie-backend.onrender.com/enquiries/${enquiry.id}/replied`,
                {
                  method: "PUT"
                }
              );
              
              const replyResult =
              await replyUpdate.json();
              
              console.log(replyResult);
              
              // Close the reply modal
              replyModal.style.display = "none";
              
              // Clear the form
              replySubject.value = "";
              replyMessage.value = "";
              replyEmail.textContent = "";
              
              // Reload the dashboard
              await loadEnquiries();
          }
          catch (error) {

            console.error(error);

            alert(
              "Failed to send email."
            );

          }

        };

    };

}

// =====================================================
// CLOSE MODALS
// =====================================================

closeViewModal.onclick =
function () {

  viewModal.style.display =
    "none";

};

closeX.onclick =
function () {

  viewModal.style.display =
    "none";

};

closeReplyBtn.onclick =
function () {

  replyModal.style.display =
    "none";

};

window.onclick =
function (e) {

  if (
    e.target === viewModal
  ) {

    viewModal.style.display =
      "none";

  }

  if (
    e.target === deleteModal
  ) {

    deleteModal.style.display =
      "none";

  }

  if (
    e.target === replyModal
  ) {

    replyModal.style.display =
      "none";

  }

};

// =======================================
// MONTHLY ANALYTICS CHART
// =======================================

function updateAnalyticsChart() {

  const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  const enquiriesPerMonth = new Array(12).fill(0);

  const contactedPerMonth = new Array(12).fill(0);

  const repliedPerMonth = new Array(12).fill(0);

  enquiries.forEach(enquiry => {

    console.log("All enquiries:", enquiries);

      const month =
          new Date(enquiry.created_at).getMonth();

      enquiriesPerMonth[month]++;

      if (enquiry.contacted) {

          contactedPerMonth[month]++;

      }

      if (enquiry.replied) {

          repliedPerMonth[month]++;

      }

  });

  const ctx =
      document.getElementById("analyticsChart");

      console.log("Enquiries Per Month:", enquiriesPerMonth);
console.log("Contacted Per Month:", contactedPerMonth);
console.log("Replied Per Month:", repliedPerMonth);

  if (analyticsChart) {

      analyticsChart.destroy();

  }

  analyticsChart = new Chart(ctx, {

      type: "bar",

      data: {

          labels: months,

          datasets: [

              {
                  label: "New Enquiries",
                  data: enquiriesPerMonth,
                  backgroundColor: "#C9A96E"
              },

              {
                  label: "Contacted",
                  data: contactedPerMonth,
                  backgroundColor: "#3B82F6"
              },

              {
                  label: "Replied",
                  data: repliedPerMonth,
                  backgroundColor: "#10B981"
              }

          ]

      },

      options: {

          responsive: true,

          plugins: {

              legend: {

                  position: "top"

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


// =====================================================
// START APPLICATION
// =====================================================

// =======================================
// EXPORT TO PDF
// =======================================

// =======================================
// EXPORT PROFESSIONAL PDF
// =======================================

exportPdfBtn.addEventListener("click", function () {

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  const logo = new Image();
logo.src = "images/logo.png";

logo.onload = function () {

  doc.addImage(
      logo,
      "PNG",
      85,
      10,
      40,
      40
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);

  doc.text(
      "MISS QASSIE STYLING",
      105,
      58,
      { align: "center" }
  );

  // Subtitle
  doc.setFontSize(16);
  doc.text("CLIENT ENQUIRIES REPORT", 105, 30, { align: "center" });

  // Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  doc.text(
      "Generated: " + new Date().toLocaleString(),
      14,
      45
  );

  // Total enquiries
  doc.setFontSize(12);

  doc.text(
      "Total Enquiries: " + enquiries.length,
      14,
      55
  );

  doc.autoTable({

    startY: 70,

    head: [[
        "No",
        "Client Name",
        "Email",
        "Service",
        "Status",
        "Date"
    ]],

    body: enquiries.map((enquiry, index) => {

        let status = "Pending";

        if (enquiry.replied) {

            status = "Replied";

        } else if (enquiry.contacted) {

            status = "Contacted";

        }

        return [

            index + 1,

            enquiry.first_name + " " + enquiry.last_name,

            enquiry.email,

            enquiry.service,

            status,

            new Date(enquiry.created_at).toLocaleDateString()

        ];

    }),

    theme: "grid",

    headStyles: {

        fillColor: [236, 72, 153],

        textColor: [255, 255, 255],

        fontStyle: "bold"

    },

    styles: {

        fontSize: 10,

        cellPadding: 3

    },

    alternateRowStyles: {

        fillColor: [248, 248, 248]

    }

});

const finalY = doc.lastAutoTable.finalY + 15;

doc.setFont("helvetica", "italic");

doc.text(
    "Thank you for using Miss Qassie Styling Management System.",
    105,
    finalY,
    { align: "center" }
);

  doc.save("Miss-Quassie-Enquiries-Report.pdf");

};

});

// =======================================
// EXPORT TO EXCEL
// =======================================

exportExcelBtn.addEventListener("click", function () {

  const excelData = enquiries.map((enquiry, index) => {

      let status = "Pending";

      if (enquiry.replied) {

          status = "Replied";

      } else if (enquiry.contacted) {

          status = "Contacted";

      }

      return {

          "No": index + 1,

          "First Name": enquiry.first_name,

          "Last Name": enquiry.last_name,

          "Email": enquiry.email,

          "Service": enquiry.service,

          "Message": enquiry.message,

          "Status": status,

          "Date": new Date(enquiry.created_at).toLocaleDateString()

      };

  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Enquiries"
  );

  XLSX.writeFile(
      workbook,
      "Miss-Quassie-Enquiries.xlsx"
  );

});

// =======================================
// SHOW TOAST NOTIFICATION
// =======================================

function showToast(title, message) {

  notificationQueue.push(message);

  if (notificationTimer) {
      clearTimeout(notificationTimer);
  }

  notificationTimer = setTimeout(() => {

      try {

          notificationSound.currentTime = 0;
          notificationSound.play();

      } catch (error) {

          console.log("Unable to play notification sound.");

      }

      const container =
          document.getElementById("toastContainer");

      const toast =
          document.createElement("div");

      toast.className = "toast";

      toast.innerHTML = `
    <h3>${title}</h3>

    <p>${notificationQueue.join("<br>")}</p>

    <button class="toastViewBtn">
        View Enquiry
    </button>

    <small>${new Date().toLocaleTimeString()}</small>
`;

      container.appendChild(toast);

      // =======================================
// VIEW ENQUIRY BUTTON
// =======================================

const viewButton = toast.querySelector(".toastViewBtn");

viewButton.addEventListener("click", function () {

    if (!latestNotificationEnquiry) return;

    // Find the row in the table
    const row = document.querySelector(
        `tr[data-id="${latestNotificationEnquiry.id}"]`
    );

    if (row) {

        // Scroll smoothly to the enquiry
        row.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        // Highlight the row
        row.style.background = "#fff3cd";

        setTimeout(() => {
            row.style.background = "";
        }, 3000);

        // Simulate clicking the View button
        const viewBtn = row.querySelector(".viewBtn");

        if (viewBtn) {
            viewBtn.click();
        }
    }

});
      setTimeout(() => {

          toast.style.animation =
              "fadeOut .5s forwards";

          setTimeout(() => {

              toast.remove();

          }, 500);

      }, 5000);

      // Clear the queue
      notificationQueue = [];
      notificationTimer = null;

  }, 1000);

}
// =======================================
// CHECK FOR NEW ENQUIRIES
// =======================================

async function checkForNewEnquiries() {

  try {
    
      const response = await fetch(
        "https://miss-qassie-backend.onrender.com/enquiries",
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
    )

      const latestEnquiries =
          await response.json();

          if (latestEnquiries.length > 0) {

            const newest = latestEnquiries[0];
        
            if (newest.id > lastSeenEnquiryId) {
        
                    latestNotificationEnquiry = newest;
                    
                    showToast(
                      "🔔 New Enquiry",
                      `${newest.first_name} has submitted a new enquiry.`
                  );
                  
                  lastSeenEnquiryId = newest.id;

                  localStorage.setItem(
                    "lastSeenEnquiryId",
                    lastSeenEnquiryId
                );
                  
                  loadEnquiries();
            }
        }

  } catch (error) {

      console.log(
          "Notification check failed."
      );

  }

}

loadEnquiries();

setInterval(
    checkForNewEnquiries,
    10000
);