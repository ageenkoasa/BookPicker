/**
 * Личный кабинет: полка с книгами, сгруппированными по годам.
 * Корешки рисуются на CSS, цвет детерминирован по названию.
 */
const Cabinet = {
	// Палитра для корешков — тёмные, «библиотечные» тона
	SPINE_COLORS: [
		"#A37065", // бронзово-розовый
		"#8a5a52", // глубокий розово-коричневый
		"#B5837A", // пыльная роза
		"#6f4a43", // тёмный кофейно-розовый
		"#c49a8f", // светлая шампань
		"#5a3f3a", // тёмный шоколад
		"#9a6b62", // тёплый терракотово-розовый
		"#4A3B36", // базовый кофейный
	],

	/**
	 * Детерминированный выбор цвета по названию книги.
	 * Одинаковое название → одинаковый цвет.
	 */
	_pickColor(title) {
		let hash = 0;
		for (let i = 0; i < title.length; i++) {
			hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
		}
		return this.SPINE_COLORS[hash % this.SPINE_COLORS.length];
	},

	render() {
		const content = document.getElementById("cabinet-content");
		const books = SelectedStore.getAll();

		if (books.length === 0) {
			content.innerHTML =
				'<p style="color: var(--text-muted); margin-bottom: 20px;">Пока ничего не выбрано. Откройте карту и нажмите «Выбрать эту книгу».</p>' +
				'<div class="shelf"><div class="shelf-books"></div><div class="shelf-board"></div></div>';
			return;
		}

		// Группировка по годам
		const groups = {};
		books.forEach((b) => {
			const year = new Date(b.savedAt).getFullYear();
			if (!groups[year]) groups[year] = [];
			groups[year].push(b);
		});

		const years = Object.keys(groups).sort((a, b) => b - a);
		let html = "";

		years.forEach((year) => {
			html += `<h3 class="cabinet-year">${year}</h3>`;
			html += '<div class="shelf"><div class="shelf-books">';

			groups[year]
				.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
				.forEach((b) => {
					const color = this._pickColor(b.title);
					const safeTitle = Utils.escapeHtml(b.title);
					html += `
						<div class="book-spine" style="--spine-color: ${color};" title="${safeTitle}" onclick="Cabinet.remove('${safeTitle.replace(/'/g, "\\'")}')">
							<span class="book-spine__title">${safeTitle}</span>
						</div>
					`;
				});

			html += '</div><div class="shelf-board"></div></div>';
		});

		content.innerHTML = html;
	},

	remove(title) {
		Dialog.confirm({
			title: "Убрать книгу с полки?",
			message: `«${title}» будет удалена из личного кабинета.`,
			confirmText: "Убрать",
			cancelText: "Отмена",
		}).then((ok) => {
			if (!ok) return;
			SelectedStore.remove(title);
			this.render();
		});
	},
};
