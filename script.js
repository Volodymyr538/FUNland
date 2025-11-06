// Настройте URL'ы
const externalApplyUrl = "https://example-form.com/apply"; // куда ведёт "Подать заявку"
const modsUrl = "https://example-filehost.com/mods";

document.addEventListener("DOMContentLoaded", () => {
  // Навигация страниц
  const navBtns = document.querySelectorAll(".nav-btn[data-target], .link-like[data-target]");
  navBtns.forEach(btn => btn.addEventListener("click", (e) => {
    const target = e.currentTarget.dataset.target;
    if (target) navigateTo(target, e.currentTarget);
  }));

  // Нижние кнопки с data-target
  document.querySelectorAll(".nav-btn[data-target]").forEach(b => {
    b.addEventListener("click", (e) => setActiveNav(e.currentTarget));
  });

  function navigateTo(id, btn) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const page = document.getElementById(id);
    if (page) page.classList.add("active");

    if (btn && btn.classList.contains("nav-btn")) setActiveNav(btn);
    // скролл наверх для удобства
    window.scrollTo({top:0, behavior:"smooth"});
  }
  function setActiveNav(btn){
    document.querySelectorAll(".nav-btn").forEach(n => n.classList.remove("active"));
    if(btn) btn.classList.add("active");
  }

  // Ссылки
  const modsLink = document.getElementById("mods-link");
  if(modsLink) modsLink.href = modsUrl;
  document.getElementById("apply-btn").addEventListener("click", () => {
    window.open(externalApplyUrl, "_blank", "noopener");
  });
  document.getElementById("open-apply").addEventListener("click", () => {
    window.open(externalApplyUrl, "_blank", "noopener");
  });

  // Открытие модалок
  const complaintModal = document.getElementById("complaint-modal");
  const eventModal = document.getElementById("event-modal");
  document.getElementById("complaint-btn").addEventListener("click", () => openModal(complaintModal));
  document.getElementById("open-complaint").addEventListener("click", () => openModal(complaintModal));
  document.getElementById("create-event-btn").addEventListener("click", () => openModal(eventModal));

  document.querySelectorAll("[data-close]").forEach(btn => btn.addEventListener("click", (e) => {
    const modal = e.currentTarget.closest(".modal");
    closeModal(modal);
  }));
  document.querySelectorAll(".modal-close").forEach(btn => btn.addEventListener("click", (e) => {
    const modal = e.currentTarget.closest(".modal");
    closeModal(modal);
  }));

  document.querySelectorAll(".modal").forEach(m => {
    m.addEventListener("click", (e)=> { if(e.target === m) closeModal(m); });
  });

  function openModal(modal){ if(!modal) return; modal.setAttribute("aria-hidden","false"); }
  function closeModal(modal){ if(!modal) return; modal.setAttribute("aria-hidden","true"); const form = modal.querySelector("form"); if(form) form.reset(); const previews = modal.querySelector(".previews"); if(previews) previews.innerHTML = ""; }

  // Файлы — превью для жалобы
  const complaintFiles = document.getElementById("complaint-files");
  const complaintPreviews = document.getElementById("complaint-previews");
  if(complaintFiles){
    complaintFiles.addEventListener("change", () => showPreviews(complaintFiles.files, complaintPreviews));
  }

  // Обработка формы жалобы (имитация)
  const complaintForm = document.getElementById("complaint-form");
  complaintForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(complaintForm);
    const payload = {
      name: fd.get("name"),
      tg: fd.get("tg"),
      mc: fd.get("mc"),
      reason: fd.get("reason"),
      files: Array.from(complaintFiles.files).map(f => ({name:f.name, size:f.size}))
    };
    console.log("Жалоба (имитация) ->", payload);
    alert("Жалоба принята (локально). Для реальной отправки подключите сервер/API.");
    closeModal(complaintModal);
  });

  // Эвенты — превью и создание
  const eventFiles = document.getElementById("event-files");
  const eventExtras = document.getElementById("event-extras");
  const eventPreviews = document.getElementById("event-previews");

  if(eventFiles) eventFiles.addEventListener("change", ()=> showPreviews(eventFiles.files, eventPreviews));
  if(eventExtras) eventExtras.addEventListener("change", ()=> showPreviews(eventExtras.files, eventPreviews, true));

  const eventForm = document.getElementById("event-form");
  eventForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(eventForm);
    const eventData = {
      title: fd.get("title"),
      description: fd.get("description"),
      media: Array.from(eventFiles.files).map(f => ({name:f.name, size:f.size})),
      extras: Array.from(eventExtras.files).map(f => ({name:f.name, size:f.size}))
    };
    addEventCard(eventData);
    alert("Эвент создан локально. Для публикации сохраните на сервер/БД.");
    closeModal(eventModal);
  });

  function showPreviews(files, container, append = false){
    if(!container) return;
    if(!append) container.innerHTML = "";
    if(files.length === 0) { if(!append) container.innerHTML = "<div class='muted'>Файлы не выбраны.</div>"; return; }
    for(const f of files){
      const item = document.createElement("div");
      item.className = "preview-item";
      const name = document.createElement("div");
      name.className = "preview-name";
      name.textContent = f.name;
      // если картинка — показать миниатюру
      if(f.type.startsWith("image/")){
        const img = document.createElement("img");
        const url = URL.createObjectURL(f);
        img.onload = ()=> URL.revokeObjectURL(url);
        img.src = url;
        item.appendChild(img);
      } else if(f.type.startsWith("video/")){
        const vid = document.createElement("video");
        vid.src = URL.createObjectURL(f);
        vid.controls = true;
        vid.onloadeddata = ()=> URL.revokeObjectURL(vid.src);
        item.appendChild(vid);
      } else {
        item.appendChild(name);
      }
      container.appendChild(item);
    }
  }

  // Добавление карточки эвента
  function addEventCard(eventData){
    const list = document.getElementById("events-list");
    const muted = list.querySelector(".muted");
    if(muted) muted.remove();

    const card = document.createElement("div");
    card.className = "event-card";
    const title = document.createElement("h3"); title.textContent = eventData.title;
    const desc = document.createElement("p"); desc.textContent = eventData.description;
    card.appendChild(title); card.appendChild(desc);

    if(eventData.media.length){
      const media = document.createElement("div"); media.className = "muted";
      media.textContent = "Медиа: " + eventData.media.map(m => m.name).join(", ");
      card.appendChild(media);
    }
    if(eventData.extras.length){
      const extras = document.createElement("div"); extras.className = "muted";
      extras.textContent = "Доп. файлы: " + eventData.extras.map(m => m.name).join(", ");
      card.appendChild(extras);
    }

    list.prepend(card);
  }

  // Админский режим (локально через localStorage)
  const createEventBtn = document.getElementById("create-event-btn");
  function toggleAdminControls(isAdmin){
    if(isAdmin) createEventBtn.style.display = "inline-block";
    else createEventBtn.style.display = "none";
  }
  const isAdmin = localStorage.getItem("FUNland_isAdmin") === "true";
  toggleAdminControls(isAdmin);

  // Ctrl+A переключает режим админа (так же кнопка сверху)
  document.addEventListener("keydown", (e) => {
    if(e.ctrlKey && e.key.toLowerCase() === "a"){
      const cur = localStorage.getItem("FUNland_isAdmin") === "true";
      localStorage.setItem("FUNland_isAdmin", (!cur).toString());
      toggleAdminControls(!cur);
      alert("Режим администратора: " + (!cur));
    }
  });
  document.getElementById("btn-admin-toggle").addEventListener("click", ()=>{
    const cur = localStorage.getItem("FUNland_isAdmin") === "true";
    localStorage.setItem("FUNland_isAdmin", (!cur).toString());
    toggleAdminControls(!cur);
    alert("Режим администратора: " + (!cur));
  });

  // Показываем главную по умолчанию
  navigateTo("home");
});
