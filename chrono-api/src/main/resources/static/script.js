const API_URL = 'https://chronoapi-production-38ef.up.railway.app/';

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const dayNames = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

const calendarDays = document.getElementById('calendar-days');
const yearText = document.querySelector('.year');
const monthRow = document.querySelector('.months');
const monthItems = Array.from(monthRow.querySelectorAll('span, strong'));
const previousYearButton = document.querySelector('.triangle-left');
const nextYearButton = document.querySelector('.triangle-right');
const numberDateText = document.querySelector('.num-date');
const dayText = document.querySelector('.day');
const eventList = document.getElementById('event-list');
const selectedDateText = document.getElementById('selected-date-text');
const createEventButton = document.querySelector('.create-event');
const addEventButton = document.querySelector('.add-event');
const eventForm = document.getElementById('event-form');
const eventNameInput = document.getElementById('event-name');
const eventDescriptionInput = document.getElementById('event-description');
const eventStartInput = document.getElementById('event-start');
const eventEndInput = document.getElementById('event-end');
const eventEditIndexInput = document.getElementById('event-edit-index');
const eventCancelButton = document.getElementById('event-cancel');
const eventSubmitButton = document.getElementById('event-submit');
const appContainer = document.getElementById('app-container');
const loginScreen = document.getElementById('login-screen');
const authCard = document.getElementById('auth-card');
const showRegisterButton = document.getElementById('show-register');
const showLoginButton = document.getElementById('show-login');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginUserInput = document.getElementById('login-user');
const registerNameInput = document.getElementById('register-name');
const userNameText = document.getElementById('user-name');
const menuButton = document.getElementById('menu-button');
const userMenu = document.getElementById('user-menu');
const logoutButton = document.getElementById('logout-button');
const myEventsButton = document.getElementById('my-events-button');
const confirmModal = document.getElementById('confirm-modal');
const confirmTitle = document.getElementById('confirm-title');
const confirmMessage = document.getElementById('confirm-message');
const confirmAcceptButton = document.getElementById('confirm-accept');
const confirmCancelButton = document.getElementById('confirm-cancel');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

let today = new Date();
let todayKey = formatKey(today);
let currentYear = today.getFullYear();
let currentMonth = today.getMonth();
let selectedDate = new Date(today);
let editingEventId = null;
let pendingConfirmAction = null;
let currentUserId = null;
let allEvents = {};

// ── Toast ──
function showToast(message, callback, delay = 1800, type = 'success') {
  toastMessage.textContent = message;
  toast.querySelector('.toast-icon').textContent = type === 'error' ? '✕' : '✓';
  toast.classList.toggle('error', type === 'error');
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show', 'error');
    if (callback) setTimeout(callback, 350);
  }, delay);
}

// ── Sesión ──
function showCalendar(userId, userName) {
  currentUserId = userId;
  userNameText.textContent = userName;
  localStorage.setItem('chrono-user', JSON.stringify({ id: userId, nombre: userName }));
  loginScreen.classList.add('login-hidden');
  appContainer.classList.remove('app-hidden');
  loadAllEvents();
}

function showLogin() {
  appContainer.classList.add('app-hidden');
  loginScreen.classList.remove('login-hidden');
  userMenu.classList.remove('visible');
  currentUserId = null;
  allEvents = {};
}

// ── Utilidades de fecha ──
function formatKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function formatDateTimeLocal(date) {
  return [
    formatKey(date),
    [
      String(date.getHours()).padStart(2, '0'),
      String(date.getMinutes()).padStart(2, '0'),
    ].join(':'),
  ].join('T');
}

function formatTimeRange(evento) {
  const startDate = new Date(evento.inicio);
  const endDate = new Date(evento.fin);
  return `${startDate.toLocaleString('es-CO')} - ${endDate.toLocaleString('es-CO')}`;
}

// ── API Usuarios ──
async function apiRegistrar(nombre, contrasena, correo) {
  const res = await fetch(`${API_URL}/usuarios/registrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, contrasena, correo }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }
  return res.json();
}

async function apiLogin(nombre, contrasena) {
  const res = await fetch(`${API_URL}/usuarios/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, contrasena }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }
  return res.json();
}

// ── API Eventos ──
async function apiCrearEvento(evento) {
  const res = await fetch(`${API_URL}/eventos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evento),
  });
  return res.json();
}

async function apiActualizarEvento(id, evento) {
  const res = await fetch(`${API_URL}/eventos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evento),
  });
  return res.json();
}

async function apiEliminarEvento(id) {
  await fetch(`${API_URL}/eventos/${id}`, { method: 'DELETE' });
}

async function apiObtenerEventos(usuarioId) {
  const res = await fetch(`${API_URL}/eventos/usuario/${usuarioId}`);
  return res.json();
}

