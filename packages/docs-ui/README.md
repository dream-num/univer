# @univerjs/docs-ui

[![npm version](https://img.shields.io/npm/v/@univerjs/docs-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-ui)
[![license](https://img.shields.io/npm/l/@univerjs/docs-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-ui)
[![downloads](https://img.shields.io/npm/dm/@univerjs/docs-ui?style=flat-square)](https://npmjs.com/package/@univerjs/docs-ui)

`@univerjs/docs-ui` provides the editor UI layer for Univer Docs, including selection rendering, clipboard support, menus, and document interaction services.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/docs-ui` | `UniverDocsUi` | Yes | Yes | Yes |

## Installation

```sh
pnpm add @univerjs/docs-ui
# or
npm install @univerjs/docs-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/docs-ui/lib/index.css';
import EnUS from '@univerjs/docs-ui/locale/en-US';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';

univer.registerPlugin(UniverDocsUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

## Format painter

Use the shared Start ribbon format painter to copy character formatting. Include a paragraph
mark in the source selection to also copy paragraph formatting and list formatting. Drag over
a target selection or click a word to apply. Text, paragraph identities, and embedded entities
are retained, and each application is undoable. The same text command serves embedded Shape
text editors. The source format is captured when the brush is activated.
The clear-formatting icon resets the selected text and paragraphs to default formatting,
retains their content and identities, and supports undo.

## Typing format at text boundaries

Backspace in ordinary document text retains the removed character's formatting for immediate
input. Forward Delete and Cut resolve formatting at the surviving caret. Replacing a text
selection uses its first character's format, regardless of selection direction. In table cells,
character-by-character Backspace resolves the surviving caret format; selection Backspace retains
the first selected character's format.

Retained typing format is transient and clears on explicit selection changes or document switches.
Formatting commands such as Bold update this input format without clearing it.
It is not serialized as an empty text run. Explicit `paragraphMarkTextStyle` remains authoritative
after repositioning or reopening; deletion does not overwrite this explicit paragraph style.
Modern paragraphs, including list items, retain their first character's formatting on the existing
paragraph-ending character when all text is deleted. This keeps empty-paragraph input and list
markers stable after editing elsewhere, undo/redo and reopening. Explicit list-marker and
paragraph-mark style overrides retain their precedence.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/docs-ui)
- [GitHub repository](https://github.com/dream-num/univer)
