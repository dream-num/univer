# @univerjs/docs-toc

[![npm version](https://img.shields.io/npm/v/@univerjs/docs-toc?style=flat-square)](https://npmjs.com/package/@univerjs/docs-toc)
[![license](https://img.shields.io/npm/l/@univerjs/docs-toc?style=flat-square)](https://npmjs.com/package/@univerjs/docs-toc)
[![downloads](https://img.shields.io/npm/dm/@univerjs/docs-toc?style=flat-square)](https://npmjs.com/package/@univerjs/docs-toc)

`@univerjs/docs-toc` provides table-of-contents insertion, update, deletion, and FIELD-range lookup for Univer Docs.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry | Worker entry |
| --- | --- | :---: | :---: | :---: | :---: |
| `@univerjs/docs-toc` | `UniverDocsToc` | No | No | No | No |

## Installation

```sh
pnpm add @univerjs/docs-toc
# or
npm install @univerjs/docs-toc
```

## Usage

Start with the [integration setup](https://docs.univer.ai/) for your document type, including its required plugins, styles, and locale resources. The snippet below assumes that setup is complete.

```ts
import { UniverDocsTocPlugin } from '@univerjs/docs-toc';

univer.registerPlugin(UniverDocsTocPlugin);
```

Use this package with `@univerjs/docs-toc-ui` when users need Ribbon, context-menu, dialog, and active-range feedback.

The updater currently evaluates outline-based TOC instructions (`\\o`). Other Word TOC switches are retained in FIELD metadata but are not all evaluated.

Heading discovery resolves named paragraph styles and uses paragraph IDs when an internal heading ID is absent. An explicit body outline level excludes a paragraph. These queries retain the imported snapshot unchanged.

The body builder also accepts supplied heading or caption entries with local `textRuns`, printed page labels such as `iv`, and an explicit pageless mode. Reference providers can reuse its rich paragraphs, bookmark links and nested page fields without duplicating directory rendering.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/docs-toc)
- [GitHub repository](https://github.com/dream-num/univer)
