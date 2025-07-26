let availability = {}; // זמינות עובדים לפי יום

function generateDutyTable() {
  const workersInput = document.getElementById('workers').value.trim();
  const month = document.getElementById('monthPicker').value;
  if (!workersInput || !month) {
    alert('יש להזין שמות עובדים ולבחור חודש.');
    return;
  }

  const workers = workersInput.split(',').map(w => w.trim()).filter(w => w);
  const date = new Date(month);
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const form = document.getElementById('availability-form');
  form.innerHTML = '';
  availability = {};

  workers.forEach(worker => {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = worker;
    fieldset.appendChild(legend);

    for (let day = 1; day <= daysInMonth; day++) {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = day;
      checkbox.name = worker;
      checkbox.id = `${worker}-${day}`;
      checkbox.checked = true;

      const cbLabel = document.createElement('label');
      cbLabel.htmlFor = checkbox.id;
      cbLabel.textContent = day;

      fieldset.appendChild(checkbox);
      fieldset.appendChild(cbLabel);
    }
    form.appendChild(fieldset);
  });

  document.getElementById('availability-section').classList.remove('hidden');
}

function buildCalendarWithAvailability() {
  const workers = document.getElementById('workers').value.trim().split(',').map(w => w.trim()).filter(w => w);
  const month = document.getElementById('monthPicker').value;
  const date = new Date(month);
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const shiftCount = parseInt(document.getElementById('shiftCount').value);

  // קריאת הזמינות מהטופס
  availability = {};
  workers.forEach(worker => {
    availability[worker] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const cb = document.getElementById(`${worker}-${day}`);
      if (cb && cb.checked) {
        availability[worker].push(day);
      }
    }
  });

  const calendar = document.getElementById('calendar');
  calendar.innerHTML = '';
  const dayTemplate = document.getElementById('day-template');
  const assigned = {}; // worker: [days]
  workers.forEach(w => assigned[w] = []);

  for (let day = 1; day <= daysInMonth; day++) {
    const clone = dayTemplate.content.cloneNode(true);
    clone.querySelector('.date').textContent = `${day}/${monthIndex + 1}`;
    const workerDiv = clone.querySelector('.worker');

    let chosen = [];
    let availableWorkers = workers.filter(w => availability[w].includes(day) && assigned[w].length < Math.ceil(daysInMonth / workers.length));
    for (let s = 0; s < shiftCount; s++) {
      if (availableWorkers.length === 0) break;
      const randomIndex = Math.floor(Math.random() * availableWorkers.length);
      const w = availableWorkers.splice(randomIndex, 1)[0];
      assigned[w].push(day);
      chosen.push(w);
    }
    workerDiv.textContent = chosen.join(', ') || 'אין תורנים';
    calendar.appendChild(clone);
  }

  document.getElementById('month-title').textContent = `לוח תורנויות לחודש ${month.split('-')[1]}/${month.split('-')[0]}`;
  document.getElementById('calendar-section').classList.remove('hidden');
}

function saveToLocal() {
  const key = `dutyRoster-${document.getElementById('monthPicker').value}`;
  const html = document.getElementById('calendar').innerHTML;
  localStorage.setItem(key, html);
  alert('הלוח נשמר בהצלחה בדפדפן.');
}

function loadFromLocal() {
  const key = `dutyRoster-${document.getElementById('monthPicker').value}`;
  const html = localStorage.getItem(key);
  if (html) {
    document.getElementById('calendar').innerHTML = html;
    document.getElementById('calendar-section').classList.remove('hidden');
  } else {
    alert('לא נמצא לוח תורנויות לחודש זה.');
  }
}

function exportToExcel() {
  let csv = 'תאריך,עובד,הערות\n';
  document.querySelectorAll('#calendar .day').forEach(day => {
    const date = day.querySelector('.date').textContent;
    const worker = day.querySelector('.worker').textContent;
    const note = day.querySelector('.note').value.replace(/\n/g, ' ');
    csv += `${date},${worker},${note}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'duty_roster.csv';
  link.click();
}

function exportAsJSON() {
  const data = [];
  document.querySelectorAll('#calendar .day').forEach(day => {
    data.push({
      date: day.querySelector('.date').textContent,
      worker: day.querySelector('.worker').textContent,
      note: day.querySelector('.note').value
    });
  });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'duty_roster.json';
  link.click();
}

function importFromJSON() {
  const input = document.getElementById('jsonFileInput');
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const data = JSON.parse(reader.result);
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    const template = document.getElementById('day-template');
    data.forEach(entry => {
      const clone = template.content.cloneNode(true);
      clone.querySelector('.date').textContent = entry.date;
      clone.querySelector('.worker').textContent = entry.worker;
      clone.querySelector('.note').value = entry.note;
      calendar.appendChild(clone);
    });
    document.getElementById('calendar-section').classList.remove('hidden');
  };
  reader.readAsText(file);
}

// Event Listeners
document.getElementById('generateBtn').addEventListener('click', generateDutyTable);
document.getElementById('buildCalendarBtn').addEventListener('click', buildCalendarWithAvailability);
document.getElementById('saveLocalBtn').addEventListener('click', saveToLocal);
document.getElementById('loadLocalBtn').addEventListener('click', loadFromLocal);
document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
document.getElementById('exportJsonBtn').addEventListener('click', exportAsJSON);
document.getElementById('jsonFileInput').addEventListener('change', importFromJSON);
