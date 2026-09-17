# @univerjs/docs-toc

`@univerjs/docs-toc` provides table-of-contents insertion, update, deletion, and FIELD-range lookup for Univer Docs.

## Installation

```sh
pnpm add @univerjs/docs-toc
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { UniverDocsTocPlugin } from '@univerjs/docs-toc';

univer.registerPlugin(UniverDocsTocPlugin);
```

Use this package with `@univerjs/docs-toc-ui` when users need Ribbon, context-menu, dialog, and active-range feedback.

The updater currently evaluates outline-based TOC instructions (`\\o`). Other Word TOC switches are retained in FIELD metadata but are not all evaluated.

## Resources

- [Documentation](https://docs.univer.ai)
- [GitHub repository](https://github.com/dream-num/univer)
