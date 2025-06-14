export function addMessage(message: string) {
	const element = document.createElement('div');
	element.innerText = message;
	document.body.appendChild(element);
	if (document.body.children.length > 21) {
		document.body.removeChild(document.body.children[1]);
	}
}