// ── Carga de eventos ──
async function loadAllEvents() {
  if (!currentUserId) return;
  const eventos = await apiObtenerEventos(currentUserId);
  allEvents = {};
  eventos.forEach(ev => {
    const key = ev.inicio.substring(0, 10);
    if (!allEvents[key]) allEvents[key] = [];
    allEvents[key].push(ev);
  });
  renderCalendar();
  renderEvents();
}

// ── Calendario ──
function renderMonthHeader() {
  yearText.textContent = currentYear;
  monthItems.forEach((month, index) => {
    const isSelected = index === currentMonth;
    month.textContent = monthNames[index];
    month.className = isSelected ? 'month-color' : 'month-hover';
  });
}

function renderCalendar() {
  const firstDay = new Date(currentYear, currentMonth, 1);
  const startDate = new Date(currentYear, currentMonth, 1 - firstDay.getDay());

  calendarDays.innerHTML = '';
  renderMonthHeader();

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    const dateKey = formatKey(date);
    const dayButton = document.createElement('button');
    dayButton.type = 'button';
    dayButton.className = 'calendar-day';
    dayButton.textContent = String(date.getDate()).padStart(2, '0');
    dayButton.dataset.date = dateKey;

    if (date.getMonth() !== currentMonth) dayButton.classList.add('grey');
    if (dateKey === todayKey) dayButton.classList.add('today');
    if (selectedDate && formatKey(selectedDate) === dateKey) dayButton.classList.add('selected');
    if (allEvents[dateKey]?.length) dayButton.classList.add('has-event');

    dayButton.addEventListener('click', () => selectDate(date));
    calendarDays.appendChild(dayButton);
  }
}

