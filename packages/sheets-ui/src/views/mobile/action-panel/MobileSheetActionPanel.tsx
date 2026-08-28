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

import type { Worksheet } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import type { IValueOption, MobileDrawerSnap } from '@univerjs/ui';
import type { LocaleKey } from '../../../locale/types';
import type { IMobileStyleCommand, MobileStyleView } from './MobileStylePanel';
import {
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    EDITOR_ACTIVATED,
    FOCUSING_COMMON_DRAWINGS,
    FOCUSING_FX_BAR_EDITOR,
    ICommandService,
    IContextService,
    LocaleService,
} from '@univerjs/core';
import { clsx, resetButtonClassName } from '@univerjs/design';
import { IEditorService } from '@univerjs/docs-ui';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { KeyboardIcon, MenuIcon, MoreLeftIcon } from '@univerjs/icons';
import { getPrimaryForRange, SheetsSelectionsService } from '@univerjs/sheets';
import {
    ContextMenuGroup,
    ContextMenuPosition,
    IDialogService,
    ILayoutService,
    IMenuManagerService,
    IRibbonService,
    isMobileDialogService,
    MobileDrawer,
    MobileMenu,
    RibbonPosition,
    RibbonStartGroup,
    useDependency,
    useObservable,
} from '@univerjs/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { map, startWith } from 'rxjs';
import { ScrollCommand, SetScrollRelativeCommand } from '../../../commands/commands/set-scroll.command';
import { SetCellEditVisibleOperation } from '../../../commands/operations/cell-edit.operation';
import {
    MOBILE_FORMULA_OPERATOR_BAR_HEIGHT,
    MOBILE_FORMULA_OPERATORS_VISIBLE,
    MOBILE_KEYBOARD_VISIBLE,
} from '../../../consts/mobile-context';
import { IEditorBridgeService } from '../../../services/editor-bridge.service';
import { useActiveWorkbook } from '../../hook';
import { MobileStylePanel } from './MobileStylePanel';

type MobileSheetPanelTab = 'insert' | 'operation' | 'style';
type MobileMenuSource = 'insert' | 'data' | 'operation';

interface IMobileMenuNavigation {
    source: MobileMenuSource;
    title?: string;
    onBack: () => void;
}

interface IMobileSheetPanelTab {
    key: MobileSheetPanelTab;
    title: LocaleKey;
}

const MOBILE_SHEET_PANEL_TABS: IMobileSheetPanelTab[] = [
    { key: 'insert', title: 'sheets-ui.mobile.insert' },
    { key: 'operation', title: 'sheets-ui.mobile.operation' },
    { key: 'style', title: 'sheets-ui.mobile.style' },
];

const MOBILE_CELL_SAFE_PADDING = 48;

export function getMobileCellRevealOffset(cellTop: number, cellBottom: number, safeTop: number, safeBottom: number): number {
    if (cellTop < safeTop) return cellTop - safeTop;
    if (cellBottom > safeBottom) return cellBottom - safeBottom;
    return 0;
}

export function getMobileCellCenterOffset(cellTop: number, cellBottom: number, safeTop: number, safeBottom: number): number {
    return (cellTop + cellBottom - safeTop - safeBottom) / 2;
}

export function getMobileEditingMenuBottomOffset(formulaOperatorsVisible: boolean): number {
    return 72 + (formulaOperatorsVisible ? MOBILE_FORMULA_OPERATOR_BAR_HEIGHT : 0);
}

export function normalizeMobileSelectionPrimary(
    selections: Readonly<ISelectionWithStyle[]>,
    worksheet: Worksheet
): ISelectionWithStyle[] | null {
    const lastIndex = selections.length - 1;
    if (lastIndex < 0 || selections[lastIndex].primary) return null;

    return selections.map((selection, index) => ({
        range: { ...selection.range },
        primary: index === lastIndex
            ? getPrimaryForRange(selection.range, worksheet)
            : selection.primary ? { ...selection.primary } : null,
        style: selection.style ? { ...selection.style } : selection.style,
    }));
}

