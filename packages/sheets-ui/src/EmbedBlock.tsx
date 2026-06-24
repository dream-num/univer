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

import type { Injector } from '@univerjs/core';
import type { IEmbedBlockContribution, IEmbedChildContainerContext, IEmbedChildViewContribution } from '@univerjs/embed-ui';
import type { IUniverSheetsUIConfig } from './config/config';
import { toDisposable, UniverInstanceType } from '@univerjs/core';
import { createEmbedReactRoot, createEmbedRibbonBlockContribution, disposeEmbedReactRoot, EmbedFloatingGeometryService, EmbedRuntimeProviders, mountEmbedRenderChildUnit } from '@univerjs/embed-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ComponentManager, useConfigValue, useDependency } from '@univerjs/ui';
import { useEffect } from 'react';
import { SHEETS_UI_PLUGIN_CONFIG_KEY } from './config/config';
import { AutoFillPopupMenu } from './views/auto-fill-popup-menu/AutoFillPopupMenu';
import { EditorContainer } from './views/editor-container/EditorContainer';
import { FormulaBar } from './views/formula-bar/FormulaBar';
import { SheetBar } from './views/sheet-bar/SheetBar';
import { SHEET_FOOTER_BAR_HEIGHT } from './views/sheet-container/SheetContainer';

const EMBED_SHEET_FORMULA_BAR_HEIGHT = 28;

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
            const geometryDisposable = registerEmbeddedSheetGeometry(context, contentRoot);
            const overlayRoot = createEmbedReactRoot(contentRoot);
            overlayRoot.render(
                <EmbedRuntimeProviders injector={scopedInjector as Injector} mountContainer={context.runtimeScope.roots.popup} embedId={context.embedId}>
                    <SheetEmbedChildOverlay
                        canvasRoot={rootElement}
                        showChrome={context.renderScope.mode === 'tab'}
                    />
                </EmbedRuntimeProviders>
            );

            return toDisposable(() => {
                geometryDisposable.dispose();
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

export function applyEmbeddedSheetChromeInset(canvasRoot: HTMLElement, chrome: { formulaBar: boolean; sheetBar: boolean }) {
    const previousTop = canvasRoot.style.top;
    const previousBottom = canvasRoot.style.bottom;

    canvasRoot.style.top = chrome.formulaBar ? `${EMBED_SHEET_FORMULA_BAR_HEIGHT}px` : '';
    canvasRoot.style.bottom = chrome.sheetBar ? `${SHEET_FOOTER_BAR_HEIGHT}px` : '';

    return toDisposable(() => {
        canvasRoot.style.top = previousTop;
        canvasRoot.style.bottom = previousBottom;
    });
}

function registerEmbeddedSheetGeometry(context: IEmbedChildContainerContext, contentRoot: HTMLElement) {
    if (!context.injector?.has?.(EmbedFloatingGeometryService)) {
        return toDisposable(() => {});
    }

    return context.injector.get(EmbedFloatingGeometryService).register({
        embedId: context.embedId,
        childUnitId: context.childUnitId,
        root: context.renderScope.rootElement,
        contentRoot,
    });
}

function SheetEmbedChildOverlay(props: { canvasRoot: HTMLElement; showChrome: boolean }) {
    const config = useConfigValue<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY);
    const componentManager = useDependency(ComponentManager);
    const ShapeTextEditorContainer = componentManager.get('ShapeTextEditorContainer');
    const showFormulaBar = props.showChrome && config?.formulaBar !== false;
    const footerConfig = config?.footer;
    const showSheetBar = props.showChrome && footerConfig !== false && (typeof footerConfig !== 'object' || footerConfig.sheetBar !== false);

    useEffect(() => {
        const disposable = applyEmbeddedSheetChromeInset(props.canvasRoot, {
            formulaBar: showFormulaBar,
            sheetBar: showSheetBar,
        });

        return () => disposable.dispose();
    }, [props.canvasRoot, showFormulaBar, showSheetBar]);

    return (
        <>
            {showFormulaBar && (
                <div
                    className="univer-absolute univer-inset-x-0 univer-top-0 univer-z-10"
                    style={{ height: EMBED_SHEET_FORMULA_BAR_HEIGHT }}
                >
                    <FormulaBar />
                </div>
            )}
            {ShapeTextEditorContainer && <ShapeTextEditorContainer />}
            {!config?.disableEdit && <EditorContainer />}
            <AutoFillPopupMenu />
            {showSheetBar && (
                <div
                    className="univer-absolute univer-inset-x-0 univer-bottom-0 univer-z-10"
                    style={{ height: SHEET_FOOTER_BAR_HEIGHT }}
                >
                    <SheetBar />
                </div>
            )}
        </>
    );
}
