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

import type { Nullable } from '@univerjs/core';
import type { KeyCode } from '@univerjs/ui';
import type { ICellEditorState } from '../../services/editor-bridge.service';
import {
    DisposableCollection,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    FOCUSING_FX_BAR_EDITOR,
    ICommandService,
    IContextService,
    Injector,
    IUniverInstanceService,
    ThemeService,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionRenderService, IEditorService } from '@univerjs/docs-ui';
import { DeviceInputEventType } from '@univerjs/engine-render';
import {
    ComponentManager,
    DISABLE_AUTO_FOCUS_KEY,
    MetaKeys,
    useDependency,
    useEvent,
    useObservable,
    useSidebarClick,
} from '@univerjs/ui';
import { useEffect, useRef, useState } from 'react';
import {
    SetCellEditVisibleArrowOperation,
    SetCellEditVisibleOperation,
} from '../../commands/operations/cell-edit.operation';
import { EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY } from '../../common/keys';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import { ICellEditorManagerService } from '../../services/editor/cell-editor-manager.service';
import { SheetCellEditorResizeService } from '../../services/editor/cell-editor-resize.service';
import {
    ISheetEmbedFloatingGeometryService,
    ISheetEmbedInteractionBoundaryService,
    ISheetEmbedRuntimeFocusCoordinator,
    resolveActiveSheetEmbedRuntimeDomScope,
    resolveSheetEmbedRuntimeDomScope,
    SHEET_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE,
    SHEET_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE,
} from '../../services/sheet-embed-integration.service';
import { focusSheetCellEditorElement, registerSheetCellEditorRuntimePortal } from './focus-editor';
import { useKeyEventConfig } from './hooks';

const HIDDEN_EDITOR_POSITION = -1000;

const EDITOR_DEFAULT_POSITION = {
    width: 0,
    height: 0,
    top: HIDDEN_EDITOR_POSITION,
    left: HIDDEN_EDITOR_POSITION,
};

const CELL_EDITOR_DARK_SURFACE_THEME_COLOR = 'gray.800';
const CELL_EDITOR_LIGHT_SURFACE_THEME_COLOR = 'white';

interface ICellEditorHostBackgroundOptions {
    darkMode?: boolean;
    getColorFromTheme?: (color: string) => string | undefined;
}

/**
 * @returns the host background color for the cell editor.
 */
function getCellEditorHostBackgroundColor(
    editState: Nullable<Pick<ICellEditorState, 'documentLayoutObject'>>,
    options: ICellEditorHostBackgroundOptions = {}
): string | undefined {
    const cellFill = editState?.documentLayoutObject.fill;
    if (cellFill && !isTransparentColor(cellFill)) {
        return cellFill;
    }

    return options.getColorFromTheme?.(
        options.darkMode ? CELL_EDITOR_DARK_SURFACE_THEME_COLOR : CELL_EDITOR_LIGHT_SURFACE_THEME_COLOR
    );
}

function isTransparentColor(color: string) {
    const normalizedColor = color.trim().toLowerCase().replace(/\s+/g, '');
    return normalizedColor === 'transparent' || normalizedColor === 'rgba(0,0,0,0)';
}

export function shouldRefocusCellEditorAfterPointerDown(options: {
    root: HTMLElement | null | undefined;
    target: EventTarget | null | undefined;
    activeElement: Element | null | undefined;
    isEditorFocusing: boolean | undefined;
}): boolean {
    const { root, target, activeElement, isEditorFocusing } = options;
    if (!root || !(target instanceof HTMLElement) || !(activeElement instanceof HTMLElement)) {
        return true;
    }

    const owner = root.closest(`[${SHEET_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`);
    const embedId = owner?.getAttribute(SHEET_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE);
    if (!embedId) {
        return true;
    }

    const targetInOwner = target.closest(`[${SHEET_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}="${embedId}"]`) != null;
    const activeOwnerElement = activeElement.closest(`[${SHEET_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}="${embedId}"]`);
    if (targetInOwner && activeOwnerElement && isEmbedRuntimeInteractiveElement(activeElement)) {
        return false;
    }

    if (!isEditorFocusing) {
        return true;
    }

    return target.closest(`[${SHEET_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}="${embedId}"]`) == null ||
        activeOwnerElement == null;
}

