import type { Plugin, PluginCtor } from '@univerjs/core';
import { UniverSheetsConditionalFormattingUIPlugin } from '@univerjs/sheets-conditional-formatting-ui';
import { UniverSheetsDataValidationUIPlugin } from '@univerjs/sheets-data-validation-ui';
import { UniverSheetsDrawingUIPlugin } from '@univerjs/sheets-drawing-ui';
import { UniverSheetsFilterUIPlugin } from '@univerjs/sheets-filter-ui';

export default function getLazyPlugins(): Array<[PluginCtor<Plugin>] | [PluginCtor<Plugin>, unknown]> {
    return [
        [UniverSheetsDataValidationUIPlugin],
        [UniverSheetsConditionalFormattingUIPlugin],
        [UniverSheetsFilterUIPlugin, { useRemoteFilterValuesGenerator: false }],
        [UniverSheetsDrawingUIPlugin],
    ];
}
