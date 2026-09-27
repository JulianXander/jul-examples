export function elementById(id: string): Element {
	return document.getElementById(id)!;
}

/**
 * Setzt den Text per textContent, er wird also nie als HTML geparst.
 */
export function setText(element: Element, text: string) : void {
	element.textContent = text;
}

export function setHidden(element: Element, hidden: boolean) : void {
	(element as HTMLElement).hidden = hidden;
}

export function textValue(input: Element): string {
	return (input as HTMLInputElement).value;
}

/**
 * undefined, solange das Feld leer ist oder keine ganze Zahl enthält.
 */
export function integerValue(input: Element): bigint | undefined {
	const value = (input as HTMLInputElement).valueAsNumber;
	return Number.isInteger(value) ? BigInt(value) : undefined;
}

export function isChecked(input: Element): boolean {
	return (input as HTMLInputElement).checked;
}

/**
 * Ruft listener bei jeder Eingabe auf, auch beim Umschalten einer Checkbox.
 */
export function onInput(input: Element, listener: () => void): void {
	input.addEventListener('input', () => {
		listener();
	});
}
