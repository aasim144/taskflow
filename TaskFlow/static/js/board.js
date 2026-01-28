let draggedTask = null;

document.querySelectorAll(".task").forEach(task => {
  task.addEventListener("dragstart", () => {
    draggedTask = task;
    task.classList.add("dragging");
  });

  task.addEventListener("dragend", () => {
    task.classList.remove("dragging");
    draggedTask = null;
    updateProgress();
  });
});

window.onload = loadTasks;

function loadTasks() {
    fetch(`/tasks/${BOARD_ID}`)
        .then(res => res.json())
        .then(tasks => {

            document.getElementById("todo").innerHTML = "<h3>To Do</h3>";
            document.getElementById("inprogress").innerHTML = "<h3>In Progress</h3>";
            document.getElementById("done").innerHTML = "<h3>Done</h3>";

            tasks.forEach(task => {
                const card = document.createElement("div");
                card.className = "task";
                card.draggable = true;
                card.dataset.id = task.id;

                // TITLE
                const title = document.createElement("div");
                title.className = "task-title";
                title.innerText = task.title;

                // DEADLINE
                const deadline = document.createElement("div");
                deadline.className = "task-deadline";
                deadline.innerText = "Deadline: " + task.deadline;

                card.appendChild(title);
                card.appendChild(deadline);

                if (task.status === "To Do") {
                    document.getElementById("todo").appendChild(card);
                } else if (task.status === "In Progress") {
                    document.getElementById("inprogress").appendChild(card);
                } else {
                    document.getElementById("done").appendChild(card);
                }
            });

            updateProgress();
        });
}




document.querySelectorAll(".column").forEach(column => {
  column.addEventListener("dragover", e => e.preventDefault());

  column.addEventListener("drop", () => {
    if (!draggedTask) return;

    column.appendChild(draggedTask);

    fetch("/update-task-status", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        task_id: draggedTask.dataset.id,
        status: column.dataset.status
      })
    });
  });
});

function updateProgress() {
  const total = document.querySelectorAll(".task").length;
  const done = document.querySelectorAll("#done .task").length;

  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  document.getElementById("progress-bar").style.width = percent + "%";
}

updateProgress();


function createTaskCard(task) {
    const div = document.createElement("div");
    div.className = "task-card";
    div.draggable = true;
    div.dataset.id = task.id;

    div.innerHTML = `
        <strong class="task-title">${task.title}</strong>
        <p class="task-deadline">Deadline: ${task.deadline}</p>

        <div class="task-actions">
            <button onclick="editTask(${task.id}, '${task.title}', '${task.deadline}')">✏️</button>
            <button onclick="deleteTask(${task.id})">🗑️</button>
        </div>
    `;

    addDragEvents(div);
    preventTextSelection(div);
    return div;
}


function editTask(id, title, deadline) {
    const newTitle = prompt("Edit Task Title:", title);
    if (!newTitle) return;

    const newDeadline = prompt("Edit Deadline (YYYY-MM-DD):", deadline);
    if (!newDeadline) return;

    fetch("/edit-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            task_id: id,
            title: newTitle,
            deadline: newDeadline
        })
    }).then(() => loadTasks());
}


function deleteTask(taskId) {
    if (!confirm("Delete this task?")) return;

    fetch("/delete-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId })
    }).then(() => loadTasks());
}


function generateAITasks() {
    fetch("/ai-generate-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId })
    }).then(() => loadTasks());
}

function editCard(span) {
    const card = span.closest(".card");
    const id = card.dataset.id;
    const oldText = span.innerText;

    const input = document.createElement("input");
    input.value = oldText;
    input.className = "edit-input";

    span.replaceWith(input);
    input.focus();

    input.onblur = () => saveEdit(input, id);
    input.onkeydown = (e) => {
        if (e.key === "Enter") input.blur();
    };
}

function saveEdit(input, id) {
    fetch("/update-task", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            id: id,
            title: input.value
        })
    });

    const span = document.createElement("span");
    span.className = "card-title";
    span.innerText = input.value;
    span.onclick = () => editCard(span);

    input.replaceWith(span);
}



