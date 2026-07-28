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

import type { Workbook, Worksheet } from '@univerjs/core';
import type { IUniverSheetsUIConfig } from '../../config/config';
import {
    DEFAULT_WORKSHEET_COLUMN_TITLE_HEIGHT,
    DEFAULT_WORKSHEET_COLUMN_WIDTH,
    DEFAULT_WORKSHEET_ROW_HEIGHT,
    DEFAULT_WORKSHEET_ROW_TITLE_WIDTH,
    Injector,
    isInternalEditorID,
    IUniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { LoadingMultiIcon } from '@univerjs/icons';
import { ComponentManager, ContextMenuPosition, IMenuManagerService, ToolbarItem, useConfigValue, useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useMemo } from 'react';
import { SHEETS_UI_PLUGIN_CONFIG_KEY } from '../../config/config';
import { getEmbedSheetsTabCustomData } from '../../embed-tab-anchor';
import { ISheetEmbedRuntimeService } from '../../services/sheet-embed-runtime.service';
import { AutoFillPopupMenu } from '../auto-fill-popup-menu/AutoFillPopupMenu';
import { EditorContainer } from '../editor-container/EditorContainer';
import { FormulaBar } from '../formula-bar/FormulaBar';
import {
    SheetLoadingWorkbookContext,
    useActiveWorkbook,
    useActiveWorksheet,
    useSheetLoading,
    useSheetLoadingPreviewReady,
    useSheetLoadingWorkbook,
} from '../hook';
import { SheetBar } from '../sheet-bar/SheetBar';
import { SheetZoomSlider } from '../sheet-slider/CountBar';
import { StatusBar } from '../status-bar/StatusBar';

export const SHEET_FOOTER_BAR_HEIGHT = 36;

export function RenderSheetFooter() {
    const config = useConfigValue<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY);
    const menuManagerService = useDependency(IMenuManagerService);
    const showFooter = config?.footer ?? true;
    const activeWorkbook = useActiveWorkbook();
    const loadingWorkbook = useSheetLoadingWorkbook();
    const workbook = loadingWorkbook ?? activeWorkbook;
    const isLoading = useSheetLoading();
    const activeWorkbookEmbeddedRender = useActiveWorkbookIsEmbeddedRender(workbook);
    const focusedUnitType = useFocusedUnitType();
    const activeEmbedTab = useActiveSheetEmbedTabData(workbook);
    if (!workbook || !showFooter) return null;
    if (activeWorkbookEmbeddedRender) return null;
    if (!activeEmbedTab && focusedUnitType != null && focusedUnitType !== UniverInstanceType.UNIVER_SHEET) return null;

    const footerMenus = menuManagerService.getMenuByPositionKey(ContextMenuPosition.FOOTER_MENU);
    const {
        sheetBar = true,
        statisticBar = true,
        menus = true,
        zoomSlider = true,
    } = config?.footer || {};
    const showStatisticBar = activeEmbedTab ? false : statisticBar;
    const showMenus = activeEmbedTab ? false : menus;
    const showZoomSlider = activeEmbedTab ? false : zoomSlider;
    if (!sheetBar && !showStatisticBar && !showMenus && !showZoomSlider) return null;

    return (
        <SheetLoadingWorkbookContext.Provider value={workbook}>
            <section
                className={clsx(`
                  univer-box-border univer-grid univer-w-full univer-grid-flow-col univer-grid-cols-[1fr,auto,auto,auto]
                  univer-items-center univer-justify-between univer-bg-white univer-px-5 univer-text-gray-900
                  dark:!univer-bg-gray-900 dark:!univer-text-gray-200
                `, { 'univer-pointer-events-none': isLoading })}
                data-range-selector
                aria-disabled={isLoading}
                style={{
                    height: SHEET_FOOTER_BAR_HEIGHT,
                }}
            >
                {sheetBar && <SheetBar />}
                {showStatisticBar && <StatusBar />}
                {showMenus && footerMenus.length > 0 && (
                    <div className="univer-box-border univer-flex univer-gap-2 univer-px-2">
                        {footerMenus.map((item) => item.children?.map((child) => (
                            child?.item && (
                                <ToolbarItem
                                    key={child.key}
                                    {...child.item}
                                />
                            )
                        )))}
                    </div>
                )}
                {showZoomSlider && <SheetZoomSlider />}
            </section>
        </SheetLoadingWorkbookContext.Provider>
    );
}

