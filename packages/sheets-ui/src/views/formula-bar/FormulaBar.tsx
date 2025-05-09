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

import type { Workbook } from '@univerjs/core';
import type { IEditorBridgeServiceVisibleParam } from '../../services/editor-bridge.service';
import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, FOCUSING_FX_BAR_EDITOR, ICommandService, IContextService, IPermissionService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { borderBottomClassName, borderRightClassName, clsx } from '@univerjs/design';
import { IEditorService } from '@univerjs/docs-ui';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { CheckMarkSingle, CloseSingle, DropdownSingle, FxSingle } from '@univerjs/icons';
import { RangeProtectionCache, RangeProtectionRuleModel, SheetsSelectionsService, UnitAction, WorksheetEditPermission, WorksheetProtectionRuleModel, WorksheetViewPermission } from '@univerjs/sheets';
import { ComponentContainer, ComponentManager, KeyCode, useComponentsOfPart, useDependency, useObservable } from '@univerjs/ui';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EMPTY, merge, of, switchMap } from 'rxjs';
import { SetCellEditVisibleOperation } from '../../commands/operations/cell-edit.operation';
import { EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY } from '../../common/keys';
import { SheetsUIPart } from '../../consts/ui-name';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import { IFormulaEditorManagerService } from '../../services/editor/formula-editor-manager.service';
import { DefinedName } from '../defined-name/DefinedName';
import { useKeyEventConfig } from '../editor-container/hooks';

enum ArrowDirection {
    Down,
    Up,
}

interface IProps {
    className?: string;
    disableDefinedName?: boolean;
}

