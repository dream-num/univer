import type { Plugin, PluginCtor } from '@univerjs/core';
import { UniverDocsMobileUIPlugin } from '@univerjs/docs-ui';
import { UniverSheetsConditionalFormattingMobileUIPlugin, UniverSheetsConditionalFormattingPreset } from '@univerjs/preset-sheets-conditional-formatting';
import {
    UniverSheetsCorePreset,
    UniverSheetsFormulaMobileUIPlugin,
    UniverSheetsMobileUIPlugin,
    UniverSheetsNumfmtMobileUIPlugin,
} from '@univerjs/preset-sheets-core';
import { UniverSheetsDataValidationMobileUIPlugin, UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation';
import { UniverDrawingMobileUIPlugin, UniverSheetsDrawingMobileUIPlugin, UniverSheetsDrawingPreset } from '@univerjs/preset-sheets-drawing';
import { UniverSheetsFilterMobileUIPlugin, UniverSheetsFilterPreset } from '@univerjs/preset-sheets-filter';
import { UniverFindReplaceMobileUIPlugin, UniverSheetsFindReplaceMobileUIPlugin, UniverSheetsFindReplacePreset } from '@univerjs/preset-sheets-find-replace';
import { UniverSheetsHyperLinkMobileUIPlugin, UniverSheetsHyperLinkPreset } from '@univerjs/preset-sheets-hyper-link';
import { UniverSheetsNotePreset } from '@univerjs/preset-sheets-note';
import { UniverSheetsSortMobileUIPlugin, UniverSheetsSortPreset } from '@univerjs/preset-sheets-sort';
import { UniverSheetsTableMobileUIPlugin, UniverSheetsTablePreset } from '@univerjs/preset-sheets-table';
import { UniverSheetsThreadCommentMobileUIPlugin, UniverSheetsThreadCommentPreset, UniverThreadCommentMobileUIPlugin } from '@univerjs/preset-sheets-thread-comment';
import { createUniver } from '@univerjs/presets';
import { UniverMobileUIPlugin, UniverUIPlugin } from '@univerjs/ui';
import { loadSheetLocale } from 'virtual:univer-examples-sheet-locale';
import type { MountExample } from '../mount-example';
import { applyWorkbenchUIChrome, createMountedUniver, replacePresetPlugins } from '../mount-example';
import { getEffectiveWorkbenchRegion } from '../workbench-settings';
import { applyWorkbookZoom } from './apply-workbook-zoom';
import { createSheetFixture } from './create-sheet-fixture';
import './global.css';

const MOBILE_PLUGINS = new Map<string, PluginCtor<Plugin>>([
    UniverDocsMobileUIPlugin,
    UniverSheetsMobileUIPlugin,
    UniverSheetsFormulaMobileUIPlugin,
    UniverSheetsNumfmtMobileUIPlugin,
    UniverDrawingMobileUIPlugin,
    UniverSheetsDrawingMobileUIPlugin,
    UniverSheetsConditionalFormattingMobileUIPlugin,
    UniverSheetsFilterMobileUIPlugin,
    UniverSheetsHyperLinkMobileUIPlugin,
    UniverSheetsDataValidationMobileUIPlugin,
    UniverFindReplaceMobileUIPlugin,
    UniverSheetsFindReplaceMobileUIPlugin,
    UniverSheetsSortMobileUIPlugin,
    UniverSheetsTableMobileUIPlugin,
    UniverThreadCommentMobileUIPlugin,
    UniverSheetsThreadCommentMobileUIPlugin,
].map((plugin) => [plugin.pluginName, plugin]));
MOBILE_PLUGINS.set(UniverUIPlugin.pluginName, UniverMobileUIPlugin);

export const mount: MountExample = async (host, options) => {
    const { darkMode, direction, locale, ribbonType, theme, zoomRatio } = options;
    const localePack = await loadSheetLocale(locale);
    const presets = [
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
    ];
    const { univer, univerAPI } = createUniver({
        locale,
        region: getEffectiveWorkbenchRegion(options),
        locales: {
            [locale]: localePack,
        },
        theme,
        darkMode,
        direction,
        presets: options.device === 'mobile' ? replacePresetPlugins(presets, MOBILE_PLUGINS) : presets,
    });

    try {
        applyWorkbenchUIChrome(univerAPI, options.uiChrome);
        univerAPI.createWorkbook(createSheetFixture(locale, direction, zoomRatio));
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
