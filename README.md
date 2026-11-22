# jul-examples

Lauffähige JUL-Projekte. Jeder Ordner mit einer `jul-config.yaml` ist ein eigenes Projekt und wird darin
gebaut:

```bash
node ../../jul-compiler/out/compiler/cli.js [check|test]
```

## Beispiele auf der Homepage

Ein Projekt erscheint unter „Beispiele“ auf der Homepage, wenn sein Ordner eine `README.md` mit
Frontmatter hat. Ohne Frontmatter bleibt es außen vor, wie diese Datei hier.

```markdown
---
category: Einstieg
files: fizz-buzz.jul
html: index.html
height: 16rem
---
# Titel

Beschreibung. Der erste Satz steht auch in der Übersicht.
```

- `category` (Pflicht): Abschnitt in Übersicht und Sidebar. Die Reihenfolge bekannter Kategorien
  legt `categoryOrder` im Skript fest, neue kommen danach.
- `files`: angezeigte Dateien, durch Komma getrennt. Ohne Angabe alle Quelldateien des Ordners
  (`.jul`, `.ts`, `.js`, `.yaml`, `.json`), die Einstiegsdatei zuerst, Testdateien zuletzt.
- `html`: nur bei Oberflächen, die Seite, die `out/bundle.js` lädt. Sie wird gebaut und im iframe
  eingebettet, der Code steht ohne Playground daneben.
- `height`: Höhe des iframes, Standard `12rem`.

Alle anderen Beispiele stehen als Playground auf der Seite, der Fehler und Testergebnisse selbst
anzeigt. Der Ordnername ist der Name der Seite und muss über alle Beispiele eindeutig sein.

Die Seiten erzeugt `jul-homepage/docs/scripts/generate-examples.mjs` nach
`jul-homepage/docs/docs/examples`, automatisch vor `npm start` und `npm run build` der Homepage oder
von Hand mit `npm run generate-examples`. Die erzeugten Dateien nicht von Hand ändern.
