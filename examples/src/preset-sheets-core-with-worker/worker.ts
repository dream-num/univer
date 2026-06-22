import UniverPresetSheetsCoreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN';
import { UniverSheetsCoreWorkerPreset } from '@univerjs/preset-sheets-core/worker';
import UniverPresetSheetsFilterZhCN from '@univerjs/preset-sheets-filter/locales/zh-CN';
import { UniverSheetsFilterWorkerPreset } from '@univerjs/preset-sheets-filter/worker';
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets';

createUniver({
    locale: LocaleType.ZH_CN,
    locales: {
        zhCN: mergeLocales(
            UniverPresetSheetsCoreZhCN,
            UniverPresetSheetsFilterZhCN
        ),
    },
    presets: [
        UniverSheetsCoreWorkerPreset(),
        UniverSheetsFilterWorkerPreset(),
    ],
});
