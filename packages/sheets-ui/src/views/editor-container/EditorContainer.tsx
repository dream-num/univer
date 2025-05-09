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

import type { KeyCode } from '@univerjs/ui';
import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY, ICommandService, IContextService } from '@univerjs/core';
import { borderClassName, clsx } from '@univerjs/design';
import { IEditorService } from '@univerjs/docs-ui';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { ComponentManager, DISABLE_AUTO_FOCUS_KEY, MetaKeys, useDependency, useEvent, useObservable, useSidebarClick } from '@univerjs/ui';
import React, { useEffect, useRef, useState } from 'react';

import { SetCellEditVisibleArrowOperation, SetCellEditVisibleOperation } from '../../commands/operations/cell-edit.operation';
import { EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY } from '../../common/keys';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import { ICellEditorManagerService } from '../../services/editor/cell-editor-manager.service';
import { useKeyEventConfig } from './hooks';

interface ICellIEditorProps { }

const HIDDEN_EDITOR_POSITION = -1000;

const EDITOR_DEFAULT_POSITION = {
    width: 0,
    height: 0,
    top: HIDDEN_EDITOR_POSITION,
    left: HIDDEN_EDITOR_POSITION,
};

/**
 * Cell editor container.
 * @returns
 */
export const EditorContainer: React.FC<ICellIEditorProps> = () => {
    const [state, setState] = useState({
        ...EDITOR_DEFAULT_POSITION,
    });
    const cellEditorManagerService = useDependency(ICellEditorManagerService);
    const editorService = useDependency(IEditorService);
    const contextService = useDependency(IContextService);
    const componentManager = useDependency(ComponentManager);
    const editorBridgeService = useDependency(IEditorBridgeService);
    const visible = useObservable(editorBridgeService.visible$);
    const commandService = useDependency(ICommandService);
    const isRefSelecting = useRef<0 | 1 | 2>(0);
    const disableAutoFocus = useObservable(
        () => contextService.subscribeContextValue$(DISABLE_AUTO_FOCUS_KEY),
        false,
        undefined,
        [contextService, DISABLE_AUTO_FOCUS_KEY]
    );
    const FormulaEditor = componentManager.get(EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY);
    const editState = editorBridgeService.getEditLocation();

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
        if (!disableAutoFocus) {
            cellEditorManagerService.setFocus(true);
        }
    }, [disableAutoFocus, state]);

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

    const keyCodeConfig = useKeyEventConfig(isRefSelecting, editState?.unitId!);

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
            className={clsx(`
              univer-absolute univer-left-[100px] univer-top-[200px] univer-z-10 univer-flex univer-h-[50px]
              univer-w-[100px]
              dark:univer-bg-gray-700
            `, borderClassName)}
            style={{
                left: state.left,
                top: state.top,
                width: state.width,
                height: state.height,
            }}
        >
            {FormulaEditor && (
                <FormulaEditor
                    editorId={DOCS_NORMAL_EDITOR_UNIT_ID_KEY}
                    className={`
                      univer-relative univer-flex univer-h-full univer-w-full
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
                        isRefSelecting.current = isSelecting;
                        if (!isFocusing) return;
                        if (isSelecting) {
                            editorBridgeService.enableForceKeepVisible();
                        } else {
                            editorBridgeService.disableForceKeepVisible();
                        }
                    }}
                    disableSelectionOnClick
                    disableContextMenu={false}
                />
            )}
        </div>
    );
};
