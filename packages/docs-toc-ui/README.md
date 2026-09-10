# @univerjs/docs-toc-ui

`@univerjs/docs-toc-ui` adds Ribbon, context-menu, update dialog, and active-range feedback for `@univerjs/docs-toc`.

## Installation

```sh
pnpm add @univerjs/docs-toc-ui
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import '@univerjs/docs-toc-ui/lib/index.css';
import EnUS from '@univerjs/docs-toc-ui/locale/en-US';
import { UniverDocsTocUIPlugin } from '@univerjs/docs-toc-ui';

univer.registerPlugin(UniverDocsTocUIPlugin);

// Merge EnUS into your Univer locale map when this package contributes UI text.
```

Register this package after Docs, Docs UI, Render Engine, and Docs TOC core packages.

## Resources

- [Documentation](https://docs.univer.ai)
- [GitHub repository](https://github.com/dream-num/univer)
