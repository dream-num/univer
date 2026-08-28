# @univerjs/docs-find-replace

```bash
pnpm add @univerjs/docs-find-replace @univerjs/find-replace
```

```ts
import { LocaleType, mergeLocales, Univer } from '@univerjs/core';
import { UniverDocsFindReplacePlugin } from '@univerjs/docs-find-replace';
import { UniverFindReplacePlugin } from '@univerjs/find-replace';
import FindReplaceEnUS from '@univerjs/find-replace/locale/en-US';
import '@univerjs/find-replace/lib/index.css';

const univer = new Univer({
    locale: LocaleType.EN_US,
    locales: {
        [LocaleType.EN_US]: mergeLocales(FindReplaceEnUS),
    },
});

univer.registerPlugin(UniverFindReplacePlugin);
univer.registerPlugin(UniverDocsFindReplacePlugin);
```

Register the shared find-and-replace plugin before the Docs adapter so it can provide the common UI, locale strings, and services. Configure the rest of the Docs plugin stack before adding these two plugins.

Phase one searches and replaces literal text in the current document body, including tables. It excludes headers, footers, comments, drawings, regular expressions, formatting search, special characters, result sidebars, presets, and Facade APIs.
