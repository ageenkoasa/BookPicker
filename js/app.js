/**
 * Координатор приложения.
 * Связывает компоненты и управляет переключением секций.
 */
const App = {
	init() {
		BookList.init(document.getElementById("book-list-root"));
		Deck.init(document.getElementById("cards-grid"));
		Deck.onCardOpen = (card) => BookModal.open(card);
	},

	buildDeck() {
		const valid = BookList.getValidItems();
		if (valid.length === 0) {
			Dialog.alert({
				title: "Пустая колода",
				message: "Введите хотя бы одну книгу, чтобы сформировать колоду.",
				okText: "Хорошо",
			});
			return;
		}
		Deck.build(valid);
		this._show("layout-section");
	},

	backToInput() {
		this._show("input-section");
	},

	reshuffleDeck() {
		const valid = BookList.getValidItems();
		if (valid.length === 0) return;
		Deck.build(valid);
	},

	toggleCabinet() {
		const cab = document.getElementById("cabinet-section");
		if (cab.style.display === "block") {
			// Закрываем кабинет — возвращаемся к тому, что было видно
			const layout = document.getElementById("layout-section");
			cab.style.display = "none";
			if (layout.style.display === "block") {
				layout.style.display = "block";
			} else {
				document.getElementById("input-section").style.display = "block";
			}
		} else {
			Cabinet.render();
			this._show("cabinet-section");
		}
	},

	_show(sectionId) {
		["input-section", "layout-section", "cabinet-section"].forEach((id) => {
			document.getElementById(id).style.display =
				id === sectionId ? "block" : "none";
		});
		window.scrollTo({ top: 0, behavior: "smooth" });
	},
};

// Запуск
document.addEventListener("DOMContentLoaded", () => App.init());
