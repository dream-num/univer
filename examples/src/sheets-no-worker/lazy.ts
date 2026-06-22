import type { Plugin, PluginCtor } from '@univerjs/core';
import { UniverDocsMentionUIPlugin } from '@univerjs/docs-mention-ui';
import { UniverSheetsConditionalFormattingUIPlugin } from '@univerjs/sheets-conditional-formatting-ui';
import { UniverSheetsDataValidationUIPlugin } from '@univerjs/sheets-data-validation-ui';
import { UniverSheetsDrawingUIPlugin } from '@univerjs/sheets-drawing-ui';
import { UniverSheetsFilterUIPlugin } from '@univerjs/sheets-filter-ui';
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui';
import { UniverSheetsNoteUIPlugin } from '@univerjs/sheets-note-ui';
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui';
import { UniverSheetsTableUIPlugin } from '@univerjs/sheets-table-ui';
import { UniverSheetsThreadCommentUIPlugin } from '@univerjs/sheets-thread-comment-ui';
import { UniverThreadCommentUIPlugin } from '@univerjs/thread-comment-ui';

export default function getLazyPlugins(): Array<[PluginCtor<Plugin>] | [PluginCtor<Plugin>, unknown]> {
    return [
        [UniverDocsMentionUIPlugin],
        [UniverSheetsNumfmtUIPlugin],
        [UniverThreadCommentUIPlugin],
        [UniverSheetsThreadCommentUIPlugin],
        [UniverSheetsNoteUIPlugin],
        [UniverSheetsTableUIPlugin],
        [UniverSheetsFormulaUIPlugin],
        [UniverSheetsDataValidationUIPlugin],
        [UniverSheetsConditionalFormattingUIPlugin],
        [UniverSheetsFilterUIPlugin, { useRemoteFilterValuesGenerator: false }],
        [UniverSheetsDrawingUIPlugin],
    ];
}
