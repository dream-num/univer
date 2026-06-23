import type { FUniver, Univer } from '@univerjs/presets';
import { DEFAULT_DOCUMENT_DATA_SIMPLE } from '@univerjs/mockdata';
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core';
import UniverPresetDocsCoreZhCN from '@univerjs/preset-docs-core/locales/zh-CN';
import { UniverDocsDrawingPreset } from '@univerjs/preset-docs-drawing';
import UniverPresetDocsDrawingZhCN from '@univerjs/preset-docs-drawing/locales/zh-CN';
import { UniverDocsHyperLinkPreset } from '@univerjs/preset-docs-hyper-link';
import UniverPresetDocsHyperLinkZhCN from '@univerjs/preset-docs-hyper-link/locales/zh-CN';
import { UniverDocsThreadCommentPreset } from '@univerjs/preset-docs-thread-comment';
import UniverPresetDocsThreadCommentZhCN from '@univerjs/preset-docs-thread-comment/locales/zh-CN';
import { createUniver, defaultTheme, LocaleType, LogLevel, mergeLocales, UniverInstanceType } from '@univerjs/presets';
import '../global.css';

const { univer, univerAPI } = createUniver({
    locale: LocaleType.ZH_CN,
    locales: {
        [LocaleType.ZH_CN]: mergeLocales(
            UniverPresetDocsCoreZhCN,
            UniverPresetDocsDrawingZhCN,
            UniverPresetDocsHyperLinkZhCN,
            UniverPresetDocsThreadCommentZhCN
        ),
    },
    theme: defaultTheme,
    logLevel: LogLevel.VERBOSE,
    presets: [
        UniverDocsCorePreset({
            container: 'app',
        }),
        UniverDocsDrawingPreset(),
        UniverDocsHyperLinkPreset(),
        UniverDocsThreadCommentPreset(),
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
