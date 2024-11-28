/**
 * Copyright 2023-present DreamNum Inc.
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

import { Direction, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, ICommandService, IContextService, useDependency } from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { DeviceInputEventType, FIX_ONE_PIXEL_BLUR_OFFSET } from '@univerjs/engine-render';
import { ComponentManager, DISABLE_AUTO_FOCUS_KEY, KeyCode, MetaKeys, useObservable } from '@univerjs/ui';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ExpandSelectionCommand, JumpOver, MoveSelectionCommand } from '../../commands/commands/set-selection.command';
import { SetCellEditVisibleArrowOperation } from '../../commands/operations/cell-edit.operation';
import { EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY } from '../../common/keys';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import { ICellEditorManagerService } from '../../services/editor/cell-editor-manager.service';
import styles from './index.module.less';

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
                    width: endX - startX - FIX_ONE_PIXEL_BLUR_OFFSET + 2,
                    height: endY - startY - FIX_ONE_PIXEL_BLUR_OFFSET + 2,
                    left: startX + FIX_ONE_PIXEL_BLUR_OFFSET,
                    top: startY + FIX_ONE_PIXEL_BLUR_OFFSET,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

    useEffect(() => {
        if (!disableAutoFocus) {
            cellEditorManagerService.setFocus(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [disableAutoFocus, state]);

    const keyCodeConfig = useMemo(() => ({
        keyCodes: [
            { keyCode: KeyCode.ENTER },
            { keyCode: KeyCode.ESC },
            { keyCode: KeyCode.TAB },
            { keyCode: KeyCode.ARROW_DOWN },
            { keyCode: KeyCode.ARROW_LEFT },
            { keyCode: KeyCode.ARROW_RIGHT },
            { keyCode: KeyCode.ARROW_UP },
            { keyCode: KeyCode.ARROW_DOWN, metaKey: MetaKeys.SHIFT },
            { keyCode: KeyCode.ARROW_LEFT, metaKey: MetaKeys.SHIFT },
            { keyCode: KeyCode.ARROW_RIGHT, metaKey: MetaKeys.SHIFT },
            { keyCode: KeyCode.ARROW_UP, metaKey: MetaKeys.SHIFT },
            { keyCode: KeyCode.ARROW_DOWN, metaKey: MetaKeys.CTRL_COMMAND },
            { keyCode: KeyCode.ARROW_LEFT, metaKey: MetaKeys.CTRL_COMMAND },
            { keyCode: KeyCode.ARROW_RIGHT, metaKey: MetaKeys.CTRL_COMMAND },
            { keyCode: KeyCode.ARROW_UP, metaKey: MetaKeys.CTRL_COMMAND },
            { keyCode: KeyCode.ARROW_DOWN, metaKey: MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT },
            { keyCode: KeyCode.ARROW_LEFT, metaKey: MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT },
            { keyCode: KeyCode.ARROW_RIGHT, metaKey: MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT },
            { keyCode: KeyCode.ARROW_UP, metaKey: MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT },
        ],
        handler: (keycode: KeyCode, metaKey?: MetaKeys) => {
            if (keycode === KeyCode.ENTER || keycode === KeyCode.ESC || keycode === KeyCode.TAB) {
                editorBridgeService.changeVisible({
                    visible: false,
                    eventType: DeviceInputEventType.Keyboard,
                    keycode,
                    unitId: editState!.unitId!,
                });
                return;
            }

            let direction = Direction.DOWN;
            if (keycode === KeyCode.ARROW_DOWN) {
                direction = Direction.DOWN;
            } else if (keycode === KeyCode.ARROW_UP) {
                direction = Direction.UP;
            } else if (keycode === KeyCode.ARROW_LEFT) {
                direction = Direction.LEFT;
            } else if (keycode === KeyCode.ARROW_RIGHT) {
                direction = Direction.RIGHT;
            }

            if (isRefSelecting.current) {
                if (metaKey === MetaKeys.CTRL_COMMAND) {
                    commandService.executeCommand(MoveSelectionCommand.id, {
                        direction,
                        jumpOver: JumpOver.moveGap,
                    });
                } else if (metaKey === MetaKeys.SHIFT) {
                    commandService.executeCommand(ExpandSelectionCommand.id, {
                        direction,
                    });
                } else if (metaKey === (MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT)) {
                    commandService.executeCommand(ExpandSelectionCommand.id, {
                        direction,
                        jumpOver: JumpOver.moveGap,
                    });
                } else {
                    commandService.executeCommand(MoveSelectionCommand.id, {
                        direction,
                    });
                }
            } else {
                commandService.executeCommand(SetCellEditVisibleArrowOperation.id, {
                    keycode,
                    visible: false,
                    eventType: DeviceInputEventType.Keyboard,
                    isShift: metaKey === MetaKeys.SHIFT || metaKey === (MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT),
                    unitId: editState?.unitId,
                });
            }
        },
    }), [commandService, editState, editorBridgeService]);

    return (
        <div
            className={styles.editorContainer}
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
                    className={styles.editorInput}
                    isSingle={false}
                    initValue=""
                    onChange={() => {}}
                    isFocus={visible?.visible}
                    unitId={editState?.unitId}
                    subUnitId={editState?.sheetId}
                    moveCursor={false}
                    keyboradEventConfig={keyCodeConfig}
                    onFormulaSelectingChange={(isSelecting: 0 | 1 | 2) => {
                        isRefSelecting.current = isSelecting;
                        if (isSelecting === 1) {
                            editorBridgeService.enableForceKeepVisible();
                        } else {
                            editorBridgeService.disableForceKeepVisible();
                        }
                    }}
                />
            )}
        </div>
    );
};
