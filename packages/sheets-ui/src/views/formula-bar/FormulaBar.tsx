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

import type { Workbook } from '@univerjs/core';
import { DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, FOCUSING_FX_BAR_EDITOR, IContextService, IPermissionService, IUniverInstanceService, Rectangle, UniverInstanceType, useDependency, useObservable } from '@univerjs/core';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { CheckMarkSingle, CloseSingle, DropdownSingle, FxSingle } from '@univerjs/icons';
import { RangeProtectionPermissionEditPoint, RangeProtectionRuleModel, SheetsSelectionsService, WorkbookEditablePermission, WorksheetEditPermission, WorksheetProtectionRuleModel, WorksheetSetCellValuePermission } from '@univerjs/sheets';
import { ComponentContainer, ComponentManager, KeyCode, useComponentsOfPart } from '@univerjs/ui';
import clsx from 'clsx';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { EMPTY, merge, switchMap } from 'rxjs';
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

export function FormulaBar() {
    const [iconStyle, setIconStyle] = useState<string>(styles.formulaGrey);
    const [arrowDirection, setArrowDirection] = useState<ArrowDirection>(ArrowDirection.Down);

    const formulaEditorManagerService = useDependency(IFormulaEditorManagerService);
    const editorBridgeService = useDependency(IEditorBridgeService);
    const worksheetProtectionRuleModel = useDependency(WorksheetProtectionRuleModel);
    const rangeProtectionRuleModel = useDependency(RangeProtectionRuleModel);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const selectionManager = useDependency(SheetsSelectionsService);
    const permissionService = useDependency(IPermissionService);
    const [disable, setDisable] = useState<boolean>(false);
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

    function getPermissionIds(unitId: string, subUnitId: string): string[] {
        return [
            new WorkbookEditablePermission(unitId).id,
            new WorksheetSetCellValuePermission(unitId, subUnitId).id,
            new WorksheetEditPermission(unitId, subUnitId).id,
        ];
    }

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

                        const permissionIds = getPermissionIds(unitId, subUnitId);

                        const selectionRanges = selectionManager.getCurrentSelections()?.map((selection) => selection.range);
                        const permissionList = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).filter((rule) => {
                            return rule.ranges.some((r) => selectionRanges?.some((selectionRange) => Rectangle.intersects(r, selectionRange)));
                        });

                        permissionList.forEach((p) => {
                            permissionIds.push(new RangeProtectionPermissionEditPoint(unitId, subUnitId, p.permissionId).id);
                        });

                        return permissionService.composePermission$(permissionIds);
                    })
                );
            })
        ).subscribe((permissions) => {
            if (permissions) {
                setDisable(!permissions.every((p) => p.value));
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
        if (ref.current) {
            const handleResize = () => {
                const editorRect = ref.current!.getBoundingClientRect();
                formulaEditorManagerService.setPosition(editorRect);
            };

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
            editorBridgeService.changeVisible({
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
            editorBridgeService.changeVisible({
                visible: false,
                eventType: DeviceInputEventType.PointerDown,
                unitId: currentWorkbook?.getUnitId() ?? '',
            });
        }
    }

    function handlerFxBtnClick() {
        formulaEditorManagerService.handleFxBtnClick(true);
    }

    const disabled = disable || imageDisable;
    return (
        <div
            className={styles.formulaBox}
            style={{
                height: ArrowDirection.Down === arrowDirection ? '28px' : '82px',
                pointerEvents: disable ? 'none' : 'auto',
            }}
        >
            <div className={styles.nameRanges}>
                <DefinedName disable={disable} />
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
                    <div className={styles.formulaInput} ref={ref}>
                        {FormulaEditor && (
                            <FormulaEditor
                                disableSelectionOnClick
                                editorId={DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY}
                                initValue=""
                                onChange={() => {}}
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
                    <div className={clsx(styles.arrowContainer, { [styles.arrowContainerDisable]: disable })} onClick={handleArrowClick}>
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

            <ComponentContainer key="formula-aux" components={formulaAuxUIParts}></ComponentContainer>
        </div>
    );
}