export function getMobileMenuCommand(params: IValueOption | IMobileStyleCommand): {
    commandId: string;
    commandParams?: Record<string, unknown>;
} | null {
    const commandId = ('commandId' in params ? params.commandId : undefined) ?? params.id;
    if (typeof commandId !== 'string') {
        return null;
    }

    if (!('params' in params)) {
        return {
            commandId,
            commandParams: typeof params.value === 'undefined' ? undefined : { value: params.value },
        };
    }

    const fallbackParams = typeof params.params === 'function'
        ? params.params(typeof params.value === 'string' || typeof params.value === 'number' ? params.value : undefined)
        : params.params;
    const commandParams = typeof params.value === 'undefined' ? fallbackParams : { value: params.value };

    return {
        commandId,
        commandParams,
    };
}

export function MobileSheetActionPanel() {
    const workbook = useActiveWorkbook();
    const commandService = useDependency(ICommandService);
    const contextService = useDependency(IContextService);
    const editorBridgeService = useDependency(IEditorBridgeService);
    const editorService = useDependency(IEditorService);
    const dialogService = useDependency(IDialogService);
    const layoutService = useDependency(ILayoutService);
    const localeService = useDependency(LocaleService);
    const menuManagerService = useDependency(IMenuManagerService);
    const ribbonService = useDependency(IRibbonService);
    const selectionManagerService = useDependency(SheetsSelectionsService);
    const overlaysSuspended = useObservable(
        isMobileDialogService(dialogService) ? dialogService.getOverlaysSuspended$() : null,
        false
    );
    const ribbon = useObservable(ribbonService.ribbon$, []);
    const operationSchemas = useObservable(
        () => menuManagerService.menuChanged$.pipe(
            startWith(undefined),
            map(() => menuManagerService.getMenuByPositionKey(ContextMenuPosition.MAIN_AREA).filter((schema) =>
                schema.key === ContextMenuGroup.QUICK ||
                schema.key === ContextMenuGroup.LAYOUT
            ))
        ),
        [],
        false,
        [menuManagerService]
    );
    const editing = useObservable(
        () => editorBridgeService.visible$.pipe(map((state) => state.visible)),
        false,
        false,
        [editorBridgeService]
    );
    const keyboardVisible = useObservable(
        () => contextService.subscribeContextValue$(MOBILE_KEYBOARD_VISIBLE).pipe(map(Boolean)),
        Boolean(contextService.getContextValue(MOBILE_KEYBOARD_VISIBLE)),
        false,
        [contextService]
    );
    const formulaOperatorsVisible = useObservable(
        () => contextService.subscribeContextValue$(MOBILE_FORMULA_OPERATORS_VISIBLE).pipe(map(Boolean)),
        Boolean(contextService.getContextValue(MOBILE_FORMULA_OPERATORS_VISIBLE)),
        false,
        [contextService]
    );
    const focusingDrawing = useObservable(
        () => contextService.subscribeContextValue$(FOCUSING_COMMON_DRAWINGS).pipe(map(Boolean)),
        Boolean(contextService.getContextValue(FOCUSING_COMMON_DRAWINGS)),
        false,
        [contextService]
    );
    const [activeTab, setActiveTab] = useState<MobileSheetPanelTab>('insert');
    const [toolsOpen, setToolsOpen] = useState(false);
    const [drawerSnap, setDrawerSnap] = useState<MobileDrawerSnap>('compact');
    const [styleViewStack, setStyleViewStack] = useState<MobileStyleView[]>([]);
    const [menuNavigation, setMenuNavigation] = useState<IMobileMenuNavigation | null>(null);
    const [recentColors, setRecentColors] = useState<string[]>([]);
    const panelRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const currentStyleView = styleViewStack[styleViewStack.length - 1] ?? null;
    const nestedTitle = currentStyleView?.title ?? menuNavigation?.title;

    const insertSchemas = useMemo(
        () => ribbon.find((group) => group.key === RibbonPosition.INSERT)?.children?.flatMap((group) => group.children ?? []) ?? [],
        [ribbon]
    );
    const dataSchemas = useMemo(
        () => ribbon.find((group) => group.key === RibbonPosition.DATA)?.children?.flatMap((group) => group.children ?? []) ?? [],
        [ribbon]
    );
    const styleGroups = useMemo(() => {
        const startGroups = ribbon.find((group) => group.key === RibbonPosition.START)?.children ?? [];
        return startGroups.filter((group) =>
            group.key === RibbonStartGroup.FORMAT ||
            group.key === RibbonStartGroup.LAYOUT ||
            group.key === RibbonStartGroup.NUMBER
        );
    }, [ribbon]);
    const createNavigationHandler = useCallback((source: MobileMenuSource) => (
        navigation: { title?: string; onBack: () => void } | null
    ) => {
        setMenuNavigation((current) => navigation
            ? { ...navigation, source }
            : current?.source === source ? null : current);
    }, []);
    const handleInsertNavigation = useMemo(() => createNavigationHandler('insert'), [createNavigationHandler]);
    const handleDataNavigation = useMemo(() => createNavigationHandler('data'), [createNavigationHandler]);
    const handleOperationNavigation = useMemo(() => createNavigationHandler('operation'), [createNavigationHandler]);

    const ensureActiveCellVisible = useCallback(async (safeBottom: number, center = false) => {
        editorBridgeService.refreshEditCellPosition(false);
        const state = editorBridgeService.getEditCellState();
        const selectionRange = selectionManagerService.getCurrentLastSelection()?.range;
        if (!state && !selectionRange) return;

        if (state) {
            const cellTop = state.canvasOffset.top + state.position.startY;
            const cellBottom = state.canvasOffset.top + state.position.endY;
            const safeTop = state.canvasOffset.top + MOBILE_CELL_SAFE_PADDING;
            const targetBottom = safeBottom - MOBILE_CELL_SAFE_PADDING;
            const offsetY = center
                ? getMobileCellCenterOffset(cellTop, cellBottom, safeTop, targetBottom)
                : getMobileCellRevealOffset(cellTop, cellBottom, safeTop, targetBottom);
            if (offsetY === 0) return;

            await commandService.executeCommand(SetScrollRelativeCommand.id, { offsetY });
            editorBridgeService.refreshEditCellPosition(false);
            return;
        }

        const workbookModel = workbook;
        const sheet = workbookModel?.getActiveSheet();
        if (!workbookModel || !sheet || !selectionRange) return;
        const { ySplit } = sheet.getFreeze();
        await commandService.executeCommand(ScrollCommand.id, {
            unitId: workbookModel.getUnitId(),
            sheetId: sheet.getSheetId(),
            sheetViewStartRow: Math.max(0, selectionRange.startRow - ySplit),
            offsetY: 0,
        });
        editorBridgeService.refreshEditCellPosition(false);
    }, [commandService, editorBridgeService, selectionManagerService, workbook]);

    useEffect(() => {
        if (!editing) return undefined;

        const visualViewport = window.visualViewport;
        let frame = 0;
        const revealEditingCell = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const visibleBottom = visualViewport
                    ? visualViewport.offsetTop + visualViewport.height
                    : window.innerHeight;
                ensureActiveCellVisible(visibleBottom - 48, keyboardVisible).catch(() => undefined);
            });
        };
        revealEditingCell();
        visualViewport?.addEventListener('resize', revealEditingCell);
        const selectionSubscription = selectionManagerService.selectionMoveEnd$.subscribe(revealEditingCell);

        return () => {
            cancelAnimationFrame(frame);
            visualViewport?.removeEventListener('resize', revealEditingCell);
            selectionSubscription.unsubscribe();
        };
    }, [editing, ensureActiveCellVisible, keyboardVisible, selectionManagerService]);

    useEffect(() => {
        if (!toolsOpen || drawerSnap === 'expanded') return undefined;

        const frame = requestAnimationFrame(() => {
            const panelTop = panelRef.current?.getBoundingClientRect().top;
            if (panelTop != null) {
                ensureActiveCellVisible(panelTop).catch(() => undefined);
            }
        });
        return () => cancelAnimationFrame(frame);
    }, [drawerSnap, ensureActiveCellVisible, toolsOpen]);

    useEffect(() => {
        if (contentRef.current) contentRef.current.scrollTop = 0;
    }, [activeTab, menuNavigation?.title, styleViewStack.length]);

    if (!workbook || focusingDrawing) {
        return null;
    }

    function closeTools() {
        setToolsOpen(false);
        setDrawerSnap('compact');
        setStyleViewStack([]);
        setMenuNavigation(null);
    }

    async function openTools() {
        if (editing) {
            await commandService.executeCommand(SetCellEditVisibleOperation.id, {
                visible: false,
                eventType: DeviceInputEventType.PointerDown,
                unitId: workbook!.getUnitId(),
            });
        }
        contextService.setContextValue(EDITOR_ACTIVATED, false);
        contextService.setContextValue(FOCUSING_FX_BAR_EDITOR, false);
        ensureSelectionPrimary();
        setDrawerSnap('compact');
        setToolsOpen(true);
    }

    function ensureSelectionPrimary() {
        const selections = selectionManagerService.getCurrentSelections();
        const normalized = normalizeMobileSelectionPrimary(selections, workbook!.getActiveSheet());
        if (normalized) selectionManagerService.setSelections(normalized);
    }

    function openKeyboard() {
        closeTools();
        layoutService.focus();
        if (editing) {
            contextService.setContextValue(FOCUSING_FX_BAR_EDITOR, true);
            editorService.focus(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
            return;
        }

        commandService.executeCommand(SetCellEditVisibleOperation.id, {
            visible: true,
            eventType: DeviceInputEventType.Dblclick,
            unitId: workbook!.getUnitId(),
        }).catch(() => undefined);
    }

    function executeMenuItem(params: IValueOption | IMobileStyleCommand) {
        const command = getMobileMenuCommand(params);
        if (!command) {
            return;
        }

        ensureSelectionPrimary();
        commandService.executeCommand(command.commandId, command.commandParams);
    }

    if (overlaysSuspended) {
        return null;
    }

    if (editing) {
        return (
            <button
                type="button"
                aria-label={localeService.t<LocaleKey>('sheets-ui.mobile.openTools')}
                className={clsx(resetButtonClassName, `
                  univer-pointer-events-auto univer-absolute univer-right-4 univer-z-30 univer-flex univer-size-12
                  univer-items-center univer-justify-center univer-rounded-full univer-bg-primary-600 univer-text-xl
                  univer-text-gray-0 univer-shadow-lg univer-transition-[bottom] univer-duration-150
                  active:univer-bg-primary-700
                `)}
                style={{
                    bottom: `calc(var(--univer-mobile-keyboard-inset, 0px) + ${getMobileEditingMenuBottomOffset(formulaOperatorsVisible)}px)`,
                }}
                onClick={() => openTools().catch(() => undefined)}
            >
                <MenuIcon />
            </button>
        );
    }

    if (!toolsOpen) {
        return (
            <div
                className="
                  univer-pointer-events-none univer-absolute univer-bottom-14 univer-right-4 univer-z-20 univer-flex
                  univer-gap-2
                "
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
                <button
                    type="button"
                    aria-label={localeService.t<LocaleKey>('sheets-ui.shortcut.sheet.start-editing')}
                    className={clsx(resetButtonClassName, `
                      univer-pointer-events-auto univer-flex univer-size-12 univer-items-center univer-justify-center
                      univer-rounded-full univer-bg-gray-0 univer-text-xl univer-text-primary-600 univer-shadow-lg
                      active:univer-bg-gray-100
                      dark:!univer-bg-gray-800 dark:!univer-text-primary-400
                      dark:active:!univer-bg-gray-700
                    `)}
                    onClick={openKeyboard}
                >
                    <KeyboardIcon />
                </button>
                <button
                    type="button"
                    aria-label={localeService.t<LocaleKey>('sheets-ui.mobile.openTools')}
                    className={clsx(resetButtonClassName, `
                      univer-pointer-events-auto univer-flex univer-size-12 univer-items-center univer-justify-center
                      univer-rounded-full univer-bg-primary-600 univer-text-xl univer-text-gray-0 univer-shadow-lg
                      active:univer-bg-primary-700
                    `)}
                    onClick={() => openTools().catch(() => undefined)}
                >
                    <MenuIcon />
                </button>
            </div>
        );
    }

    return (
        <MobileDrawer
            panelRef={panelRef}
            contentRef={contentRef}
            componentName="mobile-sheet-action-panel"
            snap={drawerSnap}
            expandLabel={localeService.t<LocaleKey>('sheets-ui.mobile.openTools')}
            collapseLabel={localeService.t<LocaleKey>('sheets-ui.mobile.closeTools')}
            onSnapChange={setDrawerSnap}
            onClose={closeTools}
            floatingActions={(
                <button
                    type="button"
                    aria-label={localeService.t<LocaleKey>('sheets-ui.shortcut.sheet.start-editing')}
                    className={clsx(resetButtonClassName, `
                      univer-pointer-events-auto univer-flex univer-size-12 univer-items-center univer-justify-center
                      univer-rounded-full univer-bg-gray-0 univer-text-xl univer-text-primary-600 univer-shadow-lg
                      active:univer-bg-gray-100
                      dark:!univer-bg-gray-800 dark:!univer-text-primary-400
                      dark:active:!univer-bg-gray-700
                    `)}
                    onClick={openKeyboard}
                >
                    <KeyboardIcon />
                </button>
            )}
            header={nestedTitle
                ? (
                    <div
                        className="
                          univer-grid univer-h-12 univer-flex-1 univer-grid-cols-[56px_minmax(0,1fr)_56px]
                          univer-items-center univer-px-2
                        "
                    >
                        <button
                            type="button"
                            aria-label={localeService.t<LocaleKey>('sheets-ui.mobile.back')}
                            className={clsx(resetButtonClassName, `
                              univer-flex univer-size-12 univer-items-center univer-justify-center univer-rounded-full
                              univer-text-gray-700
                              active:univer-bg-gray-100
                              dark:!univer-text-gray-300
                              dark:active:!univer-bg-gray-700
                              [&>svg]:univer-size-6
                            `)}
                            onClick={() => currentStyleView
                                ? setStyleViewStack((stack) => stack.slice(0, -1))
                                : menuNavigation?.onBack()}
                        >
                            <MoreLeftIcon />
                        </button>
                        <div
                            className="
                              univer-truncate univer-text-center univer-text-sm univer-font-semibold
                              univer-text-gray-900
                              dark:!univer-text-gray-100
                            "
                        >
                            {nestedTitle}
                        </div>
                    </div>
                )
                : (
                    <div className="univer-grid univer-h-10 univer-flex-1 univer-grid-cols-3">
                        {MOBILE_SHEET_PANEL_TABS.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                role="tab"
                                aria-selected={activeTab === tab.key}
                                className={clsx(resetButtonClassName, `
                                  univer-relative univer-flex univer-min-h-10 univer-items-center univer-justify-center
                                  univer-text-base univer-font-semibold univer-text-gray-900
                                  dark:!univer-text-gray-100
                                `, {
                                    'univer-text-primary-600 dark:!univer-text-primary-400': activeTab === tab.key,
                                })}
                                onClick={() => {
                                    setActiveTab(tab.key);
                                    setStyleViewStack([]);
                                    setMenuNavigation(null);
                                }}
                            >
                                {localeService.t<LocaleKey>(tab.title)}
                                {activeTab === tab.key && (
                                    <span
                                        className="
                                          univer-absolute univer-bottom-0 univer-h-0.5 univer-w-8 univer-rounded-full
                                          univer-bg-primary-600
                                        "
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                )}
        >
            {activeTab === 'insert' && (
                <MobileMenu
                    schemas={insertSchemas}
                    menuManagerService={menuManagerService}
                    showHeader={false}
                    onNavigationChange={handleInsertNavigation}
                    onOptionSelect={executeMenuItem}
                />
            )}
            {activeTab === 'style' && (
                <MobileStylePanel
                    groups={styleGroups}
                    currentView={currentStyleView}
                    recentColors={recentColors}
                    onOpenView={(view) => {
                        setMenuNavigation(null);
                        setStyleViewStack((stack) => [...stack, view]);
                    }}
                    onBack={() => setStyleViewStack((stack) => stack.slice(0, -1))}
                    onExecute={executeMenuItem}
                    onUseColor={(color) => setRecentColors((colors) => [
                        color,
                        ...colors.filter((item) => item.toUpperCase() !== color.toUpperCase()),
                    ].slice(0, 8))}
                />
            )}
            {activeTab === 'operation' && (
                <div className="univer-grid univer-gap-3">
                    {dataSchemas.length > 0 && (!menuNavigation || menuNavigation.source === 'data') && (
                        <MobileMenu
                            schemas={dataSchemas}
                            menuManagerService={menuManagerService}
                            showHeader={false}
                            onNavigationChange={handleDataNavigation}
                            onOptionSelect={executeMenuItem}
                        />
                    )}
                    {(!menuNavigation || menuNavigation.source === 'operation') && (
                        <MobileMenu
                            schemas={operationSchemas}
                            menuManagerService={menuManagerService}
                            showHeader={false}
                            onNavigationChange={handleOperationNavigation}
                            onOptionSelect={executeMenuItem}
                        />
                    )}
                </div>
            )}
        </MobileDrawer>
    );
}
