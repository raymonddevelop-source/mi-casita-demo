(() => {

  // ====== Placeholder generator (movido arriba para evitar error) ======
  function makePlaceholder(label){
    const w = 1400, h = 900;
    const bg = "#0b1022";
    const a0 = "#2ea8ff";
    const a1 = "#0b5cff";
    const txt = "#d7e3ff";

    const svg =
`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a0}" stop-opacity="0.18"/>
      <stop offset="1" stop-color="${a1}" stop-opacity="0.18"/>
    </linearGradient>
    <radialGradient id="r" cx="25%" cy="20%" r="70%">
      <stop offset="0" stop-color="${a0}" stop-opacity="0.25"/>
      <stop offset="1" stop-color="${bg}" stop-opacity="1"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="${bg}"/>
  <rect width="100%" height="100%" fill="url(#r)"/>
  <rect x="60" y="60" width="${w-120}" height="${h-120}" rx="48" fill="url(#g)" stroke="rgba(255,255,255,0.10)"/>
  <text x="110" y="170" fill="${txt}" font-size="52" font-family="ui-sans-serif, system-ui" font-weight="800">Mi Casita Demo</text>
  <text x="110" y="240" fill="rgba(255,255,255,0.68)" font-size="30" font-family="ui-sans-serif, system-ui">${label}</text>
  <text x="110" y="${h-110}" fill="rgba(255,255,255,0.55)" font-size="22" font-family="ui-sans-serif, system-ui">Placeholder • Replace with real photos</text>
</svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function escapeXml(s){
    return String(s).replace(/[<>&'"]/g, (c) => ({
      "<":"&lt;", ">":"&gt;", "&":"&amp;", "'":"&apos;", "\"":"&quot;"
    }[c]));
  }

  // ====== Config ======
  const CONFIG = {
    propertyName: "Mi Casita Demo",
    pricePerNight: 165,
    minNights: 2,
    photos: [
      makePlaceholder("Exterior • Noche"),
      makePlaceholder("Sala • Luz"),
      makePlaceholder("Cocina • Clean"),
      makePlaceholder("Habitación • Calm"),
      makePlaceholder("Baño • Minimal"),
      makePlaceholder("Terraza • View")
    ],
    blockedDates: new Set([
      "2026-03-06",
      "2026-03-07",
      "2026-03-14",
      "2026-03-15",
      "2026-03-22",
      "2026-03-27"
    ])
  };

  // ====== DOM helpers ======
  const $ = (id) => document.getElementById(id);

  function pad2(n){ return String(n).padStart(2, "0"); }
  function ymd(d){ return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }
  function addDays(date, days){
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }
  function diffDays(a, b){
    return Math.round((b - a) / (1000*60*60*24));
  }

  // ====== Calendar básico ======
  const DOW = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
  let viewMonth = new Date();
  viewMonth.setDate(1);

  let checkIn = null;
  let checkOut = null;

  function isBlocked(dateObj){
    return CONFIG.blockedDates.has(ymd(dateObj));
  }

  function isSameDay(a,b){
    return a && b && ymd(a) === ymd(b);
  }

  function inRange(d){
    if (!checkIn || !checkOut) return false;
    return d > checkIn && d < checkOut;
  }

  function updateSummary(){
    $("sIn").textContent = checkIn ? ymd(checkIn) : "—";
    $("sOut").textContent = checkOut ? ymd(checkOut) : "—";

    if (checkIn && checkOut){
      const nights = diffDays(checkIn, checkOut);
      $("sNights").textContent = nights;
      $("sTotal").textContent = `$${nights * CONFIG.pricePerNight}`;
    } else {
      $("sNights").textContent = "—";
      $("sTotal").textContent = "—";
    }
  }

  function handleDayClick(dateObj){
    if (isBlocked(dateObj)) return;

    if (!checkIn || (checkIn && checkOut)){
      checkIn = dateObj;
      checkOut = null;
    } else if (dateObj > checkIn){
      checkOut = dateObj;
    } else {
      checkIn = dateObj;
      checkOut = null;
    }

    updateSummary();
    renderCalendar();
  }

  function renderCalendar(){
    const host = $("calendar");
    if (!host) return;

    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();

    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const daysInMonth = last.getDate();

    const jsDow = first.getDay();
    const mondayIndex = (jsDow + 6) % 7;

    const grid = document.createElement("div");
    grid.className = "cal-grid";

    for (const d of DOW){
      const cell = document.createElement("div");
      cell.className = "cal-dow";
      cell.textContent = d;
      grid.appendChild(cell);
    }

    for (let i = 0; i < mondayIndex; i++){
      const blank = document.createElement("div");
      blank.className = "cal-cell disabled";
      grid.appendChild(blank);
    }

    for (let day = 1; day <= daysInMonth; day++){
      const d = new Date(year, month, day);
      const cell = document.createElement("div");
      cell.className = "cal-cell";

      const blocked = isBlocked(d);
      if (blocked) cell.classList.add("blocked");

      if (isSameDay(d, checkIn) || isSameDay(d, checkOut)){
        cell.classList.add("selected");
      }

      if (inRange(d)){
        cell.classList.add("inrange");
      }

      cell.innerHTML = `<div class="cal-num">${day}</div>`;

      if (!blocked){
        cell.addEventListener("click", () => handleDayClick(d));
      }

      grid.appendChild(cell);
    }

    host.innerHTML = "";
    host.appendChild(grid);
  }

  function init(){
    renderCalendar();
    updateSummary();
  }

  document.addEventListener("DOMContentLoaded", init);

})();
