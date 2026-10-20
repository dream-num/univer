# @univerjs/docs

[![npm version](https://img.shields.io/npm/v/@univerjs/docs?style=flat-square)](https://npmjs.com/package/@univerjs/docs)
[![license](https://img.shields.io/npm/l/@univerjs/docs?style=flat-square)](https://npmjs.com/package/@univerjs/docs)
[![downloads](https://img.shields.io/npm/dm/@univerjs/docs?style=flat-square)](https://npmjs.com/package/@univerjs/docs)

`@univerjs/docs` provides the document data model and core rich-text operations for Univer Docs, independent of the UI layer.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/docs` | `UniverDocs` | No | No | Yes |

## Installation

```sh
pnpm add @univerjs/docs
# or
npm install @univerjs/docs
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { UniverDocsPlugin } from '@univerjs/docs';

univer.registerPlugin(UniverDocsPlugin);
```

## Heading collapse in Modern documents

Modern documents (`DocumentFlavor.MODERN`) support collapsing Heading 1 through Heading 5.
The heading stays visible; its section extends to the next heading of the same or a higher
level, or the end of its content flow. Each table cell and Modern column has its own heading
hierarchy. Expanding a parent preserves the collapse flags of its nested headings.
Traditional documents ignore these flags.

`IParagraph.headingCollapsed` is an optional boolean in the document snapshot. Only `true`
collapses a heading; `false` or an omitted flag leaves it expanded. Collapsing changes layout
visibility without deleting the section's text, tables, images, or other snapshot content.
Saving and reopening a Univer snapshot retains the flag. This contract does not establish
preservation through Office import or export.

### Change collapse state with a command

`UniverDocsPlugin` registers `SetHeadingCollapsedCommand` (`doc.command.set-heading-collapsed`).
After registering the plugin and creating the document, execute the registered command through
the Facade API or `ICommandService`; do not call its handler or mutate the model directly.
For an existing `univerAPI` instance:

```ts
import { SetHeadingCollapsedCommand } from '@univerjs/docs';

const changed = await univerAPI.executeCommand(SetHeadingCollapsedCommand.id, {
    unitId: documentId,
    paragraphId: headingParagraphId,
    collapsed: true,
});
```

Pass the document's unit ID, the heading's stable paragraph ID, and the desired boolean state.
Use `collapsed: false` to expand. The command returns `false` for a no-op or an invalid target,
including Traditional or disabled documents, headings hidden by an ancestor, empty sections
when collapsing, and targets without edit permission.

Collapse state is shared document state, not a personal view preference. The command uses the
rich-text mutation path for undo/redo and collaboration. A selection hidden by a collapse moves
to the visible heading. Worker layout uses the same flags after edits, undo/redo, and snapshot
recovery; visibility changes rebuild the affected layout and retain the published viewport until
replacement content is ready. Hidden tables and images are omitted from layout publications,
while their source data remains in the snapshot.

See [the editor interaction details](../docs-ui/README.md#heading-collapse) for the Canvas control.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/docs)
- [GitHub repository](https://github.com/dream-num/univer)