function selectDate(date) {
  selectedDate = new Date(date);
  currentYear = selectedDate.getFullYear();
  currentMonth = selectedDate.getMonth();
  numberDateText.textContent = String(date.getDate()).padStart(2, '0');
  dayText.textContent = dayNames[date.getDay()];
  selectedDateText.textContent = date.toLocaleDateString('es-CO', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  closeEventForm();
  renderCalendar();
  renderEvents();
}

// ── Eventos UI ──
function renderEvents() {
  const dateKey = selectedDate ? formatKey(selectedDate) : '';
  const dayEvents = allEvents[dateKey] || [];

  eventList.innerHTML = '';

  if (!selectedDate) {
    eventList.innerHTML = '<li>Haz clic en un dia</li>';
    return;
  }

  if (!dayEvents.length) {
    eventList.innerHTML = '<li>Sin eventos agendados</li>';
    return;
  }

  dayEvents.forEach((ev) => {
    const item = document.createElement('li');
    const title = document.createElement('strong');
    const description = document.createElement('span');
    const time = document.createElement('small');
    const actions = document.createElement('div');
    const editButton = document.createElement('button');
    const deleteButton = document.createElement('button');

    item.className = 'event-item';
    title.textContent = ev.nombre;
    description.textContent = ev.descripcion || 'Sin descripcion';
    time.textContent = formatTimeRange(ev);
    actions.className = 'event-actions';

    editButton.type = 'button';
    editButton.className = 'edit-event';
    editButton.textContent = 'Editar';
    editButton.addEventListener('click', () => confirmEditEvent(ev));

    deleteButton.type = 'button';
    deleteButton.className = 'delete-event';
    deleteButton.textContent = 'Eliminar';
    deleteButton.addEventListener('click', () => confirmDeleteEvent(ev.id));

    actions.append(editButton, deleteButton);
    item.append(title, description, time, actions);
    eventList.appendChild(item);
  });
}

function showEventForm(ev = null) {
  if (!selectedDate) {
    alert('Primero selecciona un dia del calendario.');
    return;
  }

  const startDate = new Date(selectedDate);
  startDate.setHours(9, 0, 0, 0);
  const endDate = new Date(selectedDate);
  endDate.setHours(10, 0, 0, 0);

  editingEventId = ev ? ev.id : null;
  eventEditIndexInput.value = ev ? ev.id : '';
  eventNameInput.value = ev?.nombre || '';
  eventDescriptionInput.value = ev?.descripcion || '';
  eventStartInput.value = ev?.inicio || formatDateTimeLocal(startDate);
  eventEndInput.value = ev?.fin || formatDateTimeLocal(endDate);
  eventSubmitButton.textContent = ev ? 'Actualizar' : 'Guardar';

  eventForm.classList.add('visible');
  eventNameInput.focus();
}

function closeEventForm() {
  eventForm.reset();
  eventForm.classList.remove('visible');
  eventEditIndexInput.value = '';
  editingEventId = null;
  eventSubmitButton.textContent = 'Guardar';
}

function confirmEditEvent(ev) {
  showConfirmModal('Editar evento', '¿Estás seguro de que quieres editar este evento?', () => {
    hideConfirmModal();
    showEventForm(ev);
  });
}

async function addEvent(event) {
  event.preventDefault();

  const nombre = eventNameInput.value.trim();
  const descripcion = eventDescriptionInput.value.trim();
  const inicio = eventStartInput.value;
  const fin = eventEndInput.value;

  if (!nombre || !descripcion || !inicio || !fin) {
    alert('Completa nombre, descripcion, inicio y fin del evento.');
    return;
  }

  if (new Date(fin) <= new Date(inicio)) {
    alert('La fecha y hora de fin debe ser posterior al inicio.');
    return;
  }

  const eventoData = {
    nombre,
    descripcion,
    inicio,
    fin,
    usuario: { id: currentUserId },
  };

  if (editingEventId) {
    await apiActualizarEvento(editingEventId, eventoData);
    showToast('Evento actualizado correctamente.');
  } else {
    await apiCrearEvento(eventoData);
    showToast('Evento creado correctamente.');
  }

  closeEventForm();
  await loadAllEvents();
  selectDate(new Date(inicio));
}

function confirmDeleteEvent(id) {
  showConfirmModal('Eliminar evento', '¿Estás seguro de que quieres eliminar este evento?', async () => {
    hideConfirmModal();
    await apiEliminarEvento(id);
    showToast('Evento eliminado correctamente.');
    await loadAllEvents();
    renderEvents();
  });
}

// ── Modal ──
function showConfirmModal(title, message, action) {
  confirmTitle.textContent = title;
  confirmMessage.textContent = message;
  pendingConfirmAction = action;
  confirmModal.classList.add('visible');
}

function hideConfirmModal() {
  confirmModal.classList.remove('visible');
  pendingConfirmAction = null;
}

// ── Eventos de UI ──
monthItems.forEach((month, index) => {
  month.addEventListener('click', () => {
    currentMonth = index;
    selectDate(new Date(currentYear, currentMonth, 1));
  });
});

previousYearButton.addEventListener('click', () => {
  currentYear -= 1;
  selectDate(new Date(currentYear, currentMonth, 1));
});

nextYearButton.addEventListener('click', () => {
  currentYear += 1;
  selectDate(new Date(currentYear, currentMonth, 1));
});

createEventButton.addEventListener('click', () => showEventForm());
addEventButton.addEventListener('click', () => showEventForm());
eventForm.addEventListener('submit', addEvent);
eventCancelButton.addEventListener('click', closeEventForm);

showRegisterButton.addEventListener('click', () => authCard.classList.add('right-panel-active'));
showLoginButton.addEventListener('click', () => authCard.classList.remove('right-panel-active'));

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const nombre = loginUserInput.value.trim();
  const contrasena = document.getElementById('login-password').value;
  try {
    const usuario = await apiLogin(nombre, contrasena);
    showToast('¡Bienvenido de nuevo, ' + usuario.nombre + '!', () => showCalendar(usuario.id, usuario.nombre));
  } catch (e) {
    showToast('Usuario o contraseña incorrectos.', null, 1800, 'error');
  }
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const nombre = registerNameInput.value.trim();
  const correo = document.getElementById('register-email').value.trim();
  const contrasena = document.getElementById('register-password').value;
  try {
    const usuario = await apiRegistrar(nombre, contrasena, correo);
    showToast('¡Cuenta creada con éxito! Bienvenido, ' + usuario.nombre + '.', () => showCalendar(usuario.id, usuario.nombre));
 } catch (e) {
  showToast(e.message || 'Error al registrarse.', null, 2000, 'error');
}
});

menuButton.addEventListener('click', (event) => {
  event.stopPropagation();
  userMenu.classList.toggle('visible');
});

myEventsButton.addEventListener('click', () => {
  userMenu.classList.remove('visible');
  renderEvents();
});

logoutButton.addEventListener('click', () => {
  localStorage.removeItem('chrono-user');
  showToast('Sesión cerrada. ¡Hasta pronto!', () => showLogin());
});

document.addEventListener('click', (event) => {
  if (!userMenu.contains(event.target) && !menuButton.contains(event.target)) {
    userMenu.classList.remove('visible');
  }
});

confirmAcceptButton.addEventListener('click', () => {
  if (pendingConfirmAction) pendingConfirmAction();
});

confirmCancelButton.addEventListener('click', hideConfirmModal);
confirmModal.addEventListener('click', (event) => {
  if (event.target === confirmModal) hideConfirmModal();
});

setInterval(() => {
  const updatedToday = new Date();
  const updatedTodayKey = formatKey(updatedToday);
  if (updatedTodayKey !== todayKey) {
    today = updatedToday;
    todayKey = updatedTodayKey;
    renderCalendar();
  }
}, 60000);

// ── Inicio ──
selectDate(today);

const savedUser = localStorage.getItem('chrono-user');
if (savedUser) {
  const { id, nombre } = JSON.parse(savedUser);
  showCalendar(id, nombre);
}