import { RenderEngine } from '@univerjs/base-render';
import { SheetPlugin } from '@univerjs/base-sheets';
import { DEFAULT_WORKBOOK_DATA_DEMO } from '@univerjs/common-plugin-data';
import { Univer, UniverSheet } from '@univerjs/core';
import { SheetUIPlugin } from '@univerjs/ui-plugin-sheets';

// univer
const univer = new Univer();

// base-render
univer.install(new RenderEngine());

// universheet instance
const universheet = UniverSheet.newInstance(DEFAULT_WORKBOOK_DATA_DEMO);
univer.addUniverSheet(universheet);

// base-sheet
universheet.installPlugin(
    new SheetPlugin({
        selections: {
            'sheet-0001': [
                {
                    selection: {
                        startRow: 2,
                        endRow: 2,
                        startColumn: 3,
                        endColumn: 3,
                    },
                    cell: {
                        row: 2,
                        column: 3,
                    },
                },
            ],
        },
    })
);

// base-slides init CanvasView
univer.install(
    new SheetUIPlugin({
        container: 'universheet',
    })
);
