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
import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, FOCUSING_FX_BAR_EDITOR, ICommandService, IContextService, IPermissionService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { IEditorService } from '@univerjs/docs-ui';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { CheckMarkSingle, CloseSingle, DropdownSingle, FxSingle } from '@univerjs/icons';
import { RangeProtectionCache, RangeProtectionRuleModel, SheetsSelectionsService, UnitAction, WorksheetEditPermission, WorksheetProtectionRuleModel, WorksheetViewPermission } from '@univerjs/sheets';
import { ComponentContainer, ComponentManager, KeyCode, useComponentsOfPart, useDependency, useObservable } from '@univerjs/ui';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EMPTY, merge, of, switchMap } from 'rxjs';
import { SetCellEditVisibleOperation } from '../../commands/operations/cell-edit.operation';
import { EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY } from '../../common/keys';
import { useActiveWorkbook } from '../../components/hook';
import { SheetsUIPart } from '../../consts/ui-name';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import { IFormulaEditorManagerService } from '../../services/editor/formula-editor-manager.service';
import { DefinedName } from '../defined-name/DefinedName';
import { useKeyEventConfig } from '../editor-container/hooks';
import styles from './index.module.less';

enum ArrowDirection {
    Down,
    Up,
}

interface IProps {
    className?: string;
}

export function FormulaBar(props: IProps) {
    const { className } = props;

    const [iconStyle, setIconStyle] = useState<string>(styles.formulaGrey);
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
    const currentWorkbook = useActiveWorkbook();
    const componentManager = useDependency(ComponentManager);
    const workbook = useObservable(() => univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET), undefined, undefined, [])!;
    const isRefSelecting = useRef<0 | 1 | 2>(0);
    const editState = editorBridgeService.getEditLocation();
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
            setIconStyle(visibleInfo.visible ? styles.formulaActive : styles.formulaGrey);
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
                unitId: currentWorkbook?.getUnitId() ?? '',
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
                unitId: currentWorkbook?.getUnitId() ?? '',
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

    const unitId = currentWorkbook?.getUnitId() ?? '';

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
                        unitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
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

    return (
        <div
            className={clsx(styles.formulaBox, className)}
            style={{
                height: ArrowDirection.Down === arrowDirection ? '28px' : '82px',
                pointerEvents: editDisable ? 'none' : 'auto',
            }}
        >
            <div className={styles.nameRanges}>
                <DefinedName disable={editDisable} />
            </div>

            <div className={styles.formulaBar}>
                <div className={clsx(styles.formulaIcon, { [styles.formulaIconDisable]: disabled })}>
                    <div className={styles.formulaIconWrapper}>
                        <span
                            className={clsx(styles.iconContainer, styles.iconContainerError, iconStyle)}
                            onClick={handleCloseBtnClick}
                        >
                            <CloseSingle />
                        </span>

                        <span
                            className={clsx(styles.iconContainer, styles.iconContainerSuccess, iconStyle)}
                            onClick={handleConfirmBtnClick}
                        >
                            <CheckMarkSingle />
                        </span>

                        <span className={clsx(styles.iconContainer, styles.iconContainerFx)} onClick={handlerFxBtnClick}>
                            <FxSingle />
                        </span>
                    </div>
                </div>

                <div className={styles.formulaContainer}>
                    <div
                        className={styles.formulaInput}
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}
                        ref={ref}
                    >
                        {FormulaEditor && (
                            <FormulaEditor
                                disableSelectionOnClick
                                editorId={DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY}
                                initValue=""
                                onChange={() => { }}
                                isFocus={isFocusFxBar}
                                className={styles.formulaContent}
                                unitId={editState?.unitId}
                                subUnitId={editState?.sheetId}
                                isSupportAcrossSheet
                                resetSelectionOnBlur={false}
                                isSingle={false}
                                keyboradEventConfig={keyCodeConfig}
                                onFormulaSelectingChange={(isSelecting: 0 | 1 | 2) => {
                                    isRefSelecting.current = isSelecting;
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
                    </div>
                    <div className={clsx(styles.arrowContainer, { [styles.arrowContainerDisable]: editDisable })} onClick={handleArrowClick}>
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
