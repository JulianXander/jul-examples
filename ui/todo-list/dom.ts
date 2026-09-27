type Listener = (sender: any, event: string) => void;
const listeners: Listener[] = [];
(globalThis as any).emit =(sender: any, event: string) => {
  listeners.forEach(listener => {
    listener(sender, event);
  });
}

export function subscribeEvent(listener: Listener) {
  listeners.push(listener);
}

export function removeElement(element: any) {
  document.body.removeChild(element);
}

export function addHtml(html: string) {
  document.body.insertAdjacentHTML('beforeend', html);
}