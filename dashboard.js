const originalReports = [
  { id: 'SL-001', location: 'Near City Park Gate', ward: 'Ward 2', type: 'Completely Dark', priority: 'High', status: 'Pending', date: '05/09/2026' },
  { id: 'SL-002', location: 'Market Road Crossing', ward: 'Ward 3', type: 'Flickering', priority: 'Medium', status: 'Pending', date: '05/09/2026' },
  { id: 'SL-003', location: 'Community Health Centre', ward: 'Ward 4', type: 'Damaged Pole', priority: 'High', status: 'In Progress', date: '04/09/2026' },
  { id: 'SL-004', location: 'Pole 12, Nehru Colony', ward: 'Ward 5', type: 'Damaged Pole', priority: 'Normal', status: 'Repaired', date: '01/09/2026' },
  { id: 'SL-005', location: 'Main Bus Stand Gate', ward: 'Ward 1', type: 'Completely Dark', priority: 'High', status: 'Repaired', date: '02/09/2026' },
  { id: 'SL-006', location: 'Nehru Park Main Road', ward: 'Ward 7', type: 'Flickering', priority: 'Medium', status: 'Pending', date: '06/09/2026' },
  { id: 'SL-007', location: 'Shanti Nagar Lane 4', ward: 'Ward 2', type: 'Completely Dark', priority: 'High', status: 'In Progress', date: '03/09/2026' },
  { id: 'SL-008', location: 'Near DAV Public School', ward: 'Ward 6', type: 'Flickering', priority: 'Medium', status: 'Repaired', date: '03/09/2026' },
  { id: 'SL-009', location: 'Railway Colony Entrance', ward: 'Ward 8', type: 'Damaged Pole', priority: 'Normal', status: 'Pending', date: '07/09/2026' },
  { id: 'SL-010', location: 'Old Court Road', ward: 'Ward 1', type: 'Completely Dark', priority: 'High', status: 'In Progress', date: '08/09/2026' }
];
let reports = JSON.parse(localStorage.getItem('streetlight-reports') || 'null') || structuredClone(originalReports);
let activeFilter = 'repaired';
const rows = document.querySelector('#report-rows');
const count = document.querySelector('#result-count');
const search = document.querySelector('#search');

function save() { localStorage.setItem('streetlight-reports', JSON.stringify(reports)); }
function render() {
  const query = search.value.trim().toLowerCase();
  const visible = reports.filter(report => {
    const filterMatch = activeFilter === 'all' ||
      (activeFilter === 'high' && report.priority === 'High') ||
      (activeFilter === 'pending' && report.status !== 'Repaired') ||
      (activeFilter === 'repaired' && report.status === 'Repaired');
    const searchMatch = `${report.location} ${report.ward}`.toLowerCase().includes(query);
    return filterMatch && searchMatch;
  });
  rows.replaceChildren(...visible.map(report => {
    const tr = document.createElement('tr');
    const id = document.createElement('td'); id.innerHTML = `<strong>${report.id}</strong>`;
    const location = document.createElement('td');
    const name = document.createElement('span'); name.className = 'location-name'; name.textContent = report.location;
    const date = document.createElement('span'); date.className = 'report-date'; date.textContent = `Reported ${report.date}`;
    location.append(name, date);
    const ward = document.createElement('td'); ward.textContent = report.ward;
    const type = document.createElement('td'); type.textContent = report.type;
    const priority = document.createElement('td');
    const badge = document.createElement('span'); badge.className = `priority ${report.priority.toLowerCase()}`; badge.textContent = report.priority.toUpperCase(); priority.append(badge);
    const status = document.createElement('td'); status.className = 'status-cell';
    const dot = document.createElement('span'); dot.className = `status-dot ${report.status === 'Repaired' ? '' : 'pending'}`; dot.setAttribute('aria-hidden', 'true');
    const select = document.createElement('select'); select.className = 'status-select'; select.setAttribute('aria-label', `Status for ${report.id}`);
    ['Pending', 'In Progress', 'Repaired'].forEach(value => { const option = document.createElement('option'); option.value = value; option.textContent = value; option.selected = value === report.status; select.append(option); });
    select.addEventListener('change', () => { report.status = select.value; save(); render(); });
    status.append(dot, select); tr.append(id, location, ward, type, priority, status); return tr;
  }));
  document.querySelector('#empty-state').hidden = visible.length !== 0;
  count.textContent = `Showing ${visible.length} of ${reports.length} reports`;
  const repaired = reports.filter(report => report.status === 'Repaired').length;
  const percent = Math.round(repaired / reports.length * 100);
  document.querySelector('#progress-label').textContent = `${repaired} of ${reports.length} poles repaired (${percent}%)`;
  document.querySelector('#progress-fill').style.width = `${percent}%`;
  document.querySelector('.progress-track').setAttribute('aria-valuenow', repaired);
}
document.querySelectorAll('.filter-button').forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll('.filter-button').forEach(item => item.classList.toggle('selected', item === button));
  render();
}));
search.addEventListener('input', render);
document.querySelector('#reset').addEventListener('click', () => { reports = structuredClone(originalReports); save(); render(); });
document.querySelector('#theme-toggle').addEventListener('click', event => {
  document.body.classList.toggle('light');
  event.currentTarget.textContent = document.body.classList.contains('light') ? 'Dark mode' : 'Light mode';
});
render();
