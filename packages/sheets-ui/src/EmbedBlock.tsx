/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IEmbedBlockContribution, IEmbedChildViewContribution } from '@univerjs/embed-ui';
import type { IUniverSheetsUIConfig } from './config/config';
import { Injector, toDisposable, UniverInstanceType } from '@univerjs/core';
import { ComponentManager, useConfigValue, useDependency } from '@univerjs/ui';
import { createEmbedReactRoot, createEmbedRibbonBlockContribution, disposeEmbedReactRoot, EmbedRuntimeProviders, mountEmbedRenderChildUnit } from '@univerjs/embed-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SHEETS_UI_PLUGIN_CONFIG_KEY } from './config/config';
import { AutoFillPopupMenu } from './views/auto-fill-popup-menu/AutoFillPopupMenu';
import { EditorContainer } from './views/editor-container/EditorContainer';

export function createSheetsEmbedBlockContribution(): IEmbedBlockContribution {
    return createEmbedRibbonBlockContribution({
        childType: UniverInstanceType.UNIVER_SHEET,
        productName: 'Sheets',
    });
}

export function createSheetsEmbedChildViewContribution(): IEmbedChildViewContribution {
    return {
        childType: UniverInstanceType.UNIVER_SHEET,
        supportedLayouts: ['tab-peer', 'docs-sticky-sheet', 'scroll-contained'],
        mount: (context) => {
            const scopedInjector = context.runtimeScope.injector as Injector;
            const rootElement = context.runtimeScope.roots.canvas
                ?? context.renderScope.canvasRoot
                ?? context.renderScope.contentRoot
                ?? context.renderScope.rootElement;
            const contentRoot = context.runtimeScope.roots.content
                ?? context.renderScope.contentRoot
                ?? rootElement;

            rootElement.dataset.embedChildRenderUnitId = context.childUnitId;
            rootElement.dataset.embedChildRenderMode = 'sheet-workbench';
            contentRoot.dataset.embedChildRenderUnitId = context.childUnitId;
            contentRoot.dataset.embedChildRenderMode = 'sheet-overlay';

            const renderDisposable = mountEmbedRenderChildUnit(context, IRenderManagerService, rootElement, { scopedRenderInjector: true }) ?? toDisposable(() => {});
            const overlayRoot = createEmbedReactRoot(contentRoot);
            overlayRoot.render(
                <EmbedRuntimeProviders injector={scopedInjector as Injector} mountContainer={context.runtimeScope.roots.popup} embedId={context.embedId}>
                    <SheetEmbedChildOverlay />
                </EmbedRuntimeProviders>
            );

            return toDisposable(() => {
                renderDisposable.dispose();
                disposeEmbedReactRoot(overlayRoot);
                if (rootElement.isConnected) {
                    rootElement.removeAttribute('data-embed-child-render-unit-id');
                    rootElement.removeAttribute('data-embed-child-render-mode');
                }
                if (contentRoot.isConnected) {
                    contentRoot.removeAttribute('data-embed-child-render-unit-id');
                    contentRoot.removeAttribute('data-embed-child-render-mode');
                }
            });
        },
    };
}

function SheetEmbedChildOverlay() {
    const config = useConfigValue<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY);
    const componentManager = useDependency(ComponentManager);
    const ShapeTextEditorContainer = componentManager.get('ShapeTextEditorContainer');

    return (
        <>
            {ShapeTextEditorContainer && <ShapeTextEditorContainer />}
            {!config?.disableEdit && <EditorContainer />}
            <AutoFillPopupMenu />
        </>
    );
}
