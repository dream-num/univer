import type { MountExample } from '../mount-example';
import type { IWorkbenchMountOptions } from '../workbench-settings';
import { SetDocZoomRatioOperation } from '@univerjs/docs-ui';
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core';
import { UniverDocsDrawingPreset } from '@univerjs/preset-docs-drawing';
import { UniverDocsHyperLinkPreset } from '@univerjs/preset-docs-hyper-link';
import { UniverDocsThreadCommentPreset } from '@univerjs/preset-docs-thread-comment';
import { createUniver, LocaleType, UniverInstanceType } from '@univerjs/presets';

import { loadDocumentLocale } from 'virtual:univer-examples-document-locale';
import { applyWorkbenchUIChrome, createMountedUniver } from '../mount-example';
import { getEffectiveWorkbenchRegion } from '../workbench-settings';
import { createDocumentFixture } from './create-document-fixture';
import '@univerjs/ui/facade';
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
    const locale = await loadDocumentLocale(options.locale);
    const localeType = UNIVER_LOCALES[options.locale];
    const { univer, univerAPI } = createUniver({
        locale: localeType,
        region: UNIVER_LOCALES[getEffectiveWorkbenchRegion(options)],
        locales: {
            [options.locale]: locale,
        },
        theme: options.theme,
        darkMode: options.darkMode,
        direction: options.direction,
        presets: [
            UniverDocsCorePreset({ container: host, ribbonType: options.ribbonType }),
            UniverDocsDrawingPreset(),
            UniverDocsHyperLinkPreset(),
            UniverDocsThreadCommentPreset(),
        ],
    });

    try {
        applyWorkbenchUIChrome(univerAPI, options.uiChrome);
        univer.createUnit(
            UniverInstanceType.UNIVER_DOC,
            createDocumentFixture(localeType, options.direction, options.zoomRatio)
        );
        return createMountedUniver(
            host,
            univer,
            univerAPI,
            options,
            loadDocumentLocale,
            async (nextOptions) => {
                const document = univerAPI.getActiveDocument();
                if (!document) {
                    return;
                }

                const applied = await univerAPI.executeCommand(SetDocZoomRatioOperation.id, {
                    unitId: document.getId(),
                    zoomRatio: nextOptions.zoomRatio,
                });
                if (!applied) {
                    throw new Error(`Failed to apply zoom to document ${document.getId()}.`);
                }
            }
        );
    } catch (error) {
        univer.dispose();
        host.replaceChildren();
        throw error;
    }
};
