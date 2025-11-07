let reminders = JSON.parse(localStorage.getItem('reminders')) || [];

// Render reminders on load
document.addEventListener("DOMContentLoaded", () => {
  renderReminders();
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
});

// Add reminder
document.getElementById("reminderForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("medName").value.trim();
  const dosage = document.getElementById("dosage").value.trim();
  const time = document.getElementById("time").value;

  if (name && dosage && time) {
    reminders.push({ name, dosage, time });
    localStorage.setItem("reminders", JSON.stringify(reminders));
    renderReminders();
    e.target.reset();
  }
});

// Render all reminders
function renderReminders() {
  const list = document.getElementById("reminderList");
  list.innerHTML = "";
  reminders.forEach((r, i) => {
    const card = document.createElement("div");
    card.className = "bg-white shadow rounded-xl p-3 flex justify-between items-center";
    card.innerHTML = `
      <div>
        <p class="font-semibold">${r.name}</p>
        <p class="text-sm text-gray-600">${r.dosage} • ${r.time}</p>
      </div>
      <div class="flex gap-2">
        <button class="bg-green-500 text-white rounded px-2 py-1 text-sm" onclick="getDrugInfo('${r.name}')">Info</button>
        <button class="bg-red-500 text-white rounded px-2 py-1 text-sm" onclick="deleteReminder(${i})">X</button>
      </div>
    `;
    list.appendChild(card);
  });
}

// Delete reminder
function deleteReminder(index) {
  reminders.splice(index, 1);
  localStorage.setItem("reminders", JSON.stringify(reminders));
  renderReminders();
}

// Check reminders every minute
setInterval(() => {
  const now = new Date();
  const timeNow = now.toTimeString().slice(0,5);
  reminders.forEach(r => {
    if (r.time === timeNow) {
      new Notification(`💊 Time to take ${r.name}`, { body: `${r.dosage}` });
    }
  });
}, 60000);

// Fetch drug info from OpenFDA API
async function getDrugInfo(drugName) {
  try {
    const res = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.generic_name:${drugName}`);
    const data = await res.json();
    const info = data.results[0];
    alert(`💊 ${drugName.toUpperCase()}\n\nPurpose: ${info.purpose ? info.purpose[0] : 'N/A'}\n\nUsage: ${info.indications_and_usage ? info.indications_and_usage[0] : 'N/A'}`);
  } catch {
    alert("⚠️ No information found for this drug.");
  }
}
