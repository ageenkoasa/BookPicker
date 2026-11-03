/**
 * Обёртка над Chrome Translator API (en → ru).
 * При отсутствии поддержки возвращает исходный текст.
 */
const Translator = {
	async translateToRussian(text) {
		if (!("Translator" in self)) {
			console.warn("Translator API не поддерживается в текущем браузере");
			return text;
		}
		try {
			const availability = await Translator.availability({
				sourceLanguage: "en",
				targetLanguage: "ru",
			});
			if (availability === "no") return text;

			const tr = await Translator.create({
				sourceLanguage: "en",
				targetLanguage: "ru",
			});
			return await tr.translate(text);
		} catch (e) {
			console.error("Ошибка перевода:", e);
			return text;
		}
	},
};