function isEmbedRuntimeInteractiveElement(element: HTMLElement): boolean {
    const role = element.getAttribute(SHEET_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE);

    return role === 'child-editor' ||
        role === 'child-popup' ||
        role === 'floating-menu';
}

function shouldPreserveEmbedPopupFocus(embedId: string | undefined, ownerDocument: Document): boolean {
    if (!embedId) {
        return false;
    }

    const activeElement = ownerDocument.activeElement;
    if (!(activeElement instanceof HTMLElement)) {
        return false;
    }

    const ownerElement = activeElement.closest(`[${SHEET_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}="${embedId}"]`);
    if (!ownerElement) {
        return false;
    }

    const role = activeElement.getAttribute(SHEET_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE) ??
        activeElement.closest(`[${SHEET_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE}]`)?.getAttribute(SHEET_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE);

    return role === 'child-popup' || role === 'floating-menu';
}

function shouldPreserveEmbedInteractiveFocus(embedId: string | undefined, ownerDocument: Document): boolean {
    if (!embedId) {
        return false;
    }

    const activeElement = ownerDocument.activeElement;
    if (!(activeElement instanceof HTMLElement)) {
        return false;
    }

    const ownerElement = activeElement.closest(`[${SHEET_EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}="${embedId}"]`);
    if (!ownerElement) {
        return false;
    }

    const role = activeElement.getAttribute(SHEET_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE) ??
        activeElement.closest(`[${SHEET_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE}]`)?.getAttribute(SHEET_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE);

    return (role == null && activeElement.tagName !== 'CANVAS') ||
        role === 'child-editor' ||
        role === 'child-popup' ||
        role === 'floating-menu';
}

function isEmbedRuntimeEditorOrPopup(target: EventTarget | null | undefined): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    const role = target.getAttribute(SHEET_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE) ??
        target.closest(`[${SHEET_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE}]`)?.getAttribute(SHEET_EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE);

    return role === 'child-editor' || role === 'child-popup' || role === 'floating-menu';
}

/**
 * Cell editor container.
 * @returns the rendered cell editor container.
 */
