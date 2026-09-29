export function elementById(id: string): Element {
	return document.getElementById(id)!;
}

export function subscribeEvent(
	element: HTMLElement,
	event: string,
	listener: () => void,
): void {
	element.addEventListener(event, listener);
}

export function setText(
	element: Element,
	text: string,
): void {
	element.textContent = text;
}

export function setEnabled(
	element: HTMLButtonElement,
	enabled: boolean,
): void {
	element.disabled = !enabled;
}