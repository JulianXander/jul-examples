interface TextStream {
	subscribe(listener: (value: string) => void): () => void;
}

export function onClick(id: string, listener: () => void) {
	document.getElementById(id)!.addEventListener('click', () => {
		listener();
	});
}

export function setText(id: string, text: string) {
	document.getElementById(id)!.textContent = text;
}

// Hängt das HTML (ein <dialog>-Element) an den body an und öffnet es modal.
// texts ordnet jedem Wert von data-text im HTML einen Text oder Text-Stream zu. Der Text
// wird per textContent eingesetzt, also nie als HTML geparst, und bei einem Stream mit
// jedem neuen Wert aktualisiert, bis der Dialog geschlossen ist.
// Beim Schließen wird onClose mit dem value des auslösenden Buttons aufgerufen
// (bei Escape mit '') und das Element wieder entfernt.
export function showDialog(
	html: string,
	texts: Record<string, string | TextStream>,
	onClose: (returnValue: string) => void,
) {
	document.body.insertAdjacentHTML('beforeend', html);
	const dialog = document.body.lastElementChild as HTMLDialogElement;
	const unsubscribes: (() => void)[] = [];
	for (const [name, text] of Object.entries(texts)) {
		const element = dialog.querySelector(`[data-text="${name}"]`)!;
		if (typeof text === 'string') {
			element.textContent = text;
		}
		else {
			unsubscribes.push(text.subscribe(value => {
				element.textContent = value;
			}));
		}
	}
	dialog.addEventListener('close', () => {
		unsubscribes.forEach(unsubscribe => {
			unsubscribe();
		});
		onClose(dialog.returnValue);
		dialog.remove();
	}, { once: true });
	dialog.showModal();
}
