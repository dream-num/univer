import { LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { UniverDebuggerPlugin } from '@univerjs/debugger';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { DEFAULT_SLIDE_DATA, loadDebuggerLocale } from '@univerjs/mockdata';
import zhCN from '@univerjs/mockdata/locales/zh-CN';
import { UniverSlidesPlugin } from '@univerjs/slides';
import { UniverSlidesUIPlugin } from '@univerjs/slides-ui';
import { UniverUIPlugin } from '@univerjs/ui';
import { UniverWatermarkPlugin } from '@univerjs/watermark';
import '../global.css';
import '@univerjs/watermark/facade';

// univer
const univer = new Univer({
    locale: LocaleType.ZH_CN,
    locales: {
        [LocaleType.ZH_CN]: zhCN,
    },
});

// core plugins
univer.registerPlugin(UniverRenderEnginePlugin);
univer.registerPlugin(UniverUIPlugin, {
    container: 'app',
    ribbonType: 'classic',
});
univer.registerPlugin(UniverDocsPlugin);
univer.registerPlugin(UniverDocsUIPlugin);
// base-render
univer.registerPlugin(UniverFormulaEnginePlugin);
univer.registerPlugin(UniverDrawingPlugin);
univer.registerPlugin(UniverSlidesPlugin);
univer.registerPlugin(UniverSlidesUIPlugin);
univer.registerPlugin(UniverWatermarkPlugin);

univer.registerPlugin(UniverDebuggerPlugin, {
    fab: false,
    fabEntryUnitType: UniverInstanceType.UNIVER_SLIDE,
    localeLoader: loadDebuggerLocale,
    performanceMonitor: {
        enabled: false,
    },
});

univer.createUnit(UniverInstanceType.UNIVER_SLIDE, DEFAULT_SLIDE_DATA);

window.univer = univer;
