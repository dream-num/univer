# @univerjs/sheets-table

[![npm version](https://img.shields.io/npm/v/@univerjs/sheets-table?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-table)
[![license](https://img.shields.io/npm/l/@univerjs/sheets-table?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-table)
[![downloads](https://img.shields.io/npm/dm/@univerjs/sheets-table?style=flat-square)](https://npmjs.com/package/@univerjs/sheets-table)

`@univerjs/sheets-table` adds the core table model and commands for binding structured table data in Univer Sheets.

## Package Overview

| Package | UMD global | CSS | Locales | Facade entry |
| --- | --- | :---: | :---: | :---: |
| `@univerjs/sheets-table` | `UniverSheetsTable` | No | Yes | Yes |

## Installation

```sh
pnpm add @univerjs/sheets-table
# or
npm install @univerjs/sheets-table
```

Keep all `@univerjs/*` packages on the same version.

## Usage

```ts
import { LocaleType, mergeLocales, Univer } from '@univerjs/core';
import { UniverSheetsTablePlugin } from '@univerjs/sheets-table';
import EnUS from '@univerjs/sheets-table/locale/en-US';

const univer = new Univer({
    locale: LocaleType.EN_US,
    locales: {
        [LocaleType.EN_US]: mergeLocales(EnUS),
    },
});

univer.registerPlugin(UniverSheetsTablePlugin);
```

## Integration Notes

Use this package with `@univerjs/sheets-table-ui` when users need table controls in the sheet UI.

## Resources

- [Documentation](https://docs.univer.ai)
- [NPM package](https://npmjs.com/package/@univerjs/sheets-table)
- [GitHub repository](https://github.com/dream-num/univer)

## Table differential formats

Imported XLSX table themes and direct differential formats are separate. Table themes remain in the existing range-theme resource; direct formats remain in Table and TableColumn metadata. This support requires the matching Sheets and Sheets Numfmt implementations and a matching Office native importer/exporter. No new resource version field, column `style` mapping, Facade method or style editor is introduced.

| Location | Format keys |
| --- | --- |
| `table.meta._xlsx.options` | `dataDxfStyle`, `headerRowDxfStyle`, `totalsRowDxfStyle`, `tableBorderDxfStyle`, `headerRowBorderDxfStyle`, `totalsRowBorderDxfStyle` |
| `column.meta._xlsx` | `dataDxfStyle`, `headerRowDxfStyle`, `totalsRowDxfStyle` |

Each format contains supported `IStyleData` properties. Fields beginning with an underscore preserve exchange information and are not rendered. The runtime applies the matching table region, then the matching column region by property, on top of the table theme. Explicit cell formats retain precedence; existing conditional-format processing remains separate. Border attributes are projected onto the current region boundary. Inside-horizontal and inside-vertical OOXML borders are not represented by the current frontend border model.

The Sheets package exports its existing `RangeThemeInterceptorId`; table direct formats use the same identifier so reads that explicitly exclude inherited range formatting also exclude these formats. `InterceptCellContentPriority.TABLE_STYLE` places the metadata resolver before number formatting.

Sheets Table writes matching direct formats to the existing runtime `themeStyle`; the theme and number-format interceptors consume that value according to their existing interceptor order without adding JSON or snapshot fields. Without a matching dxf, theme assignment and number-format lookup retain their previous behavior. The dxf number-format fallback is enabled only when the current high-priority Table interceptor has supplied `themeStyle.n`.

Formats follow the current table range and column identities, including inserted rows and table moves. For tables with dxf metadata, table and column metadata are retained when copying worksheets and undoing table deletion, and column shifts preserve column objects. Tables without dxf continue to use their original structural and restoration paths. An imported table that has direct formats but originally no theme does not receive the default table theme. Ordinary default-theme behavior for other tables is unchanged. Direct formats are import-only: no UI, Facade setter or dedicated editing command is provided.

For internal creation and restoration, `AddSheetTableMutation` accepts optional `meta`; `TableManager.addTable` and `SheetTableService.addTable` accept the same metadata as an optional final argument. Metadata is installed before the table-added event. Existing calls remain valid and do not add empty table metadata when the argument is omitted. The manager restores supplied column metadata only for tables with dxf; ordinary column initialization retains its previous behavior.

The matching exporter treats an existing metadata container as authoritative: deleting a dxf key clears that direct format instead of reviving a stale native field or raw XML attribute. If the container is absent, legacy native fields remain readable. Raw dxf XML matching the current supported properties is retained; edits use the supported encoder and may lose unsupported extensions. These export consistency rules do not expose frontend dxf editing; mutating a metadata object directly is not a supported undoable formatting operation.

New importers no longer materialize direct table formats into cell styles or use the old empty `rust-direct-dxf-*` theme. Older runtimes do not dynamically consume the new import result even if they save its metadata. Older bindings do not guarantee the new metadata edit/clear semantics. Upgrade the runtime and native exchange components together. Historical materialized snapshots are not automatically rewritten; re-import the original XLSX when possible. Published package combinations and Excel rendering require separate consumer validation.
