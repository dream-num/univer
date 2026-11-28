import type { Plugin, PluginCtor } from '@univerjs/core';
import { UniverDocsLayoutWorkerPlugin } from '@univerjs/docs';
import { SetDocZoomRatioOperation, UniverDocsMobileUIPlugin } from '@univerjs/docs-ui';
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core';
import { UniverDocsDrawingMobileUIPlugin, UniverDocsDrawingPreset, UniverDrawingMobileUIPlugin } from '@univerjs/preset-docs-drawing';
import { UniverDocsHyperLinkMobileUIPlugin, UniverDocsHyperLinkPreset } from '@univerjs/preset-docs-hyper-link';
import { UniverDocsThreadCommentMobileUIPlugin, UniverDocsThreadCommentPreset, UniverThreadCommentMobileUIPlugin } from '@univerjs/preset-docs-thread-comment';
import { createUniver, UniverInstanceType } from '@univerjs/presets';
import { UniverMobileUIPlugin, UniverUIPlugin } from '@univerjs/ui';
import { loadDocumentLocale } from 'virtual:univer-examples-document-locale';
import type { MountExample } from '../mount-example';
import { applyWorkbenchUIChrome, createMountedUniver, replacePresetPlugins } from '../mount-example';
import { getEffectiveWorkbenchRegion } from '../workbench-settings';
import { createDocumentFixture } from './create-document-fixture';
import '@univerjs/ui/facade';
import './global.css';

const MOBILE_PLUGINS = new Map<string, PluginCtor<Plugin>>([
    UniverDocsMobileUIPlugin,
    UniverDrawingMobileUIPlugin,
    UniverDocsDrawingMobileUIPlugin,
    UniverDocsHyperLinkMobileUIPlugin,
    UniverThreadCommentMobileUIPlugin,
    UniverDocsThreadCommentMobileUIPlugin,
].map((plugin) => [plugin.pluginName, plugin]));
MOBILE_PLUGINS.set(UniverUIPlugin.pluginName, UniverMobileUIPlugin);

export const mount: MountExample = async (host, options) => {
    const locale = await loadDocumentLocale(options.locale);
    const presets = [
        UniverDocsCorePreset({ container: host, ribbonType: options.ribbonType, toc: true }),
        UniverDocsDrawingPreset(),
        UniverDocsHyperLinkPreset(),
        UniverDocsThreadCommentPreset(),
    ];
    const { univer, univerAPI } = createUniver({
        locale: options.locale,
        region: getEffectiveWorkbenchRegion(options),
        locales: {
            [options.locale]: locale,
        },
        theme: options.theme,
        darkMode: options.darkMode,
        direction: options.direction,
        presets: options.device === 'mobile' ? replacePresetPlugins(presets, MOBILE_PLUGINS) : presets,
    });
    univer.registerPlugin(UniverDocsLayoutWorkerPlugin, {
        workerFactory: () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }),
    });

    try {
        applyWorkbenchUIChrome(univerAPI, options.uiChrome);
        univer.createUnit(
            UniverInstanceType.UNIVER_DOC,
            createDocumentFixture(options.locale, options.direction, options.zoomRatio)
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
