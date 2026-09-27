export function elementById(id: string): Element {
	return document.getElementById(id)!;
}

export function findElement(parent: Element, selector: string): Element {
	return parent.querySelector(selector)!;
}

/**
 * Hängt das HTML ans Ende des body an und liefert dessen letztes Element.
 */
export function appendHtml(html: string): Element {
	document.body.insertAdjacentHTML('beforeend', html);
	return document.body.lastElementChild!;
}

export function removeElement(element: Element) {
	element.remove();
}

/**
 * Setzt den Text per textContent, er wird also nie als HTML geparst.
 */
export function setText(element: Element, text: string) {
	element.textContent = text;
}

export function onClick(element: Element, listener: () => void) {
	element.addEventListener('click', () => {
		listener();
	});
}

export function showModal(dialog: HTMLDialogElement) {
	dialog.showModal();
}

/**
 * Ruft listener einmal beim Schließen auf, mit dem value des auslösenden Buttons,
 * bei Escape mit ''.
 */
export function onDialogClose(dialog: HTMLDialogElement, listener: (returnValue: string) => void) {
	dialog.addEventListener('close', () => {
		listener(dialog.returnValue);
	}, { once: true });
}
