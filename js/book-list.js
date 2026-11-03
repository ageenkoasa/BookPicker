/**
 * Компонент ввода списка книг.
 * Каждая строка: превью обложки (кликабельно), поле ввода, кнопка удаления.
 * Обложки сохраняются в CoverStore по «сырому» названию.
 */
const BookList = {
	root: null,
	items: [],

	init(rootEl) {
		this.root = rootEl;
		this.items = [{ title: "", author: "", raw: "", coverUrl: "" }];
		this.render();
	},

	addRow() {
		this.items.push({ title: "", author: "", raw: "", coverUrl: "" });
		this.render();
	},

	removeRow(idx) {
		this.items.splice(idx, 1);
		if (this.items.length === 0) {
			this.items.push({ title: "", author: "", raw: "", coverUrl: "" });
		}
		this.render();
	},

	updateTitle(idx, value) {
		let title = value,
			author = "";
		const separators = [" - ", " — ", " : ", " | "];
		for (const sep of separators) {
			if (value.includes(sep)) {
				const parts = value.split(sep);
				author = parts[0].trim();
				title = parts.slice(1).join(sep).trim();
				break;
			}
		}

		const oldRaw = this.items[idx].raw || "";
		const newRaw = value;

		// Если название изменилось, а обложка была сохранена под старым ключом — переносим
		if (oldRaw && oldRaw !== newRaw) {
			const saved = CoverStore.get(oldRaw);
			if (saved) {
				CoverStore.remove(oldRaw);
				CoverStore.set(newRaw, saved);
				this.items[idx].coverUrl = saved;
			}
		}

		// Если обложка была загружена до ввода названия — привязываем её
		if (this.items[idx]._pendingCover && newRaw.trim()) {
			CoverStore.set(newRaw, this.items[idx]._pendingCover);
			this.items[idx].coverUrl = this.items[idx]._pendingCover;
			delete this.items[idx]._pendingCover;
		}

		// Если у названия уже есть сохранённая обложка — подхватываем
		const existing = CoverStore.get(newRaw);
		if (existing) {
			this.items[idx].coverUrl = existing;
		}

		this.items[idx].title = title;
		this.items[idx].author = author;
		this.items[idx].raw = newRaw;

		this._updateCoverPreview(idx);
	},

	_updateCoverPreview(idx) {
		const el = this.root.querySelector(`.row-cover-preview[data-idx="${idx}"]`);
		if (!el) return;
		const item = this.items[idx];
		const cover = item.coverUrl || item._pendingCover || "";
		if (cover) {
			el.innerHTML = `<img src="${cover}" alt="">`;
			el.classList.add("has-cover");
		} else {
			el.innerHTML = "<span>+</span>";
			el.classList.remove("has-cover");
		}
	},

	pickCover(idx) {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "image/*";
		input.onchange = (e) => {
			const file = e.target.files[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = () => {
				const dataUrl = reader.result;
				this.items[idx].coverUrl = dataUrl;

				// Сохраняем только если есть «сырое» название
				const key = (this.items[idx].raw || "").trim();
				if (key) {
					CoverStore.set(key, dataUrl);
				} else {
					// Помечаем, что обложка ждёт привязки к названию
					this.items[idx]._pendingCover = dataUrl;
				}

				this._updateCoverPreview(idx);
			};
			reader.readAsDataURL(file);
		};
		input.click();
	},

	getValidItems() {
		return this.items
			.filter((it) => it.raw && it.raw.trim().length > 0)
			.map((it) => ({
				raw: it.raw,
				title: it.title,
				author: it.author,
				coverUrl: it.coverUrl || it._pendingCover || "",
			}));
	},

	render() {
		if (!this.root) return;
		let html = '<div class="book-list">';

		this.items.forEach((item, idx) => {
			const coverInner = item.coverUrl
				? `<img src="${item.coverUrl}" alt="">`
				: `<span>+</span>`;
			html += `
				<div class="book-row">
					<div class="row-cover-preview ${item.coverUrl ? "has-cover" : ""}"
						 data-idx="${idx}"
						 onclick="BookList.pickCover(${idx})"
						 title="Загрузить обложку">
						${coverInner}
					</div>
					<input type="text"
						   value="${Utils.escapeHtml(item.raw || "")}"
						   placeholder="Автор - Название книги"
						   oninput="BookList.updateTitle(${idx}, this.value)">
					<button class="row-remove-btn"
							onclick="BookList.removeRow(${idx})"
							title="Удалить строку">×</button>
				</div>
			`;
		});

		html += "</div>";
		html += `<button class="add-row-btn" onclick="BookList.addRow()" style="width:100%;margin-top:8px;margin-bottom:20px;">+ Добавить книгу</button>`;
		this.root.innerHTML = html;
	},
};
