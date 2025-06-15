const newTaskInput = document.getElementById('new-task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const countAll = document.getElementById('count-all');
const countActive = document.getElementById('count-active');
const countCompleted = document.getElementById('count-completed');
const themeToggleBtn = document.getElementById('theme-toggle-btn');

let tasks = [];
let currentFilter = 'all';

function loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateCounters() {
    countAll.textContent = tasks.length;
    countActive.textContent = tasks.filter(t => !t.completed).length;
    countCompleted.textContent = tasks.filter(t => t.completed).length;
}

function renderTasks() {
    taskList.innerHTML = '';

    let filteredTasks = [];
    if (currentFilter === 'all') {
        filteredTasks = tasks;
    } else if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        if (task.completed) {
            li.classList.add('completed');
        }
        li.dataset.id = task.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

        const label = document.createElement('label');
        label.textContent = task.text;
        label.addEventListener('dblclick', () => editTask(task.id, label));

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => editTask(task.id, label));

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteTask(task.id, li));

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(checkbox);
        li.appendChild(label);
        li.appendChild(actionsDiv);

        taskList.appendChild(li);
    });

    updateCounters();
}

function addTask() {
    const text = newTaskInput.value.trim();
    if (text === '') return;

    const newTask = {
        id: Date.now().toString(),
        text,
        completed: false,
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    newTaskInput.value = '';
}

function toggleTaskCompletion(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id, listItem) {
    // Animate removal
    listItem.classList.add('removing');
    setTimeout(() => {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }, 300);
}

function editTask(id, labelElement) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = task.text;
    input.className = 'edit-input';

    labelElement.replaceWith(input);
    input.focus();

    function saveEdit() {
        const newText = input.value.trim();
        if (newText === '') {
            const li = input.closest('li');
            deleteTask(id, li);
        } else {
            task.text = newText;
            saveTasks();
            renderTasks();
        }
    }

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            input.blur();
        } else if (e.key === 'Escape') {
            renderTasks();
        }
    });
}

function setFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderTasks();
}

function clearCompletedTasks() {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
}

function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    themeToggleBtn.textContent = isDarkMode ? '☀️' : '🌙';
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggleBtn.textContent = '🌙';
    }
}

addTaskBtn.addEventListener('click', addTask);

newTaskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
    });
});

clearCompletedBtn.addEventListener('click', clearCompletedTasks);

themeToggleBtn.addEventListener('click', toggleTheme);

loadTasks();
loadTheme();
renderTasks();
