export function elementById(id: string): Element {
	return document.getElementById(id)!;
}

/**
 * Setzt den Text per textContent, er wird also nie als HTML geparst.
 */
export function setText(element: Element, text: string): void {
	element.textContent = text;
}

export function setHidden(element: HTMLElement, hidden: boolean): void {
	element.hidden = hidden;
}

export function textValue(input: HTMLInputElement): string {
	return input.value;
}

/**
 * undefined, solange das Feld leer ist oder keine ganze Zahl enthält.
 */
export function integerValue(input: HTMLInputElement): bigint | undefined {
	const value = input.valueAsNumber;
	return Number.isInteger(value) ? BigInt(value) : undefined;
}

export function isChecked(input: HTMLInputElement): boolean {
	return input.checked;
}

/**
 * Ruft listener bei jeder Eingabe auf, auch beim Umschalten einer Checkbox.
 */
export function onInput(input: Element, listener: () => void): void {
	input.addEventListener('input', () => {
		listener();
	});
}
