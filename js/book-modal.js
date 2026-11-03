/**
 * Модальное окно с аннотацией, выбором книги и загрузкой обложки.
 */
const BookModal = {
	currentCard: null,

	open(card) {
		this.currentCard = card;
		const modal = document.getElementById("book-modal");
		document.getElementById("modal-title").textContent = card.title;
		document.getElementById("modal-author").textContent =
			card.author || "Автор не указан";

		const descEl = document.getElementById("modal-description");
		if (!card.loaded) {
			descEl.innerHTML =
				'<div style="display:flex;align-items:center;gap:10px;"><div class="loader"></div> Магия ищет аннотацию...</div>';
		} else {
			descEl.textContent = card.description;
		}

		const imgEl = document.getElementById("modal-img");
		const coverBox = document.getElementById("modal-cover-box");
		const cover = card.userCoverUrl || card.coverUrl;
		if (cover) {
			imgEl.src = cover;
			imgEl.style.display = "block";
			coverBox.style.display = "flex";
		} else {
			imgEl.style.display = "none";
			coverBox.style.display = "none";
		}

		modal.classList.add("show");
	},

	close(event) {
		document.getElementById("book-modal").classList.remove("show");
		this.currentCard = null;
	},

	selectCurrent() {
		if (!this.currentCard) return;
		const title = this.currentCard.title || this.currentCard.raw;

		if (SelectedStore.add(title)) {
			Dialog.alert({
				title: "Книга сохранена",
				message: `«${title}» добавлена в личный кабинет.`,
				okText: "Отлично",
			});
		} else {
			Dialog.alert({
				title: "Уже на полке",
				message: `«${title}» уже есть в личном кабинете.`,
				okText: "Понятно",
			});
		}
	},

	triggerCoverUpload() {
		document.getElementById("modal-cover-input").click();
	},

	handleCoverUpload(event) {
		const file = event.target.files[0];
		if (!file || !this.currentCard) return;

		const reader = new FileReader();
		reader.onload = () => {
			const dataUrl = reader.result;
			const card = this.currentCard;
			card.userCoverUrl = dataUrl;

			if (card.raw) CoverStore.set(card.raw, dataUrl);

			const frontEl = document.getElementById(`front-${card.id}`);
			if (frontEl) {
				frontEl.innerHTML = `<img src="${dataUrl}" class="book-cover" style="display:block;" alt="${Utils.escapeHtml(card.title)}">`;
			}

			const imgEl = document.getElementById("modal-img");
			const coverBox = document.getElementById("modal-cover-box");
			imgEl.src = dataUrl;
			imgEl.style.display = "block";
			coverBox.style.display = "flex";

			event.target.value = "";
		};
		reader.readAsDataURL(file);
	},
};
