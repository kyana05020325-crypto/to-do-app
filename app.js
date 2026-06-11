import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.currentCategory = 'all';
        this.user = null;
        this.supabase = null;
        this.isListening = false;
        this.recognition = null;
        this.categories = [
            { id: 'work', name: '仕事', color: '#3B82F6', icon: '💼' },
            { id: 'personal', name: 'プライベート', color: '#10B981', icon: '👤' },
            { id: 'shopping', name: '買い物', color: '#F59E0B', icon: '🛒' },
            { id: 'health', name: '健康', color: '#EF4444', icon: '💪' },
            { id: 'other', name: 'その他', color: '#6B7280', icon: '📌' },
        ];
        this.initSupabase();
    }

    async initSupabase() {
        try {
            // サーバーからSupabase設定を取得
            const response = await fetch('/api/config');
            const config = await response.json();

            this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

            // 認証状態をチェック
            const { data: { user } } = await this.supabase.auth.getUser();
            this.user = user;

            if (user) {
                console.log('✅ Supabase connected');
                this.init();
            } else {
                console.log('ユーザーがログインしていません');
                this.showAuthUI();
            }

            // 認証状態の変更を監視
            this.supabase.auth.onAuthStateChange((event, session) => {
                this.user = session?.user || null;
                if (event === 'SIGNED_IN') {
                    this.init();
                    document.getElementById('authUI').style.display = 'none';
                } else if (event === 'SIGNED_OUT') {
                    this.showAuthUI();
                }
            });
        } catch (error) {
            console.error('Supabase初期化エラー:', error);
        }
    }

    showAuthUI() {
        const authUI = document.getElementById('authUI');
        if (authUI) {
            authUI.style.display = 'block';
            document.getElementById('appContent').style.display = 'none';
        }
    }

    async signUp() {
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        if (!email || !password) {
            alert('メールアドレスとパスワードを入力してください');
            return;
        }

        const { error } = await this.supabase.auth.signUp({ email, password });
        if (error) {
            alert('サインアップエラー: ' + error.message);
        } else {
            alert('サインアップ完了！メールアドレスを確認してください');
        }
    }

    async signIn() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            alert('メールアドレスとパスワードを入力してください');
            return;
        }

        const { error } = await this.supabase.auth.signInWithPassword({ email, password });
        if (error) {
            alert('ログインエラー: ' + error.message);
        }
    }

    async signOut() {
        await this.supabase.auth.signOut();
    }

    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.setupRealtimeSubscription();
        this.render();
        document.getElementById('authUI').style.display = 'none';
        document.getElementById('appContent').style.display = 'block';
    }

    setupRealtimeSubscription() {
        if (!this.user) return;

        this.supabase
            .channel('tasks-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'tasks',
                    filter: `user_id=eq.${this.user.id}`,
                },
                () => {
                    this.loadTasks();
                }
            )
            .subscribe();
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
            this.initSpeechRecognition();
        }

        document.querySelectorAll('.filter-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        document.querySelectorAll('.category-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => this.setCategory(e.target.dataset.category));
        });

        document.getElementById('clearBtn').addEventListener('click', () => this.clearCompleted());
        document.getElementById('logoutBtn').addEventListener('click', () => this.signOut());
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

    async addTask() {
        const taskInput = document.getElementById('taskInput');
        const categorySelect = document.getElementById('categorySelect');
        const taskText = taskInput.value.trim();

        if (!taskText || !this.user) return;

        const selectedCategory = categorySelect ? categorySelect.value : 'other';

        const { error } = await this.supabase
            .from('tasks')
            .insert([
                {
                    text: taskText,
                    category: selectedCategory,
                    completed: false,
                    user_id: this.user.id,
                }
            ]);

        if (error) {
            console.error('タスク追加エラー:', error);
            alert('タスク追加に失敗しました');
        } else {
            taskInput.value = '';
            if (categorySelect) categorySelect.value = 'other';
            this.loadTasks();
            taskInput.focus();
        }
    }

    async deleteTask(id) {
        const { error } = await this.supabase
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('削除エラー:', error);
        } else {
            this.loadTasks();
        }
    }

    async toggleTask(id) {
        const task = this.tasks.find((t) => t.id === id);
        if (!task) return;

        const { error } = await this.supabase
            .from('tasks')
            .update({ completed: !task.completed })
            .eq('id', id);

        if (error) {
            console.error('更新エラー:', error);
        } else {
            this.loadTasks();
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

    async clearCompleted() {
        const { error } = await this.supabase
            .from('tasks')
            .delete()
            .eq('completed', true)
            .eq('user_id', this.user.id);

        if (error) {
            console.error('削除エラー:', error);
        } else {
            this.loadTasks();
        }
    }

    async loadTasks() {
        if (!this.user) return;

        const { data, error } = await this.supabase
            .from('tasks')
            .select('*')
            .eq('user_id', this.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('データ読み込みエラー:', error);
        } else {
            this.tasks = data || [];
            this.render();
        }
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

    getActiveCount() {
        return this.tasks.filter((task) => !task.completed).length;
    }

    getCategoryById(categoryId) {
        return this.categories.find((c) => c.id === categoryId) || this.categories[4];
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
                    const createdDate = new Date(task.created_at).toLocaleDateString('ja-JP');
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
                            <span class="task-date">${createdDate}</span>
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
}

const app = new TodoApp();
