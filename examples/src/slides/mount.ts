import type { MountExample } from '../mount-example';
import type { IWorkbenchMountOptions } from '../workbench-settings';
import { LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { IRenderManagerService, UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverSlidesPlugin } from '@univerjs/slides';
import { UniverSlidesUIPlugin } from '@univerjs/slides-ui';
import { UniverUIPlugin } from '@univerjs/ui';
import { filter, firstValueFrom } from 'rxjs';

import { loadSlideLocale } from 'virtual:univer-examples-slide-locale';
import { applyWorkbenchUIChrome, createMountedUniver } from '../mount-example';
import { getEffectiveWorkbenchRegion } from '../workbench-settings';
import { createSlideFixture } from './create-slide-fixture';
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
    const locale = UNIVER_LOCALES[options.locale];
    const messages = await loadSlideLocale(options.locale);
    const univer = new Univer({
        locale,
        region: UNIVER_LOCALES[getEffectiveWorkbenchRegion(options)],
        locales: {
            [locale]: messages,
        },
        theme: options.theme,
        darkMode: options.darkMode,
        direction: options.direction,
    });

    try {
        univer.registerPlugin(UniverRenderEnginePlugin);
        univer.registerPlugin(UniverUIPlugin, {
            container: host,
            ribbonType: options.ribbonType,
        });
        univer.registerPlugin(UniverDocsPlugin);
        univer.registerPlugin(UniverDocsUIPlugin);
        univer.registerPlugin(UniverDrawingPlugin);
        univer.registerPlugin(UniverSlidesPlugin);
        univer.registerPlugin(UniverSlidesUIPlugin);

        const univerAPI = FUniver.newAPI(univer);
        applyWorkbenchUIChrome(univerAPI, options.uiChrome);
        const slideFixture = createSlideFixture();
        const slideId = slideFixture.id;
        univer.createUnit(UniverInstanceType.UNIVER_SLIDE, slideFixture);

        const renderManagerService = univer.__getInjector().get(IRenderManagerService);
        const applyProductSettings = async (nextOptions: IWorkbenchMountOptions) => {
            const renderUnit = renderManagerService.getRenderUnitById(slideId) ?? await firstValueFrom(
                renderManagerService.created$.pipe(filter(({ unitId }) => unitId === slideId))
            );
            renderUnit.scene.scale(nextOptions.zoomRatio, nextOptions.zoomRatio);
        };

        await applyProductSettings(options);
        return createMountedUniver(
            host,
            univer,
            univerAPI,
            options,
            loadSlideLocale,
            applyProductSettings
        );
    } catch (error) {
        univer.dispose();
        host.replaceChildren();
        throw error;
    }
};