export function EditorContainer() {
    const [state, setState] = useState({
        ...EDITOR_DEFAULT_POSITION,
    });
    const cellEditorManagerService = useDependency(ICellEditorManagerService);
    const injector = useDependency(Injector);
    const editorService = useDependency(IEditorService);
    const instanceService = useDependency(IUniverInstanceService);
    const contextService = useDependency(IContextService);
    const themeService = useDependency(ThemeService);
    const componentManager = useDependency(ComponentManager);
    const editorBridgeService = useDependency(IEditorBridgeService);
    const cellEditorResizeService = useDependency(SheetCellEditorResizeService);
    const rootRef = useRef<HTMLDivElement>(null);
    const pointerRefocusTimerRef = useRef<number | undefined>(undefined);
    const visible = useObservable(editorBridgeService.visible$);
    const [runtimeFocusRevision, setRuntimeFocusRevision] = useState(0);
    const commandService = useDependency(ICommandService);
    const disableAutoFocus = useObservable(
        () => contextService.subscribeContextValue$(DISABLE_AUTO_FOCUS_KEY),
        false,
        undefined,
        [contextService, DISABLE_AUTO_FOCUS_KEY]
    );
    const FormulaEditor = componentManager.get(EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY);
    const editState = useObservable(editorBridgeService.currentEditCellState$);
    const darkMode = useObservable(themeService.darkMode$, themeService.darkMode);

    useEffect(() => {
        const sub = cellEditorManagerService.state$.subscribe((param) => {
            if (param == null) {
                return;
            }

            const {
                startX = HIDDEN_EDITOR_POSITION,
                startY = HIDDEN_EDITOR_POSITION,
                endX = 0,
                endY = 0,
                show = false,
            } = param;

            if (!show) {
                setState({
                    ...EDITOR_DEFAULT_POSITION,
                });
            } else {
                setState({
                    width: endX - startX,
                    height: endY - startY,
                    left: startX,
                    top: startY,
                });

                const editor = editorService.getEditor(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);

                if (editor == null) {
                    return;
                }

                const { left, top, width, height } = editor.getBoundingClientRect();

                cellEditorManagerService.setRect({ left, top, width, height });
            }
        });
        return () => {
            sub.unsubscribe();
        };
    }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

    useEffect(() => {
        if (!injector.has(ISheetEmbedFloatingGeometryService)) {
            return undefined;
        }

        const geometryService = injector.get(ISheetEmbedFloatingGeometryService);
        const subscription = geometryService.geometryInvalidated$.subscribe(() => {
            cellEditorResizeService.resizeCellEditor();
        });

        return () => subscription.unsubscribe();
    }, [cellEditorResizeService, injector]);

    useEffect(() => {
        if (!injector.has(ISheetEmbedRuntimeFocusCoordinator)) {
            return undefined;
        }

        const subscription = injector.get(ISheetEmbedRuntimeFocusCoordinator).runtimeSessionChanged$.subscribe(() => {
            setRuntimeFocusRevision((revision) => revision + 1);
        });

        return () => subscription.unsubscribe();
    }, [injector]);

    useEffect(() => {
        if (!disableAutoFocus) {
            cellEditorManagerService.setFocus(true);
        }
    }, [disableAutoFocus, state]);

    useEffect(() => {
        if (!visible?.visible) {
            return;
        }

        cellEditorResizeService.fitTextSize();
        if (contextService.getContextValue(FOCUSING_FX_BAR_EDITOR)) {
            return;
        }

        const ownerDocument = rootRef.current?.ownerDocument ?? document;
        const ownerWindow = ownerDocument.defaultView ?? window;
        let focusRetryFrame = 0;
        let finalFocusRetryFrame = 0;
        let delayedFocusTimer: number | undefined;
        const focusCellEditorElement = () => {
            const scope = rootRef.current
                ? resolveSheetEmbedRuntimeDomScope(rootRef.current) ?? resolveActiveSheetEmbedRuntimeDomScope(ownerDocument)
                : resolveActiveSheetEmbedRuntimeDomScope(ownerDocument);
            if (shouldPreserveEmbedInteractiveFocus(scope?.embedId, ownerDocument)) {
                return;
            }

            focusSheetCellEditorElement(ownerDocument);
            if (delayedFocusTimer != null) {
                ownerWindow.clearTimeout(delayedFocusTimer);
            }
            delayedFocusTimer = ownerWindow.setTimeout(() => {
                delayedFocusTimer = undefined;
                if (shouldPreserveEmbedInteractiveFocus(scope?.embedId, ownerDocument)) {
                    return;
                }
                focusSheetCellEditorElement(ownerDocument);
            }, 0);
        };
        const focusEditor = () => {
            if (contextService.getContextValue(FOCUSING_FX_BAR_EDITOR)) {
                return;
            }

            const scope = rootRef.current
                ? resolveSheetEmbedRuntimeDomScope(rootRef.current) ?? resolveActiveSheetEmbedRuntimeDomScope(ownerDocument)
                : resolveActiveSheetEmbedRuntimeDomScope(ownerDocument);
            if (shouldPreserveEmbedPopupFocus(scope?.embedId, ownerDocument)) {
                return;
            }

            const editor = editorService.getEditor(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
            const docSelectionRenderService = editor?.render.with(DocSelectionRenderService);

            if (!docSelectionRenderService?.isFocusing) {
                docSelectionRenderService?.focus();
            }

            focusCellEditorElement();
        };

        focusEditor();
        focusRetryFrame = requestAnimationFrame(() => {
            focusEditor();
            finalFocusRetryFrame = requestAnimationFrame(focusEditor);
        });

        return () => {
            cancelAnimationFrame(focusRetryFrame);
            cancelAnimationFrame(finalFocusRetryFrame);
            if (delayedFocusTimer != null) {
                ownerWindow.clearTimeout(delayedFocusTimer);
            }
        };
    }, [cellEditorResizeService, editorService, visible?.visible]);

    useEffect(() => {
        if (!visible?.visible || !rootRef.current || !injector.has(ISheetEmbedRuntimeFocusCoordinator)) {
            return undefined;
        }

        const focusCoordinator = injector.get(ISheetEmbedRuntimeFocusCoordinator);
        const focusedUnitId = instanceService.getFocusedUnit()?.getUnitId();
        const rootRuntimeScope = resolveSheetEmbedRuntimeDomScope(rootRef.current);
        const unitRuntimeScope = [editState?.unitId, visible.unitId, focusedUnitId]
            .map((unitId) => focusCoordinator.resolveRuntimeScopeByChildUnitId(unitId))
            .find((resolvedScope) => resolvedScope != null);
        if (rootRuntimeScope && unitRuntimeScope && rootRuntimeScope.embedId !== unitRuntimeScope.embedId) {
            return undefined;
        }

        const activeSessionScope = focusCoordinator.resolveActiveChildSessionRuntimeScope();
        const explicitRuntimeScope = unitRuntimeScope ?? rootRuntimeScope;
        if (activeSessionScope && rootRuntimeScope && !unitRuntimeScope && rootRuntimeScope.embedId !== activeSessionScope.embedId) {
            return undefined;
        }

        const scope = explicitRuntimeScope ??
            activeSessionScope ??
            resolveActiveSheetEmbedRuntimeDomScope(rootRef.current.ownerDocument);
        if (!scope) {
            return undefined;
        }

        const collection = new DisposableCollection();
        const interactionBoundaryService = injector.has(ISheetEmbedInteractionBoundaryService)
            ? injector.get(ISheetEmbedInteractionBoundaryService)
            : undefined;
        const editorRoot = rootRef.current;
        collection.add(focusCoordinator.acquireLease({
            embedId: scope.embedId,
            role: 'child-editor',
            owner: 'sheet-cell-editor',
            hostUnitId: scope.hostUnitId,
            childUnitId: scope.childUnitId,
            associatedChildUnitIds: [DOCS_NORMAL_EDITOR_UNIT_ID_KEY],
        }));
        if (interactionBoundaryService) {
            collection.add(interactionBoundaryService.registerOwnedElement(scope.embedId, editorRoot));
        }
        collection.add(focusCoordinator.registerElement({
            embedId: scope.embedId,
            role: 'child-editor',
            element: editorRoot,
        }));
        collection.add(registerSheetCellEditorRuntimePortal({
            embedId: scope.embedId,
            ownerDocument: rootRef.current.ownerDocument,
            interactionBoundaryService,
            focusCoordinator,
        }));
        if (scope.childType === UniverInstanceType.UNIVER_SHEET && scope.childUnitId) {
            const ownerDocument = rootRef.current.ownerDocument;
            let pointerRetryFrame = 0;
            const focusEditor = () => {
                if (contextService.getContextValue(FOCUSING_FX_BAR_EDITOR) || shouldPreserveEmbedPopupFocus(scope.embedId, ownerDocument)) {
                    return;
                }

                const editor = editorService.getEditor(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
                const docSelectionRenderService = editor?.render.with(DocSelectionRenderService);

                if (!docSelectionRenderService?.isFocusing) {
                    docSelectionRenderService?.focus();
                }

                focusSheetCellEditorElement(ownerDocument);
            };
            const refocusEditorAfterRuntimePointer = (event: PointerEvent | MouseEvent) => {
                if (!focusCoordinator.isChildUnitRuntimeEvent(scope.childUnitId, event.target, event) || isEmbedRuntimeEditorOrPopup(event.target)) {
                    return;
                }

                cancelAnimationFrame(pointerRetryFrame);
                pointerRetryFrame = requestAnimationFrame(focusEditor);
            };
            ownerDocument.addEventListener('pointerdown', refocusEditorAfterRuntimePointer, true);
            ownerDocument.addEventListener('pointerup', refocusEditorAfterRuntimePointer, true);
            ownerDocument.addEventListener('click', refocusEditorAfterRuntimePointer, true);
            collection.add(toDisposable(() => {
                cancelAnimationFrame(pointerRetryFrame);
                ownerDocument.removeEventListener('pointerdown', refocusEditorAfterRuntimePointer, true);
                ownerDocument.removeEventListener('pointerup', refocusEditorAfterRuntimePointer, true);
                ownerDocument.removeEventListener('click', refocusEditorAfterRuntimePointer, true);
            }));
        }

        return () => collection.dispose();
    }, [contextService, editState?.unitId, editorService, injector, instanceService, runtimeFocusRevision, visible?.unitId, visible?.visible]);

    useEffect(() => {
        if (visible?.visible || !injector.has(ISheetEmbedRuntimeFocusCoordinator)) {
            return undefined;
        }

        const focusCoordinator = injector.get(ISheetEmbedRuntimeFocusCoordinator);
        const activeSessionScope = focusCoordinator.resolveActiveChildSessionRuntimeScope();
        const childUnitId = activeSessionScope?.childUnitId;
        if (
            !activeSessionScope ||
            activeSessionScope.childType !== UniverInstanceType.UNIVER_SHEET ||
            !childUnitId ||
            !instanceService.getUnit(childUnitId, UniverInstanceType.UNIVER_SHEET)
        ) {
            return undefined;
        }

        const ownerDocument = rootRef.current?.ownerDocument ?? document;
        const interactionBoundaryService = injector.has(ISheetEmbedInteractionBoundaryService)
            ? injector.get(ISheetEmbedInteractionBoundaryService)
            : undefined;
        const portalRegistration = registerSheetCellEditorRuntimePortal({
            embedId: activeSessionScope.embedId,
            ownerDocument,
            interactionBoundaryService,
            focusCoordinator,
        });
        const ownerWindow = ownerDocument.defaultView ?? window;
        let delayedFocusTimer: number | undefined;
        const focusCellEditorElement = () => {
            if (shouldPreserveEmbedInteractiveFocus(activeSessionScope.embedId, ownerDocument)) {
                return;
            }

            focusSheetCellEditorElement(ownerDocument);
            if (delayedFocusTimer != null) {
                ownerWindow.clearTimeout(delayedFocusTimer);
            }
            delayedFocusTimer = ownerWindow.setTimeout(() => {
                delayedFocusTimer = undefined;
                if (shouldPreserveEmbedInteractiveFocus(activeSessionScope.embedId, ownerDocument)) {
                    return;
                }
                focusSheetCellEditorElement(ownerDocument);
            }, 0);
        };
        const focusHiddenEditor = () => {
            if (shouldPreserveEmbedPopupFocus(activeSessionScope.embedId, ownerDocument)) {
                return;
            }

            const editor = editorService.getEditor(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
            const docSelectionRenderService = editor?.render.with(DocSelectionRenderService);
            if (!docSelectionRenderService?.isFocusing) {
                docSelectionRenderService?.focus();
            }

            focusCellEditorElement();
        };
        let retryFrame = 0;
        let finalRetryFrame = 0;
        let pointerRetryFrame = 0;

        focusHiddenEditor();
        retryFrame = requestAnimationFrame(() => {
            focusHiddenEditor();
            finalRetryFrame = requestAnimationFrame(focusHiddenEditor);
        });
        const refocusHiddenEditorAfterRuntimePointer = (event: PointerEvent | MouseEvent) => {
            if (!focusCoordinator.isChildUnitRuntimeEvent(childUnitId, event.target, event) || isEmbedRuntimeEditorOrPopup(event.target)) {
                return;
            }

            cancelAnimationFrame(pointerRetryFrame);
            pointerRetryFrame = requestAnimationFrame(focusHiddenEditor);
        };
        ownerDocument.addEventListener('pointerdown', refocusHiddenEditorAfterRuntimePointer, true);
        ownerDocument.addEventListener('pointerup', refocusHiddenEditorAfterRuntimePointer, true);
        ownerDocument.addEventListener('click', refocusHiddenEditorAfterRuntimePointer, true);

        return () => {
            cancelAnimationFrame(retryFrame);
            cancelAnimationFrame(finalRetryFrame);
            cancelAnimationFrame(pointerRetryFrame);
            if (delayedFocusTimer != null) {
                ownerWindow.clearTimeout(delayedFocusTimer);
            }
            ownerDocument.removeEventListener('pointerdown', refocusHiddenEditorAfterRuntimePointer, true);
            ownerDocument.removeEventListener('pointerup', refocusHiddenEditorAfterRuntimePointer, true);
            ownerDocument.removeEventListener('click', refocusHiddenEditorAfterRuntimePointer, true);
            portalRegistration.dispose();
        };
    }, [editorService, injector, instanceService, runtimeFocusRevision, visible?.visible]);

    useEffect(() => {
        return () => {
            const ownerWindow = rootRef.current?.ownerDocument.defaultView;
            if (ownerWindow && pointerRefocusTimerRef.current != null) {
                ownerWindow.clearTimeout(pointerRefocusTimerRef.current);
            }
        };
    }, []);

    const refocusEditorAfterPointerDown = useEvent((event: React.PointerEvent<HTMLDivElement>) => {
        if (!visible?.visible) {
            return;
        }

        const ownerDocument = rootRef.current?.ownerDocument ?? document;
        const ownerWindow = ownerDocument.defaultView ?? window;
        const editor = editorService.getEditor(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        const docSelectionRenderService = editor?.render.with(DocSelectionRenderService);
        const pointerTarget = event.target;
        const activeElementAtPointerDown = ownerDocument.activeElement;
        if (!shouldRefocusCellEditorAfterPointerDown({
            root: rootRef.current,
            target: pointerTarget,
            activeElement: activeElementAtPointerDown,
            isEditorFocusing: docSelectionRenderService?.isFocusing,
        })) {
            return;
        }

        if (pointerRefocusTimerRef.current != null) {
            ownerWindow.clearTimeout(pointerRefocusTimerRef.current);
        }

        pointerRefocusTimerRef.current = ownerWindow.setTimeout(() => {
            pointerRefocusTimerRef.current = undefined;
            if (!docSelectionRenderService?.isFocusing) {
                docSelectionRenderService?.focus();
            }

            focusSheetCellEditorElement(ownerDocument);
        }, 0);
    });

    const handleClickSideBar = useEvent(() => {
        if (editorBridgeService.isVisible().visible) {
            commandService.executeCommand(SetCellEditVisibleOperation.id, {
                visible: false,
                eventType: DeviceInputEventType.PointerUp,
                unitId: editState?.unitId,
            });
        }
    });

    useSidebarClick(handleClickSideBar);

    const keyCodeConfig = useKeyEventConfig(editState?.unitId);

    const onMoveInEditor = useEvent((keycode: KeyCode, metaKey: MetaKeys) => {
        commandService.executeCommand(SetCellEditVisibleArrowOperation.id, {
            keycode,
            visible: false,
            eventType: DeviceInputEventType.Keyboard,
            isShift: metaKey === MetaKeys.SHIFT || metaKey === (MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT),
            unitId: editState?.unitId,
        });
    });

    return (
        <div
            ref={rootRef}
            data-u-comp="editor"
            className="univer-absolute univer-z-10 univer-flex"
            onPointerDownCapture={refocusEditorAfterPointerDown}
            style={{
                left: state.left,
                top: state.top,
                width: state.width,
                height: state.height,
                backgroundColor: getCellEditorHostBackgroundColor(editState, {
                    darkMode,
                    getColorFromTheme: themeService.getColorFromTheme.bind(themeService),
                }),
            }}
        >
            {FormulaEditor && (
                <FormulaEditor
                    editorId={DOCS_NORMAL_EDITOR_UNIT_ID_KEY}
                    className={`
                      univer-relative univer-flex univer-size-full
                      [&_canvas]:univer-absolute
                    `}
                    initValue=""
                    onChange={() => {}}
                    isFocus={visible?.visible}
                    unitId={editState?.unitId}
                    subUnitId={editState?.sheetId}
                    keyboardEventConfig={keyCodeConfig}
                    onMoveInEditor={onMoveInEditor}
                    isSupportAcrossSheet
                    resetSelectionOnBlur={false}
                    isSingle={false}
                    autoScrollbar={false}
                    onFormulaSelectingChange={(isSelecting: 0 | 1 | 2) => {
                        if (isSelecting) {
                            editorBridgeService.enableForceKeepVisible();
                        } else {
                            editorBridgeService.disableForceKeepVisible();
                        }
                    }}
                    disableContextMenu={false}
                    canvasStyle={{ backgroundColor: 'transparent' }}
                />
            )}
        </div>
    );
};
