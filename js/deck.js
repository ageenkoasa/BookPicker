/**
 * Компонент колоды карт.
 * Автоподгрузка обложки и аннотации из Open Library — только если нет пользовательской обложки.
 */
const Deck = {
	root: null,
	books: [],
	onCardOpen: null,

	init(rootEl) {
		this.root = rootEl;
	},

	build(bookList) {
		const shuffled = Utils.shuffle(bookList);
		this.books = shuffled.map((b, idx) => ({
			id: idx,
			raw: b.raw,
			title: b.title,
			author: b.author,
			flipped: false,
			loaded: false,
			coverUrl: "",
			userCoverUrl: CoverStore.get(b.raw) || b.coverUrl || "",
			description: "",
		}));
		this.render();
	},

	render() {
		if (!this.root) return;
		this.root.innerHTML = "";

		this.books.forEach((card, idx) => {
			const container = document.createElement("div");
			container.className = "card-container";
			container.onclick = () => this.flip(idx);

			const coverInner = card.userCoverUrl
				? `<img src="${card.userCoverUrl}" class="book-cover" style="display:block;" alt="${Utils.escapeHtml(card.title)}">`
				: `<div class="book-fallback">
						<div class="book-title">${Utils.escapeHtml(card.title)}</div>
						${card.author ? `<div class="book-author">${Utils.escapeHtml(card.author)}</div>` : ""}
				   </div>`;

			container.innerHTML = `
				<div class="card" id="card-${idx}">
					<div class="card-face card-back">
						<div class="card-back-design">
							<div class="card-number">${idx + 1}</div>
							<div class="card-back-ornament">✧</div>
						</div>
					</div>
					<div class="card-face card-front" id="front-${idx}">
						${coverInner}
					</div>
				</div>
			`;
			this.root.appendChild(container);
		});
	},

	flip(idx) {
		const card = this.books[idx];
		const el = document.getElementById(`card-${idx}`);

		if (card.flipped) {
			if (this.onCardOpen) this.onCardOpen(card);
			return;
		}

		Sound.playCard();
		card.flipped = true;
		el.classList.add("flipped");
		this._fetchBookData(card, idx);
	},

	async _fetchBookData(card, idx) {
		if (card.loaded) return;

		const frontEl = document.getElementById(`front-${idx}`);
		const query = encodeURIComponent(card.raw + " language:rus");
		const fields =
			"key,title,author_name,cover_i,editions.key,editions.description,editions.language";

		try {
			const response = await fetch(
				`https://openlibrary.org/search.json?q=${query}&fields=${fields}&limit=1`,
			);
			if (!response.ok) throw new Error();
			const data = await response.json();

			if (data.docs && data.docs.length > 0) {
				const doc = data.docs[0];

				if (doc.title) card.title = doc.title;
				if (doc.author_name && doc.author_name.length > 0)
					card.author = doc.author_name.join(", ");

				// Обложка из Open Library — только если нет пользовательской
				if (doc.cover_i && !card.userCoverUrl) {
					card.coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
					frontEl.innerHTML = `<img src="${card.coverUrl}" class="book-cover" style="display:block;" alt="${Utils.escapeHtml(card.title)}">`;
				}

				// Аннотация
				if (doc.key) {
					const workRes = await fetch(`https://openlibrary.org${doc.key}.json`);
					if (workRes.ok) {
						const workData = await workRes.json();
						if (workData.description) {
							const raw =
								typeof workData.description === "string"
									? workData.description
									: workData.description.value;
							if (raw)
								card.description = await Translator.translateToRussian(raw);
						}
					}
				}
			}
		} catch (e) {
			console.error("Ошибка сети/API:", e);
		}

		if (!card.description) {
			card.description =
				"Официальное описание на Open Library для данного издания временно отсутствует.\n\nВы можете открыть эту книгу в вашей домашней библиотеке или заглянуть в любимый поисковик за подробностями.";
		}

		card.loaded = true;
	},
};
