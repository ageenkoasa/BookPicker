/**
 * Хранилище пользовательских обложек (localStorage).
 * Ключ — «сырое» название книги, введённое пользователем.
 */
const CoverStore = {
	KEY: "bibliomancy_user_covers",
	_cache: null,

	_load() {
		if (this._cache) return this._cache;
		try {
			this._cache = JSON.parse(localStorage.getItem(this.KEY)) || {};
		} catch {
			this._cache = {};
		}
		return this._cache;
	},

	get(key) {
		return this._load()[key] || null;
	},

	set(key, dataUrl) {
		const store = this._load();
		store[key] = dataUrl;
		this._persist();
	},

	remove(key) {
		const store = this._load();
		delete store[key];
		this._persist();
	},

	_persist() {
		try {
			localStorage.setItem(this.KEY, JSON.stringify(this._cache));
		} catch (e) {
			console.warn("Не удалось сохранить обложку в localStorage:", e);
		}
	},
};

/**
 * Хранилище выбранных книг (только название + дата сохранения).
 */
const SelectedStore = {
	KEY: "bibliomancy_selected_books",

	getAll() {
		try {
			return JSON.parse(localStorage.getItem(this.KEY)) || [];
		} catch {
			return [];
		}
	},

	add(title) {
		const list = this.getAll();
		if (list.some((b) => b.title === title)) return false;
		list.push({ title, savedAt: new Date().toISOString() });
		localStorage.setItem(this.KEY, JSON.stringify(list));
		return true;
	},

	remove(title) {
		const list = this.getAll().filter((b) => b.title !== title);
		localStorage.setItem(this.KEY, JSON.stringify(list));
	},

	has(title) {
		return this.getAll().some((b) => b.title === title);
	},
};
