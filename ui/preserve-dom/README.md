Probleme verursacht durch komplettes ersetzen des HTML:
1. Zustand der UI verloren geht, z.B. Focus, input.value
2. Rendering performance wird verschwendet

Stattdessen besser nur minimale DOM-Änderungen vornehmen.

TODO: ?HTML element wrapper in jul mit Stream für style, innerText etc, create und destroy
