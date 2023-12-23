const listeners: ((sender, event: string) => void)[] = [];
globalThis.emit = (sender, event: string) => {
  listeners.forEach(listener => {
    listener(sender, event);
  });
}

export function subscribeEvent(listener: (sender, event: string) => void) {
  listeners.push(listener);
}

export function removeElement(element) {
  document.body.removeChild(element);
}

export function addHtml(html: string) {
  document.body.insertAdjacentHTML('beforeend', html);
}