class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.currentCategory = 'all';
        this.categories = [
            { id: 'work', name: '仕事', color: '#3B82F6', icon: '💼' },
            { id: 'personal', name: 'プライベート', color: '#10B981', icon: '👤' },
            { id: 'shopping', name: '買い物', color: '#F59E0B', icon: '🛒' },
            { id: 'health', name: '健康', color: '#EF4444', icon: '💪' },
            { id: 'other', name: 'その他', color: '#6B7280', icon: '📌' },
        ];
        this.isListening = false;
        this.recognition = null;
        this.initSpeechRecognition();
        this.init();
    }

    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.render();
    }

    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'ja-JP';
            this.recognition.onstart = () => {
                this.isListening = true;
                const voiceBtn = document.getElementById('voiceBtn');
                if (voiceBtn) voiceBtn.classList.add('listening');
            };
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const taskInput = document.getElementById('taskInput');
                if (taskInput) taskInput.value = transcript;
            };
            this.recognition.onend = () => {
                this.isListening = false;
                const voiceBtn = document.getElementById('voiceBtn');
                if (voiceBtn) voiceBtn.classList.remove('listening');
            };
        }
    }

    setupEventListeners() {
        const taskInput = document.getElementById('taskInput');
        const addBtn = document.getElementById('addBtn');
        const voiceBtn = document.getElementById('voiceBtn');

        addBtn.addEventListener('click', () => this.addTask());
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.startVoiceInput());
        }

        document.querySelectorAll('.filter-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        document.querySelectorAll('.category-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => this.setCategory(e.target.dataset.category));
        });

        document.getElementById('clearBtn').addEventListener('click', () => this.clearCompleted());
    }

    startVoiceInput() {
        if (!this.recognition) {
            alert('ブラウザが音声入力に対応していません');
            return;
        }
        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const categorySelect = document.getElementById('categorySelect');
        const taskText = taskInput.value.trim();

        if (!taskText) return;

        const selectedCategory = categorySelect ? categorySelect.value : 'other';

        const task = {
            id: Date.now(),
            text: taskText,
            category: selectedCategory,
            completed: false,
            createdAt: new Date().toLocaleDateString('ja-JP'),
        };

        this.tasks.unshift(task);
        taskInput.value = '';
        if (categorySelect) categorySelect.value = 'other';
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

    setCategory(category) {
        this.currentCategory = category;
        document.querySelectorAll('.category-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        this.render();
    }

    clearCompleted() {
        this.tasks = this.tasks.filter((task) => !task.completed);
        this.saveTasks();
        this.render();
    }

    getFilteredTasks() {
        let filtered = this.tasks;

        if (this.currentCategory !== 'all') {
            filtered = filtered.filter((task) => task.category === this.currentCategory);
        }

        switch (this.currentFilter) {
            case 'active':
                return filtered.filter((task) => !task.completed);
            case 'completed':
                return filtered.filter((task) => task.completed);
            default:
                return filtered;
        }
    }

    getCategoryById(categoryId) {
        return this.categories.find((c) => c.id === categoryId) || this.categories[4];
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
                .map((task) => {
                    const category = this.getCategoryById(task.category);
                    return `
                <li class="task-item ${task.completed ? 'completed' : ''}">
                    <input
                        type="checkbox"
                        class="task-checkbox"
                        ${task.completed ? 'checked' : ''}
                        onchange="app.toggleTask(${task.id})"
                    >
                    <div class="task-content">
                        <span class="task-text">${this.escapeHtml(task.text)}</span>
                        <div class="task-meta">
                            <span class="category-badge" style="background-color: ${category.color}">
                                ${category.icon} ${category.name}
                            </span>
                            <span class="task-date">${task.createdAt}</span>
                        </div>
                    </div>
                    <button class="delete-btn" onclick="app.deleteTask(${task.id})">削除</button>
                </li>
            `;
                })
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
