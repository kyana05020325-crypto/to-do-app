class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        const taskInput = document.getElementById('taskInput');
        const addBtn = document.getElementById('addBtn');

        addBtn.addEventListener('click', () => this.addTask());
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        document.querySelectorAll('.filter-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        document.getElementById('clearBtn').addEventListener('click', () => this.clearCompleted());
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const taskText = taskInput.value.trim();

        if (!taskText) return;

        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toLocaleDateString('ja-JP'),
        };

        this.tasks.unshift(task);
        taskInput.value = '';
        this.saveTasks();
        this.render();
        taskInput.focus();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter((task) => task.id !== id);
        this.saveTasks();
        this.render();
    }

    toggleTask(id) {
        const task = this.tasks.find((t) => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    clearCompleted() {
        this.tasks = this.tasks.filter((task) => !task.completed);
        this.saveTasks();
        this.render();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter((task) => !task.completed);
            case 'completed':
                return this.tasks.filter((task) => task.completed);
            default:
                return this.tasks;
        }
    }

    getActiveCount() {
        return this.tasks.filter((task) => !task.completed).length;
    }

    render() {
        const taskList = document.getElementById('taskList');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<div class="empty-state"><p>タスクがありません</p></div>';
        } else {
            taskList.innerHTML = filteredTasks
                .map(
                    (task) => `
                <li class="task-item ${task.completed ? 'completed' : ''}">
                    <input
                        type="checkbox"
                        class="task-checkbox"
                        ${task.completed ? 'checked' : ''}
                        onchange="app.toggleTask(${task.id})"
                    >
                    <span class="task-text">${this.escapeHtml(task.text)}</span>
                    <span class="task-date">${task.createdAt}</span>
                    <button class="delete-btn" onclick="app.deleteTask(${task.id})">削除</button>
                </li>
            `
                )
                .join('');
        }

        document.getElementById('activeCount').textContent = this.getActiveCount();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const stored = localStorage.getItem('tasks');
        this.tasks = stored ? JSON.parse(stored) : [];
    }
}

const app = new TodoApp();
