document.addEventListener("DOMContentLoaded", ()=> {
    document.getElementById("logout").addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.clear(); 
    location.reload();    
});
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
        if (section === "tasks") showTasks();
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
        const logs = loadData("logs") || [];
        if (!logs.length) {
            content.innerHTML = `<section><h2>Logs</h2><p>No logs yet.</p></section>`;
            return;
        }
        content.innerHTML = `
          <section>
            <h2>Logs</h2>
            <ul class="logs-list">
              ${logs.map(log => `<li><strong>[${log.timestamp}]</strong> ${log.message}</li>`).join("")}
            </ul>
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
        addLog(`User added: ${newUser.name} (${newUser.role})`);
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
        addLog(`User edited: ${user.name} (${user.role})`);
        showUsers();
    }

    function deleteUser(id) {
        const user = users.find(u => u.id == id);
        if (!user) return;
        if (!confirm("Delete this user?")) return;
        users = users.filter(u => u.id != id);
        saveData("users", users);
        addLog(`User deleted: ${user.name} (${user.role})`);
        showUsers();
    }

    function saveData(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function loadData(key) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    }

    function addLog(message) {
        const timestamp = new Date().toLocaleString();
        let logs = loadData("logs") || [];
        logs.unshift({ message, timestamp });
        if (logs.length > 50) logs.pop();
        saveData("logs", logs);
    }

  let searchTimeout;

function onSearch(e) {
    clearTimeout(searchTimeout);
    const query = e.target.value.toLowerCase();
    searchTimeout = setTimeout(() => {
        searchText = query;
        showUsers();
    }, 1000); 
}

    function sortBy(key) {
        if (sortKey === key) sortDirection *= -1;
        else { sortKey = key; sortDirection = 1; }
        showUsers();
    }

    function showHome() {
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
        `;

        const timeEl = document.getElementById("current-time");
        setInterval(() => {
            timeEl.innerHTML = `<strong>${new Date().toLocaleTimeString()}</strong><div>Current Time</div>`;
        }, 1000);

        const metricData = [
            { name: "Server Load", value: () => (Math.random() * 100).toFixed(1), unit: "%", hasBar: true },
            { name: "API Requests", value: () => Math.floor(Math.random() * 10000), unit: "", hasBar: false },
            { name: "Active Sessions", value: () => Math.floor(Math.random() * 500), unit: "", hasBar: false },
            { name: "DB Latency", value: () => (Math.random() * 120).toFixed(2), unit: " ms", hasBar: true },
            { name: "Error Rate", value: () => (Math.random() * 3).toFixed(2), unit: "%", hasBar: true }
        ];

        const metricCards = document.getElementById("metric-cards");
        function renderMetrics() {
            const metricValues = metricData.map(m => {
                const rawVal = m.value();
                const numericValue = parseFloat(rawVal);
                return { ...m, rawVal, numericValue };
            });

            if (!document.querySelector("#server-load-chart")) {
                metricCards.innerHTML = `
                <div class="server-load-card card">
                    <h3>Server Load</h3>
                    <p class="metric-value">${metricValues[0].rawVal}${metricValues[0].unit}</p>
                    <div class="metric-bar">
                    <div class="metric-bar-fill" style="width: 0%;"></div>
                    </div>
                    <canvas id="server-load-chart" width="200" height="150"></canvas>
                </div>
                <div class="other-metrics">
                    ${metricValues.slice(1).map(m => `
                    <div class="card metric-card">
                        <h3>${m.name}</h3>
                        <p class="metric-value">${m.rawVal}${m.unit}</p>
                    </div>
                    `).join("")}
                </div>
                `;

                const ctx = document.getElementById("server-load-chart").getContext("2d");
                window.serverChart = new Chart(ctx, {
                    type: "line",
                    data: {
                        labels: ["CPU", "Memory", "Disk", "Network"],
                        datasets: [{
                            label: "Usage %",
                            data: [30, 50, 60, 40],
                            fill: true,
                            backgroundColor: "rgba(37, 99, 235, 0.2)",
                            borderColor: "rgba(37, 99, 235, 1)",
                            tension: 0.4,
                            pointRadius: 5,
                            pointBackgroundColor: "rgba(37, 99, 235, 1)"
                        }]
                    },
                    options: {
                        responsive: true,
                        animation: { duration: 1000, easing: 'easeOutQuart' },
                        scales: { y: { beginAtZero: true, max: 100, ticks: { stepSize: 25 } } },
                        plugins: { legend: { display: false } }
                    }
                });
            }

            const bar = document.querySelector(".server-load-card .metric-bar-fill");
            const serverLoad = metricValues[0].numericValue;
            setTimeout(() => (bar.style.width = `${Math.min(serverLoad, 100)}%`), 50);

            document.querySelector(".server-load-card .metric-value").textContent =
            metricValues[0].rawVal + metricValues[0].unit;

            const otherCards = document.querySelectorAll(".other-metrics .metric-card");
            otherCards.forEach((card, i) => {
                const valEl = card.querySelector(".metric-value");
                if (valEl) valEl.textContent = metricValues[i + 1].rawVal + metricValues[i + 1].unit;
            });

            if (window.serverChart) {
                window.serverChart.data.datasets[0].data = [
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100
                ];
                window.serverChart.update();
            }
        }
        renderMetrics();
        setInterval(renderMetrics, 4000);
    }

    function showTasks() {
        content.innerHTML=`
        <section class="home-tasks">
        <h3>Recent Tasks / To-Do</h3>
        <div class="task-controls">
        <select id="task-filter">
        <option value="all">All</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
        </select>
        <button id="sort-tasks-btn">Sort A-Z</button>
        </div>
        <div id="task-list"></div>
        <button id="add-task-btn">Add Task</button>
        </section>
        `;

        let tasks = loadData("tasks") || [];
        const taskListEl = document.getElementById("task-list");

        function renderTasks() {
            const filterValue = document.getElementById("task-filter").value;
            let filteredTasks = tasks.filter(t => {
                if (filterValue === "completed") return t.completed;
                if (filterValue === "pending") return !t.completed;
                return true;
            });
            if (window.sortAZ) filteredTasks.sort((a, b) => a.text.localeCompare(b.text));

            if (!tasks.length) {
                taskListEl.innerHTML = "<p>No tasks yet.</p>";
                return;
            }

            taskListEl.innerHTML = filteredTasks.map((t, i) => `
            <div class="task-item">
                <label><input type="checkbox" class="task-checkbox" data-index="${i}" ${t.completed ? "checked" : ""}>
                <span>${t.text}</span></label>
                <button class="delete-task-btn" data-index="${i}">Delete</button>
            </div>
            `).join("");

            document.querySelectorAll(".task-checkbox").forEach(cb => {
                cb.addEventListener("change", e => {
                    const idx = e.target.dataset.index;
                    tasks[idx].completed = e.target.checked;
                    saveData("tasks", tasks);
                    addLog(`Task ${tasks[idx].text} marked as ${tasks[idx].completed ? 'completed' : 'incomplete'}`);
                    renderTasks();
                });
            });

            document.querySelectorAll(".delete-task-btn").forEach(btn => {
                btn.addEventListener("click", e => {
                    const index = e.target.dataset.index;
                    addLog(`Task deleted: ${tasks[index].text}`);
                    tasks.splice(index, 1);
                    saveData("tasks", tasks);
                    renderTasks();
                });
            });
        }

        document.getElementById("add-task-btn").addEventListener("click", () => {
            const task = prompt("Enter new task:");
            if (!task) return;
            tasks.push({text: task.trim(), completed: false});
            saveData("tasks", tasks);
            addLog(`Task added: ${task.trim()}`);
            renderTasks();
        });

        renderTasks();
        document.getElementById("task-filter").addEventListener("change", renderTasks);
        window.sortAZ = false;
        document.getElementById("sort-tasks-btn").addEventListener("click", () => {
            window.sortAZ = !window.sortAZ;
            renderTasks();
        });
    }
});
