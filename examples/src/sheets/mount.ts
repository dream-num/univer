import type { MountExample } from '../mount-example';
import type { IWorkbenchMountOptions } from '../workbench-settings';
import { LocaleType } from '@univerjs/core';
import { UniverSheetsConditionalFormattingPreset } from '@univerjs/preset-sheets-conditional-formatting';
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import { UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation';
import { UniverSheetsDrawingPreset } from '@univerjs/preset-sheets-drawing';
import { UniverSheetsFilterPreset } from '@univerjs/preset-sheets-filter';
import { UniverSheetsFindReplacePreset } from '@univerjs/preset-sheets-find-replace';
import { UniverSheetsHyperLinkPreset } from '@univerjs/preset-sheets-hyper-link';
import { UniverSheetsNotePreset } from '@univerjs/preset-sheets-note';
import { UniverSheetsSortPreset } from '@univerjs/preset-sheets-sort';
import { UniverSheetsTablePreset } from '@univerjs/preset-sheets-table';
import { UniverSheetsThreadCommentPreset } from '@univerjs/preset-sheets-thread-comment';

import { createUniver } from '@univerjs/presets';
import { loadSheetLocale } from 'virtual:univer-examples-sheet-locale';
import { applyWorkbenchUIChrome, createMountedUniver } from '../mount-example';
import { getEffectiveWorkbenchRegion } from '../workbench-settings';
import { applyWorkbookZoom } from './apply-workbook-zoom';
import { createSheetFixture } from './create-sheet-fixture';
import './global.css';

const UNIVER_LOCALES = {
    [LocaleType.ZH_CN]: LocaleType.ZH_CN,
    [LocaleType.EN_US]: LocaleType.EN_US,
    [LocaleType.AR_SA]: LocaleType.AR_SA,
    [LocaleType.FR_FR]: LocaleType.FR_FR,
    [LocaleType.RU_RU]: LocaleType.RU_RU,
    [LocaleType.ZH_TW]: LocaleType.ZH_TW,
    [LocaleType.ZH_HK]: LocaleType.ZH_HK,
    [LocaleType.VI_VN]: LocaleType.VI_VN,
    [LocaleType.FA_IR]: LocaleType.FA_IR,
    [LocaleType.JA_JP]: LocaleType.JA_JP,
    [LocaleType.KO_KR]: LocaleType.KO_KR,
    [LocaleType.ES_ES]: LocaleType.ES_ES,
    [LocaleType.CA_ES]: LocaleType.CA_ES,
    [LocaleType.SK_SK]: LocaleType.SK_SK,
    [LocaleType.PT_BR]: LocaleType.PT_BR,
    [LocaleType.DE_DE]: LocaleType.DE_DE,
    [LocaleType.IT_IT]: LocaleType.IT_IT,
    [LocaleType.ID_ID]: LocaleType.ID_ID,
    [LocaleType.PL_PL]: LocaleType.PL_PL,
} satisfies Record<IWorkbenchMountOptions['locale'], LocaleType>;

export const mount: MountExample = async (host, options) => {
    const { darkMode, direction, locale, ribbonType, theme, zoomRatio } = options;
    const univerLocale = UNIVER_LOCALES[locale];
    const localePack = await loadSheetLocale(locale);
    const { univer, univerAPI } = createUniver({
        locale: univerLocale,
        region: UNIVER_LOCALES[getEffectiveWorkbenchRegion(options)],
        locales: {
            [univerLocale]: localePack,
        },
        theme,
        darkMode,
        direction,
        presets: [
            UniverSheetsCorePreset({ container: host, ribbonType }),
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
    });

    try {
        applyWorkbenchUIChrome(univerAPI, options.uiChrome);
        univerAPI.createWorkbook(createSheetFixture(univerLocale, direction, zoomRatio));
        return createMountedUniver(
            host,
            univer,
            univerAPI,
            options,
            loadSheetLocale,
            (nextOptions) => applyWorkbookZoom(univerAPI, nextOptions)
        );
    } catch (error) {
        univer.dispose();
        host.replaceChildren();
        throw error;
    }
};
