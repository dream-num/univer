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

import type { IDocumentData, Nullable, Workbook } from '@univerjs/core';
import { BooleanNumber, DEFAULT_EMPTY_DOCUMENT_VALUE, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DocumentFlavor, HorizontalAlign, IPermissionService, IUniverInstanceService, Rectangle, UniverInstanceType, useDependency, useObservable, VerticalAlign, WrapStrategy } from '@univerjs/core';
import { TextEditor } from '@univerjs/docs-ui';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { CheckMarkSingle, CloseSingle, DropdownSingle, FxSingle } from '@univerjs/icons';
import { RangeProtectionPermissionEditPoint, RangeProtectionRuleModel, SheetsSelectionsService, WorkbookEditablePermission, WorksheetEditPermission, WorksheetProtectionRuleModel, WorksheetSetCellValuePermission } from '@univerjs/sheets';
import { ComponentContainer, KeyCode, useComponentsOfPart } from '@univerjs/ui';
import clsx from 'clsx';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { EMPTY, merge, switchMap } from 'rxjs';
import { useActiveWorkbook } from '../../components/hook';
import { SheetsUIPart } from '../../consts/ui-name';
import { IFormulaEditorManagerService } from '../../services/editor/formula-editor-manager.service';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import { DefinedName } from '../defined-name/DefinedName';
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
    const currentWorkbook = useActiveWorkbook();
    const workbook = useObservable(() => univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET), undefined, undefined, [])!;

    const formulaAuxUIParts = useComponentsOfPart(SheetsUIPart.FORMULA_AUX);

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
                    selectionManager.selectionMoveEnd$
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

    const INITIAL_SNAPSHOT: IDocumentData = {
        id: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
        body: {
            dataStream: `${DEFAULT_EMPTY_DOCUMENT_VALUE}`,
            textRuns: [],
            tables: [],
            paragraphs: [
                {
                    startIndex: 0,
                },
            ],
            sectionBreaks: [{
                startIndex: 1,
            }],
        },
        tableSource: {},
        documentStyle: {
            pageSize: {
                width: Number.POSITIVE_INFINITY,
                height: Number.POSITIVE_INFINITY,
            },
            documentFlavor: DocumentFlavor.UNSPECIFIED,
            marginTop: 5,
            marginBottom: 5,
            marginRight: 0,
            marginLeft: 0,
            paragraphLineGapDefault: 0,
            renderConfig: {
                horizontalAlign: HorizontalAlign.UNSPECIFIED,
                verticalAlign: VerticalAlign.TOP,
                centerAngle: 0,
                vertexAngle: 0,
                wrapStrategy: WrapStrategy.WRAP,
                isRenderStyle: BooleanNumber.FALSE,
            },
        },
    };

    useEffect(() => {
        const subscription = editorBridgeService.visible$.subscribe((visibleInfo) => {
            setIconStyle(visibleInfo.visible ? styles.formulaActive : styles.formulaGrey);
        });

        return () => subscription.unsubscribe();
    }, [editorBridgeService.visible$]);

    function resizeCallBack(editor: Nullable<HTMLDivElement>) {
        if (editor == null) {
            return;
        }

        const editorRect = editor.getBoundingClientRect();

        formulaEditorManagerService.setPosition(editorRect);
    }

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
                <div className={clsx(styles.formulaIcon, { [styles.formulaIconDisable]: disable })}>
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

                <div className={styles.formulaInput}>
                    <TextEditor
                        id={DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY}
                        isSheetEditor={true}
                        resizeCallBack={resizeCallBack}
                        cancelDefaultResizeListener={true}
                        onContextMenu={(e) => e.preventDefault()}
                        className={styles.formulaContent}
                        snapshot={INITIAL_SNAPSHOT}
                        isSingle={false}
                    />
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
