/**
 * Универсальное модальное окно:
 *  - Dialog.confirm({ title, message, confirmText, cancelText }) → Promise<boolean>
 *  - Dialog.alert({ title, message, okText }) → Promise<void>
 */
const Dialog = {
	_resolve: null,

	_init() {
		const modal = document.getElementById("dialog-modal");
		if (!modal) return;
		// Закрытие по Escape
		document.addEventListener("keydown", (e) => {
			if (e.key === "Escape" && modal.classList.contains("show")) {
				this._finish(false);
			}
		});
	},

	_finish(result) {
		const modal = document.getElementById("dialog-modal");
		modal.classList.remove("show");
		if (this._resolve) {
			const r = this._resolve;
			this._resolve = null;
			r(result);
		}
	},

	close(event) {
		// Клик по фону или крестику — отмена
		this._finish(false);
	},

	confirm({
		title = "Подтверждение",
		message = "",
		confirmText = "ОК",
		cancelText = "Отмена",
	}) {
		return new Promise((resolve) => {
			this._resolve = resolve;

			document.getElementById("dialog-title").textContent = title;
			document.getElementById("dialog-message").textContent = message;

			const actions = document.getElementById("dialog-actions");
			actions.innerHTML = `
				<button class="btn-sub danger" id="dialog-confirm">${Utils.escapeHtml(confirmText)}</button>
				<button class="btn-sub" id="dialog-cancel">${Utils.escapeHtml(cancelText)}</button>
			`;
			document.getElementById("dialog-confirm").onclick = () =>
				this._finish(true);
			document.getElementById("dialog-cancel").onclick = () =>
				this._finish(false);

			document.getElementById("dialog-modal").classList.add("show");
		});
	},

	alert({ title = "Готово", message = "", okText = "OK" }) {
		return new Promise((resolve) => {
			this._resolve = () => resolve();

			document.getElementById("dialog-title").textContent = title;
			document.getElementById("dialog-message").textContent = message;

			const actions = document.getElementById("dialog-actions");
			actions.innerHTML = `
				<button class="btn-sub primary" id="dialog-ok">${Utils.escapeHtml(okText)}</button>
			`;
			document.getElementById("dialog-ok").onclick = () => this._finish(true);

			document.getElementById("dialog-modal").classList.add("show");
		});
	},
};

document.addEventListener("DOMContentLoaded", () => Dialog._init());
