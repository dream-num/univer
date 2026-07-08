import type { Plugin, PluginCtor } from '@univerjs/core';
import { UniverActionRecorderPlugin } from '@univerjs/action-recorder';
import { UniverInstanceType } from '@univerjs/core';
import { UniverDebuggerPlugin } from '@univerjs/debugger';
import { loadDebuggerLocale } from '@univerjs/mockdata';
import { UniverSheetsCrosshairHighlightPlugin } from '@univerjs/sheets-crosshair-highlight';
import { UniverSheetsFindReplacePlugin } from '@univerjs/sheets-find-replace';
import { UniverSheetsHyperLinkUIPlugin } from '@univerjs/sheets-hyper-link-ui';
import { UniverSheetsSortUIPlugin } from '@univerjs/sheets-sort-ui';
import { UniverWatermarkPlugin } from '@univerjs/watermark';

/* eslint-disable-next-line node/prefer-global/process */
const IS_E2E: boolean = !!process.env.IS_E2E;

export default function getVeryLazyPlugins() {
    const plugins: Array<[PluginCtor<Plugin>] | [PluginCtor<Plugin>, unknown]> = [

        [UniverActionRecorderPlugin],
        [UniverSheetsHyperLinkUIPlugin],
        [UniverSheetsSortUIPlugin],
        [UniverSheetsCrosshairHighlightPlugin],
        [UniverSheetsFindReplacePlugin],
        [UniverWatermarkPlugin],
    ];

    if (!IS_E2E) {
        plugins.push([UniverDebuggerPlugin, {
            fabEntryUnitType: UniverInstanceType.UNIVER_SHEET,
            localeLoader: loadDebuggerLocale,
        }]);
    }

    return plugins;
}
