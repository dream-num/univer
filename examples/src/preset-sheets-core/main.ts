import type { FUniver, Univer } from '@univerjs/presets';
import { UniverSheetsConditionalFormattingPreset } from '@univerjs/preset-sheets-conditional-formatting';
import UniverPresetSheetsConditionalFormattingZhCN from '@univerjs/preset-sheets-conditional-formatting/locales/zh-CN';
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import UniverPresetSheetsCoreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN';
import { UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation';
import UniverPresetSheetsDataValidationZhCN from '@univerjs/preset-sheets-data-validation/locales/zh-CN';
import { UniverSheetsDrawingPreset } from '@univerjs/preset-sheets-drawing';
import UniverPresetSheetsDrawingZhCN from '@univerjs/preset-sheets-drawing/locales/zh-CN';
import { UniverSheetsFilterPreset } from '@univerjs/preset-sheets-filter';
import UniverPresetSheetsFilterZhCN from '@univerjs/preset-sheets-filter/locales/zh-CN';
import { UniverSheetsFindReplacePreset } from '@univerjs/preset-sheets-find-replace';
import UniverPresetSheetsFindReplaceZhCN from '@univerjs/preset-sheets-find-replace/locales/zh-CN';
import { UniverSheetsHyperLinkPreset } from '@univerjs/preset-sheets-hyper-link';
import UniverPresetSheetsHyperLinkZhCN from '@univerjs/preset-sheets-hyper-link/locales/zh-CN';
import { UniverSheetsNotePreset } from '@univerjs/preset-sheets-note';
import UniverPresetSheetsNoteZhCN from '@univerjs/preset-sheets-note/locales/zh-CN';
import { UniverSheetsSortPreset } from '@univerjs/preset-sheets-sort';
import UniverPresetSheetsSortZhCN from '@univerjs/preset-sheets-sort/locales/zh-CN';
import { UniverSheetsTablePreset } from '@univerjs/preset-sheets-table';
import UniverPresetSheetsTableZhCN from '@univerjs/preset-sheets-table/locales/zh-CN';
import { UniverSheetsThreadCommentPreset } from '@univerjs/preset-sheets-thread-comment';
import UniverPresetSheetsThreadCommentZhCN from '@univerjs/preset-sheets-thread-comment/locales/zh-CN';
import { createUniver, defaultTheme, LocaleType, mergeLocales } from '@univerjs/presets';
import ImportCSVButtonPlugin from './custom-plugin/import-csv-button';
import '../global.css';

const { univer, univerAPI } = createUniver({
    locale: LocaleType.ZH_CN,
    locales: {
        zhCN: mergeLocales(
            UniverPresetSheetsCoreZhCN,
            UniverPresetSheetsDrawingZhCN,
            UniverPresetSheetsConditionalFormattingZhCN,
            UniverPresetSheetsDataValidationZhCN,
            UniverPresetSheetsFilterZhCN,
            UniverPresetSheetsFindReplaceZhCN,
            UniverPresetSheetsHyperLinkZhCN,
            UniverPresetSheetsNoteZhCN,
            UniverPresetSheetsSortZhCN,
            UniverPresetSheetsTableZhCN,
            UniverPresetSheetsThreadCommentZhCN
        ),
    },
    theme: defaultTheme,
    presets: [
        UniverSheetsCorePreset(),
        UniverSheetsDrawingPreset(),
        UniverSheetsConditionalFormattingPreset(),
        UniverSheetsFilterPreset(),
        UniverSheetsHyperLinkPreset(),
        UniverSheetsDataValidationPreset(),
        UniverSheetsFindReplacePreset(),
        UniverSheetsNotePreset(),
        UniverSheetsSortPreset(),
        UniverSheetsTablePreset(),
        UniverSheetsThreadCommentPreset(),
    ],
    plugins: [
        ImportCSVButtonPlugin,
    ],
});

univerAPI.createWorkbook({ name: 'Test Sheet' });

window.univer = univer;
window.univerAPI = univerAPI;

declare global {

    interface Window {
        univer?: Univer;
        univerAPI?: FUniver;
    }
}
