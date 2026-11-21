# Unreleased changes

## Breaking TypeScript change in document numbering

In `@univerjs/core`, `IParagraph.bullet` changed from `IBullet | undefined` in v1.5.2 to `Partial<IBullet> | null | undefined`. A paragraph can override just its nesting level and inherit the list from its named style. Omitting `bullet` inherits numbering, while setting it to `null` explicitly turns numbering off. Existing snapshots with complete bullets remain valid.

To read the effective list type, ID or nesting level, pass the document snapshot and paragraph to the public resolver. It returns a complete `IBullet` for a numbered paragraph and `undefined` otherwise.

```ts
import type { IDocumentData, IParagraph } from '@univerjs/core';
import { resolveDocumentParagraphBullet } from '@univerjs/core';

function isNestedListItem(document: IDocumentData, paragraph: IParagraph): boolean {
    const bullet = resolveDocumentParagraphBullet(document, paragraph);
    return bullet !== undefined && bullet.nestingLevel > 0;
}
```

Use `paragraph.bullet` when editing authored overrides. The `sourceBullet` field records the imported numbering and can differ from the current list after an edit.
