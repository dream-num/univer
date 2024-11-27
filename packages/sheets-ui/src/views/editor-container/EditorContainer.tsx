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

import type { IAccessor, Workbook } from '@univerjs/core';
import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY, IContextService, Injector, IUniverInstanceService, UniverInstanceType, useDependency } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';

import { DocSelectionRenderService, IEditorService } from '@univerjs/docs-ui';
import { matchRefDrawToken } from '@univerjs/engine-formula';
import { FIX_ONE_PIXEL_BLUR_OFFSET, IRenderManagerService } from '@univerjs/engine-render';
import { ComponentManager, DISABLE_AUTO_FOCUS_KEY, useObservable } from '@univerjs/ui';
import React, { useEffect, useMemo, useState } from 'react';
import { of } from 'rxjs';
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

function getCurrentBodyDataStreamAndOffset(accssor: IAccessor) {
    const univerInstanceService = accssor.get(IUniverInstanceService);
    const documentModel = univerInstanceService.getCurrentUniverDocInstance();

    if (!documentModel?.getBody()) {
        return;
    }

    const dataStream = documentModel.getBody()?.dataStream ?? '';
    return { dataStream, offset: 0 };
}

function getCurrentChar(accssor: IAccessor) {
    const docSelectionManagerService = accssor.get(DocSelectionManagerService);
    const activeRange = docSelectionManagerService.getActiveTextRange();

    if (activeRange == null) {
        return;
    }

    const { startOffset } = activeRange;

    const config = getCurrentBodyDataStreamAndOffset(accssor);

    if (config == null || startOffset == null) {
        return;
    }

    const dataStream = config.dataStream;

    return dataStream[startOffset - 1 + config.offset];
}
/**
 * Cell editor container.
 * @returns
 */
export const EditorContainer: React.FC<ICellIEditorProps> = () => {
    const [state, setState] = useState({
        ...EDITOR_DEFAULT_POSITION,
    });
    const cellEditorManagerService = useDependency(ICellEditorManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook$ = useMemo(() => univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET), [univerInstanceService]);
    const workbook = useObservable(workbook$);
    const worksheet = useObservable(workbook?.activeSheet$);
    // const editorBridgeService
    const editorService = useDependency(IEditorService);
    const contextService = useDependency(IContextService);
    const componentManager = useDependency(ComponentManager);
    const renderManagerService = useDependency(IRenderManagerService);
    const editorBridgeService = useDependency(IEditorBridgeService);
    const renderer = renderManagerService.getRenderById(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
    const docSelectionRenderService = renderer?.with(DocSelectionRenderService);
    const [selectionFocusing, setSelectionFocusing] = useState(false);
    const visible = useObservable(editorBridgeService.visible$);
    const injector = useDependency(Injector);
    const onFocus$ = useMemo(() => docSelectionRenderService?.onFocus$ ?? of(), [docSelectionRenderService?.onFocus$]);
    const onBlur$ = useMemo(() => docSelectionRenderService?.onBlur$ ?? of(), [docSelectionRenderService?.onBlur$]);
    const textSelections$ = useMemo(() => docSelectionRenderService?.textSelectionInner$ ?? of(), [docSelectionRenderService?.textSelectionInner$]);
    const forceKeepVisible = useObservable(editorBridgeService.forceKeepVisible$);
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

    useEffect(() => {
        const sub1 = onFocus$.subscribe(() => {
            setSelectionFocusing(true);
        });

        const sub2 = onBlur$.subscribe(() => {
            setSelectionFocusing(false);
        });

        return () => {
            sub1.unsubscribe();
            sub2.unsubscribe();
        };
    }, [onBlur$, onFocus$]);

    useEffect(() => {
        const sub = textSelections$.subscribe(() => {
            const char = getCurrentChar(injector);
            const dataStream = getCurrentBodyDataStreamAndOffset(injector)?.dataStream;
            if (dataStream?.substring(0, 1) === '=' && char && matchRefDrawToken(char)) {
                editorBridgeService.enableForceKeepVisible();
            } else {
                editorBridgeService.disableForceKeepVisible();
            }
        });

        return () => sub.unsubscribe();
    }, [editorBridgeService, injector, textSelections$]);
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
                    isFocus={visible?.visible && forceKeepVisible}
                    unitId={editState?.unitId}
                    subUnitId={editState?.sheetId}
                />
            )}
        </div>
    );
};
