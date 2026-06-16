let allRecords = [];

// Load records on page load
document.addEventListener('DOMContentLoaded', () => {
  loadRecords();
  document.getElementById('addRecordForm').addEventListener('submit', handleFormSubmit);
  document.getElementById('searchBox').addEventListener('input', handleSearch);
});

// Load all records from backend
async function loadRecords() {
  try {
    const response = await fetch('/api/records');
    allRecords = await response.json();
    renderTable(allRecords);
    updateStats(allRecords);
  } catch (err) {
    console.error('Error loading records:', err);
  }
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();

  const newRecord = {
    itemName: document.getElementById('itemName').value,
    itemCode: document.getElementById('itemCode').value,
    supplierPhone: document.getElementById('supplierPhone').value,
    location: document.getElementById('location').value,
    entryDate: document.getElementById('entryDate').value,
    issue: document.getElementById('issue').value,
    priority: document.getElementById('priority').value,
    remarks: document.getElementById('remarks').value,
    photoCaption: document.getElementById('photoCaption').value,
    supplierName: document.getElementById('supplierName').value,
    batchNumber: document.getElementById('batchNumber').value,
    category: document.getElementById('category').value,
    stockStatus: document.getElementById('stockStatus').value,
    restockingNeed: document.getElementById('restockingNeed').value,
    followUp: document.getElementById('followUp').value
  };

  try {
    const response = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord)
    });

    if (response.ok) {
      alert('Record saved successfully!');
      document.getElementById('addRecordForm').reset();
      loadRecords();
    }
  } catch (err) {
    console.error('Error saving record:', err);
    alert('Error saving record');
  }
}

// Render table
function renderTable(records) {
  const tableBody = document.getElementById('tableBody');
  tableBody.innerHTML = '';

  records.forEach(record => {
    const row = document.createElement('tr');
    
    const priorityClass = record.priority ? `status-${record.priority.toLowerCase()}` : '';
    const stockClass = record.stockStatus ? `status-${record.stockStatus.toLowerCase().replace(' ', '-')}` : '';

    row.innerHTML = `
      <td>${record.itemName}</td>
      <td>${record.itemCode}</td>
      <td>${record.location}</td>
      <td>${record.entryDate}</td>
      <td>
        <strong>Issue:</strong> ${record.issue}<br>
        <strong>Remarks:</strong> ${record.remarks}<br>
        <strong>Details:</strong> ${record.photoCaption}
      </td>
      <td>
        <span class="status-badge ${priorityClass}">${record.priority || 'N/A'}</span><br>
        <span class="status-badge ${stockClass}">${record.stockStatus || 'N/A'}</span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-status" onclick="cycleStatus(${record.id})">Update</button>
          <button class="btn-action btn-delete" onclick="deleteRecord(${record.id})">Delete</button>
        </div>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

// Update stats
function updateStats(records) {
  const today = new Date().toISOString().split('T')[0];

  const total = records.length;
  const inStock = records.filter(r => r.stockStatus === 'In Stock').length;
  const outOfStock = records.filter(r => r.stockStatus === 'Out of Stock').length;
  const todayCount = records.filter(r => r.entryDate === today).length;

  document.getElementById('totalCount').textContent = total;
  document.getElementById('inStockCount').textContent = inStock;
  document.getElementById('outOfStockCount').textContent = outOfStock;
  document.getElementById('todayCount').textContent = todayCount;
}

// Handle search
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  const filtered = allRecords.filter(record =>
    record.itemName.toLowerCase().includes(searchTerm) ||
    record.itemCode.toLowerCase().includes(searchTerm) ||
    record.location.toLowerCase().includes(searchTerm)
  );
  renderTable(filtered);
}

// Cycle status
async function cycleStatus(id) {
  const record = allRecords.find(r => r.id === id);
  if (!record) return;

  const statuses = ['In Stock', 'Low Stock', 'Out of Stock'];
  const currentIndex = statuses.indexOf(record.stockStatus);
  const nextStatus = statuses[(currentIndex + 1) % statuses.length];

  try {
    await fetch(`/api/records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockStatus: nextStatus })
    });
    loadRecords();
  } catch (err) {
    console.error('Error updating status:', err);
  }
}

// Delete record
async function deleteRecord(id) {
  if (!confirm('Are you sure you want to delete this record?')) return;

  try {
    await fetch(`/api/records/${id}`, { method: 'DELETE' });
    loadRecords();
  } catch (err) {
    console.error('Error deleting record:', err);
  }
}

// Refresh records
function refreshRecords() {
  loadRecords();
  alert('Records refreshed!');
}

// Print report
function printReport() {
  window.print();
}