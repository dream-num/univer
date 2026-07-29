# @univerjs/docs-find-replace

```bash
pnpm add @univerjs/docs-find-replace
```

```ts
import { UniverDocsFindReplacePlugin } from '@univerjs/docs-find-replace';

univer.registerPlugin(UniverDocsFindReplacePlugin);
```

Phase one searches and replaces literal text in the current document body, including tables. It excludes headers, footers, comments, drawings, regular expressions, formatting search, special characters, result sidebars, presets, and Facade APIs.