export function FormulaBar(props: IProps) {
    const { className, disableDefinedName } = props;
    const [iconActivated, setIconActivated] = useState<boolean>(false);
    const [arrowDirection, setArrowDirection] = useState<ArrowDirection>(ArrowDirection.Down);
    const formulaEditorManagerService = useDependency(IFormulaEditorManagerService);
    const editorBridgeService = useDependency(IEditorBridgeService);
    const worksheetProtectionRuleModel = useDependency(WorksheetProtectionRuleModel);
    const rangeProtectionRuleModel = useDependency(RangeProtectionRuleModel);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const selectionManager = useDependency(SheetsSelectionsService);
    const permissionService = useDependency(IPermissionService);
    const rangeProtectionCache = useDependency(RangeProtectionCache);
    const commandService = useDependency(ICommandService);
    const [disableInfo, setDisableInfo] = useState<{ editDisable: boolean; viewDisable: boolean }>({
        editDisable: false,
        viewDisable: false,
    });
    const [imageDisable, setImageDisable] = useState<boolean>(false);
    const componentManager = useDependency(ComponentManager);
    const workbook = useObservable(() => univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET), undefined, undefined, [])!;
    const isRefSelecting = useRef<0 | 1 | 2>(0);
    const editState = useObservable(editorBridgeService.currentEditCellState$);
    const keyCodeConfig = useKeyEventConfig(isRefSelecting, editState?.unitId ?? '');
    const FormulaEditor = componentManager.get(EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY);
    const formulaAuxUIParts = useComponentsOfPart(SheetsUIPart.FORMULA_AUX);
    const contextService = useDependency(IContextService);
    useObservable(useMemo(() => contextService.subscribeContextValue$(FOCUSING_FX_BAR_EDITOR), [contextService]));
    const isFocusFxBar = contextService.getContextValue(FOCUSING_FX_BAR_EDITOR);
    const ref = useRef<HTMLDivElement>(null);
    const editorService = useDependency(IEditorService);

    useLayoutEffect(() => {
        const subscription = workbook.activeSheet$.pipe(
            switchMap((worksheet) => {
                if (!worksheet) {
                    return EMPTY;
                }
                return merge(
                    worksheetProtectionRuleModel.ruleChange$,
                    rangeProtectionRuleModel.ruleChange$,
                    selectionManager.selectionMoveEnd$,
                    selectionManager.selectionSet$
                ).pipe(
                    switchMap(() => {
                        const unitId = workbook.getUnitId();
                        const subUnitId = worksheet.getSheetId();
                        const range = selectionManager.getCurrentLastSelection()?.range;
                        if (!range) return EMPTY;
                        const primary = selectionManager.getCurrentLastSelection()?.primary;
                        if (!primary) {
                            return of(null);
                        }

                        return of({
                            unitId,
                            subUnitId,
                            primary,
                        });
                    })
                );
            })
        ).subscribe((cellInfo) => {
            if (cellInfo) {
                const { unitId, subUnitId, primary } = cellInfo;
                if (worksheetProtectionRuleModel.getRule(unitId, subUnitId)) {
                    const editDisable = !(permissionService.getPermissionPoint(new WorksheetEditPermission(unitId, subUnitId).id)?.value ?? true);
                    const viewDisable = !(permissionService.getPermissionPoint(new WorksheetViewPermission(unitId, subUnitId).id)?.value ?? true);
                    setDisableInfo({
                        viewDisable,
                        editDisable,
                    });
                    return;
                }
                const { actualRow, actualColumn } = primary;
                const cellInfoWithPermission = rangeProtectionCache.getCellInfo(unitId, subUnitId, actualRow, actualColumn);
                setDisableInfo({
                    editDisable: !(cellInfoWithPermission?.[UnitAction.Edit] ?? true),
                    viewDisable: !(cellInfoWithPermission?.[UnitAction.View] ?? true),
                });
            } else {
                setDisableInfo({
                    viewDisable: false,
                    editDisable: false,
                });
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [workbook]);

    useEffect(() => {
        const subscription = editorBridgeService.visible$.subscribe((visibleInfo) => {
            setIconActivated(visibleInfo.visible);
        });

        return () => subscription.unsubscribe();
    }, [editorBridgeService.visible$]);

    useEffect(() => {
        const subscription = editorBridgeService.currentEditCellState$.subscribe((state) => {
            if (state?.documentLayoutObject.documentModel?.getBody()?.customBlocks?.length) {
                setImageDisable(true);
            } else {
                setImageDisable(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [editorBridgeService.currentEditCellState$]);

    useEffect(() => {
        const handleResize = () => {
            if (!ref.current) return;

            const editorRect = ref.current.getBoundingClientRect();
            formulaEditorManagerService.setPosition(editorRect);
        };

        if (ref.current) {
            handleResize();
            const a = new ResizeObserver(handleResize);

            a.observe(ref.current);
            return () => a.disconnect();
        }
    }, [formulaEditorManagerService]);

    function handleArrowClick() {
        setArrowDirection(arrowDirection === ArrowDirection.Down ? ArrowDirection.Up : ArrowDirection.Down);

        const ANIMATION_DURATION = 150;
        setTimeout(() => {
            formulaEditorManagerService.handleFoldBtnClick(arrowDirection === ArrowDirection.Up);
        }, ANIMATION_DURATION);
    }

    // Handle click the "×" button.
    function handleCloseBtnClick() {
        const visibleState = editorBridgeService.isVisible();
        if (visibleState.visible) {
            commandService.executeCommand(SetCellEditVisibleOperation.id, {
                visible: false,
                eventType: DeviceInputEventType.Keyboard,
                keycode: KeyCode.ESC,
                unitId: editState!.unitId,
            });
        }
    }

    // Handle click the "√" button.
    function handleConfirmBtnClick() {
        const visibleState = editorBridgeService.isVisible();
        if (visibleState.visible) {
            commandService.executeCommand(SetCellEditVisibleOperation.id, {
                visible: false,
                eventType: DeviceInputEventType.PointerDown,
                unitId: editState!.unitId,
            });
        }
    }

    function handlerFxBtnClick() {
        formulaEditorManagerService.handleFxBtnClick(true);
    }

    // TODO Is there a need to disable an editor here?
    const { viewDisable, editDisable } = disableInfo;
    const disabled = editDisable || imageDisable;
    const shouldSkipFocus = useRef(false);

    const handlePointerDown = () => {
        try {
            // When clicking on the formula bar, the cell editor also needs to enter the edit state
            const visibleState = editorBridgeService.isVisible();
            if (visibleState.visible === false) {
                commandService.syncExecuteCommand(
                    SetCellEditVisibleOperation.id,
                    {
                        visible: true,
                        eventType: DeviceInputEventType.PointerDown,
                        unitId: editState!.unitId,
                    } as IEditorBridgeServiceVisibleParam
                );
                // undoRedoService.clearUndoRedo(DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY);
            }

            // Open the normal editor first, and then we mark formula editor as activated.
            contextService.setContextValue(FOCUSING_FX_BAR_EDITOR, true);
        } catch (e) {
            shouldSkipFocus.current = true;
            throw e;
        }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (shouldSkipFocus.current) {
            setTimeout(() => {
                editorService.blur(true);
            }, 30);
        }
        shouldSkipFocus.current = false;
    };

    const isCellImage = (editState?.documentLayoutObject.documentModel?.getDrawingsOrder()?.length ?? 0) > 0;
    const hideEditor = isCellImage || viewDisable;

    return (
        <div
            data-u-comp="formula-bar"
            className={clsx(`
              univer-box-border univer-flex univer-h-7 univer-bg-white univer-transition-[height] univer-ease-linear
              dark:univer-bg-gray-900
            `, borderBottomClassName, className)}
            style={{
                height: ArrowDirection.Down === arrowDirection ? '28px' : '82px',
                pointerEvents: editDisable ? 'none' : 'auto',
            }}
        >
            <div className="univer-relative univer-box-border univer-h-full univer-w-[100px]">
                <DefinedName disable={disableDefinedName ?? editDisable} />
            </div>

            <div className="univer-flex univer-h-full univer-w-full">
                <div className={clsx('univer-py-1.5', { 'univer-cursor-not-allowed univer-text-gray-200': disabled })}>
                    <div
                        className={clsx(`
                          univer-relative univer-box-border univer-flex univer-h-full univer-w-20 univer-items-center
                          univer-justify-center univer-text-xs
                        `, borderRightClassName)}
                    >
                        {/* TODO: use buttons to replace these re-implementation of buttons. */}
                        <span
                            className={clsx(`
                              univer-flex univer-items-center univer-justify-center univer-rounded univer-p-1
                              univer-text-base
                              dark:univer-text-white
                            `, {
                                'univer-cursor-pointer univer-text-green-600 dark:univer-text-green-400 dark:hover:univer-bg-gray-700 hover:univer-bg-gray-100': iconActivated,
                            })}
                            onClick={handleCloseBtnClick}
                        >
                            <CloseSingle />
                        </span>
                        <span
                            className={clsx(`
                              univer-flex univer-items-center univer-justify-center univer-rounded univer-p-1
                              univer-text-base
                              dark:univer-text-white
                            `, {
                                'univer-cursor-pointer univer-text-red-600 dark:univer-text-red-400 dark:hover:univer-bg-gray-700 hover:univer-bg-gray-100': iconActivated,
                            })}
                            onClick={handleConfirmBtnClick}
                        >
                            <CheckMarkSingle />
                        </span>
                        <span
                            className={clsx(`
                              univer-flex univer-cursor-pointer univer-items-center univer-justify-center univer-rounded
                              univer-p-1 univer-text-base
                              dark:univer-text-white dark:hover:univer-bg-gray-700
                              hover:univer-bg-gray-100
                            `)}
                            onClick={handlerFxBtnClick}
                        >
                            <FxSingle />
                        </span>
                    </div>
                </div>

                <div className="univer-flex univer-w-full univer-flex-1 univer-overflow-hidden univer-pl-3">
                    <div
                        className="univer-relative univer-flex-1"
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}
                        ref={ref}
                        style={{ pointerEvents: hideEditor ? 'none' : 'auto' }}
                    >
                        {FormulaEditor && (
                            <FormulaEditor
                                className={`
                                  univer-relative univer-h-full univer-w-full univer-break-words univer-outline-none
                                  [&>div]:univer-ring-transparent
                                `}
                                disableSelectionOnClick
                                editorId={DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY}
                                initValue=""
                                onChange={() => { }}
                                isFocus={isFocusFxBar}
                                unitId={editState?.unitId}
                                subUnitId={editState?.sheetId}
                                isSupportAcrossSheet
                                resetSelectionOnBlur={false}
                                isSingle={false}
                                keyboardEventConfig={keyCodeConfig}
                                onFormulaSelectingChange={(isSelecting: 0 | 1 | 2, isFocusing: boolean) => {
                                    isRefSelecting.current = isSelecting;
                                    if (!isFocusing) return;
                                    if (isSelecting) {
                                        editorBridgeService.enableForceKeepVisible();
                                    } else {
                                        editorBridgeService.disableForceKeepVisible();
                                    }
                                }}
                                autoScrollbar={false}
                                disableContextMenu={false}
                            />
                        )}
                        {/* When the editor is hidden, we just cover a div on the editor because re-instantiate
                        the formula editor will be expensive. */}
                        {hideEditor
                            ? (
                                <div
                                    className={`
                                      univer-pointer-events-none univer-relative univer-left-0 univer-top-0
                                      univer-z-[100] univer-h-full univer-w-full univer-cursor-not-allowed
                                      univer-bg-white
                                    `}
                                />
                            )
                            : null}
                    </div>
                    <div
                        className={clsx(`
                          univer-flex univer-h-full univer-w-5 univer-cursor-pointer univer-items-center
                          univer-justify-center univer-text-xs univer-text-gray-700
                          dark:univer-text-gray-200
                        `, { 'univer-cursor-not-allowed univer-text-gray-200 dark:univer-text-gray-700': editDisable })}
                        onClick={handleArrowClick}
                    >
                        {arrowDirection === ArrowDirection.Down
                            ? (
                                <DropdownSingle />
                            )
                            : (
                                <DropdownSingle style={{ transform: 'rotateZ(180deg)' }} />
                            )}
                    </div>
                </div>
            </div>

            <ComponentContainer key="formula-aux" components={formulaAuxUIParts} />
        </div>
    );
}
