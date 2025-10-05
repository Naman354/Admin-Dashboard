document.addEventListener("DOMContentLoaded", ()=> {
    const defaultUsers = [
      { id: 1, name: "Alice Johnson", email: "alice@gmail.com", role: "Admin", createdAt: new Date().toISOString() },
      { id: 2, name: "Bob Martin", email: "bob@gmail.com", role: "Editor", createdAt: new Date().toISOString() },
      { id: 3, name: "Cara Lee", email: "cara@gmail.com", role: "Viewer", createdAt: new Date().toISOString() }
];

    let users = loadData("users") || defaultUsers;
    let currentSection = "home";
    let searchText = "";
    let sortKey = null;
    let sortDirection = 1;

    const content = document.getElementById("content");
    const sidebar = document.querySelector(".sidebar");

    setupSidebar();
    showSection(currentSection);

      function setupSidebar() {
    sidebar.addEventListener("click", (e) => {
      const button = e.target.closest(".nav-btn");
      if (!button) return;

      document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
      button.classList.add("active");

      currentSection = button.dataset.section;
      showSection(currentSection);
    });
  }

   function showSection(section) {
    if (section === "home") showHome();
    if (section === "users") showUsers();
    if (section === "logs") showLogs();
  }

  function showUsers() {
    const filtered = users.filter((u) => {
      const text = (u.name + u.email + u.role).toLowerCase();
      return text.includes(searchText);
    });

    if (sortKey) {
      filtered.sort((a, b) => {
        const valA = a[sortKey].toString().toLowerCase();
        const valB = b[sortKey].toString().toLowerCase();

        if (valA < valB) return -1 * sortDirection;
        if (valA > valB) return 1 * sortDirection;
        return 0;
      });
    }

    const tableRows = filtered
      .map((u) => {
        return `
        <tr>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td>${new Date(u.createdAt).toLocaleString()}</td>
          <td>
            <button class="edit-btn" data-id="${u.id}">Edit</button>
            <button class="delete-btn" data-id="${u.id}">Delete</button>
          </td>
        </tr>
        `;
      })
      .join("");


      content.innerHTML = `
      <section>
        <div class="users-header">
          <h2>Users</h2>
          <div>
            <input id="search-input" placeholder="Search..." value="${searchText}">
            <button id="add-user-btn">Add user</button>
          </div>
        </div>

        <table class="users-table">
          <thead>
            <tr>
              <th data-key="name">Name</th>
              <th data-key="email">Email</th>
              <th data-key="role">Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </section>
    `;

    document.getElementById("add-user-btn").addEventListener("click", addUser);
    document.getElementById("search-input").addEventListener("input", onSearch);

    document.querySelectorAll(".edit-btn").forEach((btn) => btn.addEventListener("click", () => editUser(btn.dataset.id)));
    document.querySelectorAll(".delete-btn").forEach((btn) => btn.addEventListener("click", () => deleteUser(btn.dataset.id)));
    document.querySelectorAll("th[data-key]").forEach((th) => th.addEventListener("click", () => sortBy(th.dataset.key)));
  }

  function showLogs() {
    content.innerHTML = `
      <section>
        <h2>Logs</h2>
        <p>We'll add real logs later!</p>
      </section>
    `;
  }

   function addUser() {
    const name = prompt("Enter name:");
    if (!name) return;
    const email = prompt("Enter email:");
    if (!email) return;
    const role = prompt("Enter role (Admin/Editor/Viewer):", "Viewer") || "Viewer";

    const newUser = {
        id: users.length ? users[users.length - 1].id + 1 : 1,
        name: name.trim(),
        email: email.trim(),
        role: role.trim(),
        createdAt: new Date().toISOString()
};

    users.push(newUser);
    saveData("users", users);
    showUsers();
  }

   function editUser(id) {
        const user = users.find(u => u.id == id);
        if (!user) return alert("User not found!");

        const newName = prompt("Edit name:", user.name);
        const newEmail = prompt("Edit email:", user.email);
        const newRole = prompt("Edit role:", user.role);

        if (newName) user.name = newName.trim();
        if (newEmail) user.email = newEmail.trim();
        if (newRole) user.role = newRole.trim();

        saveData("users", users);
        showUsers();
    }

    function deleteUser(id) {
        if (!confirm("Delete this user?")) return;
        users = users.filter(u => u.id != id);
        saveData("users", users);
        showUsers();
    }
    
    function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function loadData(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

   function onSearch(e) {
    searchText = e.target.value.toLowerCase();
    showUsers();
  }

  function sortBy(key) {
    if (sortKey === key) {
      sortDirection *= -1;
    } else {
      sortKey = key;
      sortDirection = 1;
    }
    showUsers();
  } function showHome() {
  const totalUsers = users.length;
  const admins = users.filter(u => u.role === "Admin").length;
  const editors = users.filter(u => u.role === "Editor").length;
  const viewers = users.filter(u => u.role === "Viewer").length;

  content.innerHTML = `
    <section class="home-welcome">
      <h2>Welcome back, Admin!</h2>
      <p>Here's a quick snapshot of your dashboard:</p>
      <div class="cards">
        <div class="card"><strong>${totalUsers}</strong><div>Total Users</div></div>
        <div class="card"><strong>${admins}</strong><div>Admins</div></div>
        <div class="card"><strong>${editors}</strong><div>Editors</div></div>
        <div class="card"><strong>${viewers}</strong><div>Viewers</div></div>
        <div class="card" id="current-time"><strong>${new Date().toLocaleTimeString()}</strong><div>Current Time</div></div>
      </div>
    </section>

     <section class="metrics">
      <h3>System Metrics</h3>
      <div class="cards" id="metric-cards"></div>
    </section>

    <section class="home-tasks">
      <h3>Recent Tasks / To-Do</h3>
      <div id="task-list"></div>
      <button id="add-task-btn">Add Task</button>
    </section>
  `;

  const timeEl = document.getElementById("current-time");
  setInterval(() => {
    timeEl.innerHTML = `<strong>${new Date().toLocaleTimeString()}</strong><div>Current Time</div>`;
  }, 1000);

  const metricData = [
    { name: "Server Load", value: () => `${(Math.random() * 100).toFixed(1)}%` },
    { name: "API Requests", value: () => Math.floor(Math.random() * 10000) },
    { name: "Active Sessions", value: () => Math.floor(Math.random() * 500) },
    { name: "DB Latency", value: () => `${(Math.random() * 120).toFixed(2)} ms` },
    { name: "Error Rate", value: () => `${(Math.random() * 3).toFixed(2)}%` }
  ];

  const metricCards = document.getElementById("metric-cards");

  function renderMetrics() {
    metricCards.innerHTML = metricData.map(m => `
      <div class="card metric-card">
        <strong>${m.value()}</strong>
        <div>${m.name}</div>
      </div>
    `).join("");
  }
  
  renderMetrics();
  setInterval(renderMetrics, 4000);

  let tasks = loadData("tasks") || [];
  const taskListEl = document.getElementById("task-list");

  function renderTasks() {
    if (!tasks.length) {
      taskListEl.innerHTML = "<p>No tasks yet.</p>";
      return;
    }
    taskListEl.innerHTML = tasks.map((t, i) => `
      <div class="task-item">
        <span>${t}</span>
        <button class="delete-task-btn" data-index="${i}">Delete</button>
      </div>
    `).join("");

    document.querySelectorAll(".delete-task-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const index = e.target.dataset.index;
        tasks.splice(index, 1);
        saveData("tasks", tasks);
        renderTasks();
      });
    });
  }

  document.getElementById("add-task-btn").addEventListener("click", () => {
    const task = prompt("Enter new task:");
    if (!task) return;
    tasks.push(task.trim());
    saveData("tasks", tasks);
    renderTasks();
  });
 renderTasks();
}
});
