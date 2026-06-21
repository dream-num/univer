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
import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY, ICommandService, IContextService, Injector, ThemeService } from '@univerjs/core';
import { DocSelectionRenderService, IEditorService } from '@univerjs/docs-ui';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { EmbedFloatingGeometryService } from '@univerjs/embed-ui';
import { ComponentManager, DISABLE_AUTO_FOCUS_KEY, MetaKeys, useDependency, useEvent, useObservable, useSidebarClick } from '@univerjs/ui';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { SetCellEditVisibleArrowOperation, SetCellEditVisibleOperation } from '../../commands/operations/cell-edit.operation';
import { EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY } from '../../common/keys';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import { ICellEditorManagerService } from '../../services/editor/cell-editor-manager.service';
import { SheetCellEditorResizeService } from '../../services/editor/cell-editor-resize.service';
import { focusSheetCellEditorElement } from './focus-editor';
import { useKeyEventConfig } from './hooks';

interface ICellIEditorProps { }

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

/**
 * Cell editor container.
 * @returns the rendered cell editor container.
 */
export const EditorContainer: React.FC<ICellIEditorProps> = () => {
    const [state, setState] = useState({
        ...EDITOR_DEFAULT_POSITION,
    });
    const cellEditorManagerService = useDependency(ICellEditorManagerService);
    const injector = useDependency(Injector);
    const editorService = useDependency(IEditorService);
    const contextService = useDependency(IContextService);
    const themeService = useDependency(ThemeService);
    const componentManager = useDependency(ComponentManager);
    const editorBridgeService = useDependency(IEditorBridgeService);
    const cellEditorResizeService = useDependency(SheetCellEditorResizeService);
    const visible = useObservable(editorBridgeService.visible$);
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
        if (!injector.has(EmbedFloatingGeometryService)) {
            return undefined;
        }

        const geometryService = injector.get(EmbedFloatingGeometryService);
        const subscription = geometryService.geometryInvalidated$.subscribe(() => {
            cellEditorResizeService.resizeCellEditor();
        });

        return () => subscription.unsubscribe();
    }, [cellEditorResizeService, injector]);

    useEffect(() => {
        if (!disableAutoFocus) {
            cellEditorManagerService.setFocus(true);
        }
    }, [disableAutoFocus, state]);

    useEffect(() => {
        if (!visible?.visible) {
            return;
        }

        let focusRetryFrame = 0;
        let finalFocusRetryFrame = 0;
        const focusRetryTimers: number[] = [];

        const focusEditor = () => {
            const editor = editorService.getEditor(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
            const docSelectionRenderService = editor?.render.with(DocSelectionRenderService);

            if (!docSelectionRenderService?.isFocusing) {
                docSelectionRenderService?.focus();
            }

            focusSheetCellEditorElement();
        };

        focusEditor();
        focusRetryFrame = requestAnimationFrame(() => {
            focusEditor();
            finalFocusRetryFrame = requestAnimationFrame(focusEditor);
        });
        [0, 80, 200, 500, 1000].forEach((delay) => {
            focusRetryTimers.push(window.setTimeout(focusEditor, delay));
        });

        return () => {
            cancelAnimationFrame(focusRetryFrame);
            cancelAnimationFrame(finalFocusRetryFrame);
            focusRetryTimers.forEach((timer) => window.clearTimeout(timer));
        };
    }, [editorService, visible?.visible]);

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
            className="univer-absolute univer-z-10 univer-flex"
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
                    onFormulaSelectingChange={(isSelecting: 0 | 1 | 2, isFocusing: boolean) => {
                        if (!isFocusing) return;
                        if (isSelecting) {
                            editorBridgeService.enableForceKeepVisible();
                        } else {
                            editorBridgeService.disableForceKeepVisible();
                        }
                    }}
                    disableSelectionOnClick
                    disableContextMenu={false}
                    canvasStyle={{ backgroundColor: 'transparent' }}
                />
            )}
        </div>
    );
};