export function RenderSheetHeader() {
    const config = useConfigValue<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY);
    const activeWorkbook = useActiveWorkbook();
    const loadingWorkbook = useSheetLoadingWorkbook();
    const workbook = loadingWorkbook ?? activeWorkbook;
    const isLoading = useSheetLoading();
    const hasWorkbook = !!workbook;
    const activeWorkbookEmbeddedRender = useActiveWorkbookIsEmbeddedRender(workbook);
    const focusedUnitType = useFocusedUnitType();
    const activeEmbedTab = useActiveSheetEmbedTabData(workbook);
    if (!hasWorkbook) return null;
    if (activeWorkbookEmbeddedRender) return null;
    if (activeEmbedTab) return null;
    if (focusedUnitType != null && focusedUnitType !== UniverInstanceType.UNIVER_SHEET) {
        return (
            <div
                aria-hidden
                className="
                  univer-h-7 univer-border-b univer-border-gray-200 univer-bg-white
                  dark:!univer-border-gray-700 dark:!univer-bg-gray-900
                "
                data-u-comp="formula-bar-placeholder"
            />
        );
    }
    if (config?.formulaBar !== false) {
        return (
            <SheetLoadingWorkbookContext.Provider value={workbook}>
                <div aria-disabled={isLoading} className={clsx({ 'univer-pointer-events-none': isLoading })}>
                    <FormulaBar />
                </div>
            </SheetLoadingWorkbookContext.Provider>
        );
    }

    return null;
}

/**
 * We should not write into this component anymore.
 */
export function RenderSheetContent() {
    const config = useConfigValue<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY);
    const isLoading = useSheetLoading();
    const isPreviewReady = useSheetLoadingPreviewReady();
    const componentManager = useDependency(ComponentManager);
    const activeWorkbook = useActiveWorkbook();
    const loadingWorkbook = useSheetLoadingWorkbook();
    const workbook = loadingWorkbook ?? activeWorkbook;
    const activeEmbedTab = useActiveSheetEmbedTabData(workbook);
    const injector = useDependency(Injector);
    const activeWorkbookEmbeddedRender = useActiveWorkbookIsEmbeddedRender(workbook);

    // We use string keys to avoid a hard dependency on sheets-shape-ui.
    const ShapeTextEditorContainer = componentManager.get('SheetShapeTextEditorContainer') ?? componentManager.get('ShapeTextEditorContainer');

    useEffect(() => {
        if (!workbook || isLoading || activeEmbedTab || activeWorkbookEmbeddedRender) {
            return;
        }

        const instanceService = injector.get(IUniverInstanceService);
        instanceService.setCurrentUnitForType(workbook.getUnitId());
        instanceService.focusUnit(workbook.getUnitId());
        tryGetSheetEmbedRuntimeService(injector)?.clearTab();
    }, [activeEmbedTab, activeWorkbookEmbeddedRender, injector, isLoading, workbook]);

    if (!workbook) return null;
    if (isLoading) return isPreviewReady ? null : <SheetLoadingSkeleton />;
    if (activeWorkbookEmbeddedRender) return null;
    if (activeEmbedTab && workbook) {
        return <RenderSheetEmbedTabHost workbook={workbook} worksheet={activeEmbedTab.worksheet} />;
    }

    return (
        <>
            {ShapeTextEditorContainer && <ShapeTextEditorContainer />}
            {!config?.disableEdit && <EditorContainer />}
            <AutoFillPopupMenu />
        </>
    );
}

