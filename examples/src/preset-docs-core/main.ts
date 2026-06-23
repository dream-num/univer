import type { FUniver, Univer } from '@univerjs/presets';
import { DEFAULT_DOCUMENT_DATA_SIMPLE } from '@univerjs/mockdata';
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core';
import UniverPresetDocsCoreZhCN from '@univerjs/preset-docs-core/locales/zh-CN';
import { createUniver, LocaleType, LogLevel, mergeLocales, UniverInstanceType } from '@univerjs/presets';
import '../global.css';

const { univer, univerAPI } = createUniver({
    locale: LocaleType.ZH_CN,
    locales: {
        [LocaleType.ZH_CN]: mergeLocales(UniverPresetDocsCoreZhCN),
    },
    logLevel: LogLevel.VERBOSE,
    presets: [
        UniverDocsCorePreset({
            container: 'app',
        }),
    ],
});

univer.createUnit(UniverInstanceType.UNIVER_DOC, DEFAULT_DOCUMENT_DATA_SIMPLE);

window.univer = univer;
window.univerAPI = univerAPI;

declare global {

    interface Window {
        univer?: Univer;
        univerAPI?: FUniver;
    }
}
