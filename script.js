// Простая логика навигации, модалок и имитация отправки.
// Настройте ссылки externalApplyUrl и modsUrl под реальные адреса.

const externalApplyUrl = "https://example-form.com/apply"; // куда переходит "Подать заявку"
const modsUrl = "https://example-filehost.com/mods";

document.addEventListener("DOMContentLoaded", () => {
  // Навигация
  const navBtns = document.querySelectorAll(".nav-btn[data-target]");
  navBtns.forEach(b => b.addEventListener("click", (e) => {
    const target = e.currentTarget.dataset.target;
    if (!target) return;
    showPage(target);
    setActiveNav(e.currentTarget);
  }));

  function showPage(id){
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const page = document.getElementById(id);
    if (page) page.classList.add("active");
  }
  function setActiveNav(btn){
    document.querySelectorAll(".nav-btn").forEach(n => n.classList.remove("active"));
    btn.classList.add("active");
  }

  // Ссылка на моды на странице info
  const modsLink = document.getElementById("mods-link");
  if (modsLink) modsLink.href = modsUrl;

  // Кнопка "Подать заявку" — переходит на внешний сайт
  document.getElementById("apply-btn").addEventListener("click", () => {
    window.open(externalApplyUrl, "_blank", "noopener");
  });

  // Модалки
  const complaintModal = document.getElementById("complaint-modal");
  const complaintBtn = document.getElementById("complaint-btn");
  const eventModal = document.getElementById("event-modal");
  const createEventBtn = document.getElementById("create-event-btn");

  // Имитация прав администратора: если в localStorage isAdmin=true — кнопка создания видна
  const isAdmin = localStorage.getItem("FUNland_isAdmin") === "true";
  toggleAdminControls(isAdmin);

  createEventBtn.addEventListener("click", () => {
    openModal(eventModal);
  });

  complaintBtn.addEventListener("click", () => openModal(complaintModal));

  // Закрытие модалок по кнопке
  document.querySelectorAll("[data-close]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const modal = e.currentTarget.closest(".modal");
      closeModal(modal);
    });
  });
  document.querySelectorAll(".modal-close").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const modal = e.currentTarget.closest(".modal");
      closeModal(modal);
    });
  });

  // Закрытие по клику вне содержимого
  document.querySelectorAll(".modal").forEach(m => {
    m.addEventListener("click", (e) => {
      if (e.target === m) closeModal(m);
    });
  });

  function openModal(modal){
    modal.setAttribute("aria-hidden", "false");
  }
  function closeModal(modal){
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    // сброс форм если есть
    const form = modal.querySelector("form");
    if (form) form.reset();
    const fileList = modal.querySelector(".file-list");
    if (fileList) fileList.innerHTML = "";
  }

  // Обработка файлов в форме жалобы (показ имен)
  const complaintFilesInput = document.getElementById("complaint-files");
  const complaintFileList = document.getElementById("complaint-file-list");
  complaintFilesInput.addEventListener("change", () => {
    showFileList(complaintFilesInput.files, complaintFileList);
  });

  // Обработка формы жалобы
  const complaintForm = document.getElementById("complaint-form");
  complaintForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(complaintForm);
    // Имитация отправки — в реальном проекте нужно отправлять на сервер
    const payload = {
      name: fd.get("name"),
      tg: fd.get("tg"),
      mc: fd.get("mc"),
      reason: fd.get("reason"),
      files: Array.from(complaintFilesInput.files).map(f => ({name: f.name, size: f.size}))
    };
    console.log("Жалоба отправлена (имитация):", payload);
    alert("Жалоба отправлена. Спасибо! (Это имитация — интегрируйте сервер для реальной отправки).");
    closeModal(complaintModal);
  });

  // Файлы для эвента
  const eventFilesInput = document.getElementById("event-files");
  const eventFileList = document.getElementById("event-file-list");
  eventFilesInput.addEventListener("change", () => {
    showFileList(eventFilesInput.files, eventFileList);
  });
  const eventExtrasInput = document.getElementById("event-extras");
  eventExtrasInput.addEventListener("change", () => {
    showFileList(eventExtrasInput.files, eventFileList, true);
  });

  // Обработка создания эвента
  const eventForm = document.getElementById("event-form");
  eventForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(eventForm);
    const eventData = {
      title: fd.get("title"),
      description: fd.get("description"),
      media: Array.from(eventFilesInput.files).map(f => ({name: f.name, size: f.size})),
      extras: Array.from(eventExtrasInput.files).map(f => ({name: f.name, size: f.size}))
    };
    addEventCard(eventData);
    alert("Эвент создан (локально). Для хранения и публикации подключите сервер.");
    closeModal(eventModal);
  });

  // Показываем список файлов
  function showFileList(fileList, container, append=false){
    if(!container) return;
    if(!append) container.innerHTML = "";
    if(fileList.length === 0){
      if(!append) container.innerHTML = "<span class='muted'>Файлы не выбраны.</span>";
      return;
    }
    const ul = document.createElement("ul");
    for(const f of fileList){
      const li = document.createElement("li");
      li.textContent = `${f.name} (${Math.round(f.size/1024)} KB)`;
      ul.appendChild(li);
    }
    container.appendChild(ul);
  }

  // Добавление карточки эвента в список
  function addEventCard(eventData){
    const list = document.getElementById("events-list");
    // удаляем muted сообщение
    const muted = list.querySelector(".muted");
    if(muted) muted.remove();

    const card = document.createElement("div");
    card.className = "event-card";
    const title = document.createElement("h3");
    title.textContent = eventData.title;
    const desc = document.createElement("p");
    desc.textContent = eventData.description;
    const media = document.createElement("div");
    media.className = "muted";
    if(eventData.media.length) media.textContent = `Медиа (${eventData.media.length}): ` + eventData.media.map(m => m.name).join(", ");
    if(eventData.extras.length){
      const extras = document.createElement("div");
      extras.className = "muted";
      extras.textContent = `Доп. файлы (${eventData.extras.length}): ` + eventData.extras.map(m => m.name).join(", ");
      card.appendChild(extras);
    }
    card.appendChild(title);
    card.appendChild(desc);
    if(eventData.media.length) card.appendChild(media);
    list.prepend(card);
  }

  // Простая функция для включения/отключения админских элементов
  function toggleAdminControls(isAdmin){
    const createBtn = document.getElementById("create-event-btn");
    if(isAdmin) createBtn.style.display = "inline-block";
    else createBtn.style.display = "none";
  }

  // --- Удобство: клавиша A включает/выключает локально режим админа (только для теста)
  document.addEventListener("keydown", (e) => {
    if(e.key.toLowerCase() === "a" && e.ctrlKey){
      const cur = localStorage.getItem("FUNland_isAdmin") === "true";
      localStorage.setItem("FUNland_isAdmin", (!cur).toString());
      toggleAdminControls(!cur);
      alert("Режим администратора: " + (!cur));
    }
  });

  // Инициализация: показываем главную
  showPage("home");
});