function SheetLoadingSkeleton() {
    return (
        <div
            data-u-comp="sheet-loading-skeleton"
            aria-busy
            className="
              univer-absolute univer-inset-0 univer-z-10 univer-overflow-hidden univer-bg-white
              dark:!univer-bg-gray-900
            "
        >
            <div
                className="
                  univer-absolute univer-right-0 univer-top-0 univer-border-b univer-border-gray-200 univer-bg-gray-50
                  dark:!univer-border-gray-700 dark:!univer-bg-gray-800
                "
                style={{ left: DEFAULT_WORKSHEET_ROW_TITLE_WIDTH, height: DEFAULT_WORKSHEET_COLUMN_TITLE_HEIGHT }}
            />
            <div
                className="
                  univer-absolute univer-bottom-0 univer-left-0 univer-border-r univer-border-gray-200 univer-bg-gray-50
                  dark:!univer-border-gray-700 dark:!univer-bg-gray-800
                "
                style={{ top: DEFAULT_WORKSHEET_COLUMN_TITLE_HEIGHT, width: DEFAULT_WORKSHEET_ROW_TITLE_WIDTH }}
            />
            <div
                className="
                  univer-absolute univer-bottom-0 univer-right-0 univer-animate-pulse univer-text-gray-200
                  dark:!univer-text-gray-700
                "
                style={{
                    top: DEFAULT_WORKSHEET_COLUMN_TITLE_HEIGHT,
                    left: DEFAULT_WORKSHEET_ROW_TITLE_WIDTH,
                    backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
                    backgroundSize: `${DEFAULT_WORKSHEET_COLUMN_WIDTH}px ${DEFAULT_WORKSHEET_ROW_HEIGHT}px`,
                }}
            />
            <LoadingMultiIcon
                aria-hidden
                className="
                  univer-absolute univer-left-1/2 univer-top-1/2 univer-size-6 -univer-translate-x-1/2
                  -univer-translate-y-1/2 univer-animate-spin univer-text-violet-500
                "
            />
        </div>
    );
}

function RenderSheetEmbedTabHost(props: { workbook: Workbook; worksheet: Worksheet }) {
    const { workbook, worksheet } = props;
    const injector = useDependency(Injector);
    const embedData = getEmbedSheetsTabCustomData(worksheet.getConfig());
    const hostUnitId = workbook.getUnitId();
    const hostAnchorId = embedData?.hostAnchorId;
    const embedId = embedData?.embedId;

    useEffect(() => {
        if (!embedId || !hostAnchorId) {
            return undefined;
        }

        const embedRuntimeService = tryGetSheetEmbedRuntimeService(injector);
        if (!embedRuntimeService) {
            return undefined;
        }

        try {
            const disposable = embedRuntimeService.mountSheetTab({
                hostUnitId,
                hostAnchorId,
                embedId,
            });

            return () => {
                disposable?.dispose();
            };
        } catch (error) {
            console.warn('[sheets-ui] failed to mount embedded sheet-tab block', error);
        }

        return undefined;
    }, [embedId, hostAnchorId, hostUnitId, injector]);

    return (
        <div
            data-embed-sheets-sheet-tab-host={hostAnchorId}
            className="
              univer-absolute univer-inset-0 univer-z-40 univer-bg-white
              dark:!univer-bg-gray-900
            "
        />
    );
}

function useActiveWorkbookIsEmbeddedRender(workbook: Workbook | null): boolean {
    const univerInstanceService = useDependency(IUniverInstanceService);
    return useMemo(() => {
        if (!workbook) {
            return false;
        }

        return univerInstanceService.getUnitCreateOptions(workbook.getUnitId())?.embeddedRender === true;
    }, [univerInstanceService, workbook]);
}

function useFocusedUnitType(): UniverInstanceType | null {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const focusedUnitId = useObservable(() => univerInstanceService.focused$, null, false, [univerInstanceService]);
    return useMemo(() => {
        if (!focusedUnitId) return null;

        if (isInternalEditorID(focusedUnitId) && univerInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)) {
            return UniverInstanceType.UNIVER_SHEET;
        }

        const focusedUnit = univerInstanceService.getUnit(focusedUnitId);
        return focusedUnit?.type ?? null;
    }, [focusedUnitId, univerInstanceService]);
}

function useActiveSheetEmbedTabData(workbook: Workbook | null): { worksheet: Worksheet } | undefined {
    const worksheet = useActiveWorksheet(workbook) as Worksheet | null | undefined;
    return worksheet && getEmbedSheetsTabCustomData(worksheet.getConfig()) ? { worksheet } : undefined;
}

function tryGetSheetEmbedRuntimeService(injector: Injector) {
    try {
        return injector.get(ISheetEmbedRuntimeService);
    } catch {
        return undefined;
    }
}
