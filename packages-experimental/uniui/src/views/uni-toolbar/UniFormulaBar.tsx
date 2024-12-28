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

import type { Nullable, Workbook } from '@univerjs/core';
import { BooleanNumber, DEFAULT_EMPTY_DOCUMENT_VALUE, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DocumentFlavor, HorizontalAlign, IPermissionService, IUniverInstanceService, Rectangle, ThemeService, UniverInstanceType, useDependency, useObservable, VerticalAlign, WrapStrategy } from '@univerjs/core';
// import { TextEditor } from '@univerjs/docs-ui';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { CheckMarkSingle, CloseSingle, FxSingle } from '@univerjs/icons';
import { RangeProtectionPermissionEditPoint, RangeProtectionRuleModel, SheetsSelectionsService, WorkbookEditablePermission, WorksheetEditPermission, WorksheetProtectionRuleModel, WorksheetSetCellValuePermission } from '@univerjs/sheets';
import { IEditorBridgeService, IFormulaEditorManagerService, useActiveWorkbook } from '@univerjs/sheets-ui';
import { KeyCode } from '@univerjs/ui';
import clsx from 'clsx';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { EMPTY, merge, switchMap } from 'rxjs';
import styles from './index.module.less';

export const UniFormulaBar = () => {
    const editorBridgeService = useDependency(IEditorBridgeService);
    const univerInstanceService = useDependency(IUniverInstanceService);

    const visibleInfo = useObservable(editorBridgeService.visible$);
    const focusedId = useObservable(univerInstanceService.focused$);
    const visible = (visibleInfo?.visible && focusedId) || false;

    const handleOpenWrite = useCallback(() => {
        if (focusedId) {
            editorBridgeService.changeVisible({
                visible: true,
                eventType: DeviceInputEventType.PointerDown,
                unitId: focusedId,
            });
        }
    }, [editorBridgeService, focusedId]);

    return (
        <>
            <div
                className={clsx(styles.uniFormulaBar, {
                    [styles.uniFormulaBarDisable]: !focusedId,
                })}
                onClick={() => handleOpenWrite()}
            >
                <FxSingle />
                <span className={styles.uniFormulaBarText}>
                    Write formula
                </span>
            </div>
            {visible && (
                <div
                    className={styles.uniFormulaBarFullInput}
                >
                    <FormulaBar />
                </div>
            )}
        </>
    );
};

export function FormulaBar() {
    const formulaEditorManagerService = useDependency(IFormulaEditorManagerService);
    const editorBridgeService = useDependency(IEditorBridgeService);
    const themeService = useDependency(ThemeService);
    const progressBarColor = themeService.getCurrentTheme().primaryColor;
    const [disable, setDisable] = useState<boolean>(false);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const selectionManager = useDependency(SheetsSelectionsService);
    const worksheetProtectionRuleModel = useDependency(WorksheetProtectionRuleModel);
    const rangeProtectionRuleModel = useDependency(RangeProtectionRuleModel);
    const permissionService = useDependency(IPermissionService);
    const currentWorkbook = useActiveWorkbook();

    function getPermissionIds(unitId: string, subUnitId: string): string[] {
        return [
            new WorkbookEditablePermission(unitId).id,
            new WorksheetSetCellValuePermission(unitId, subUnitId).id,
            new WorksheetEditPermission(unitId, subUnitId).id,
        ];
    }

    useLayoutEffect(() => {
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const subscription = merge(
            worksheetProtectionRuleModel.ruleChange$,
            rangeProtectionRuleModel.ruleChange$,
            selectionManager.selectionMoveEnd$,
            selectionManager.selectionSet$,
            workbook.activeSheet$
        ).pipe(
            switchMap(() => {
                const unitId = workbook.getUnitId();
                const worksheet = workbook.getActiveSheet();
                if (!worksheet) return EMPTY;

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
        ).subscribe((permissions) => {
            if (permissions) {
                setDisable(!permissions.every((p) => p.value));
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const INITIAL_SNAPSHOT = {
        id: DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
        body: {
            dataStream: `${DEFAULT_EMPTY_DOCUMENT_VALUE}`,
            textRuns: [],
            paragraphs: [
                {
                    startIndex: 0,
                },
            ],
        },
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

    function resizeCallBack(editor: Nullable<HTMLDivElement>) {
        if (editor == null) {
            return;
        }

        const editorRect = editor.getBoundingClientRect();

        formulaEditorManagerService.setPosition(editorRect);
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
        <div className={styles.uniFormulaBox}>
            {/* <TextEditor
                id={DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY}
                isSheetEditor
                resizeCallBack={resizeCallBack}
                cancelDefaultResizeListener
                onContextMenu={(e) => e.preventDefault()}
                className={clsx(styles.uniFormulaInput, styles.formulaContent)}
                snapshot={INITIAL_SNAPSHOT}
                isSingle
            /> */}
            <div className={clsx(styles.formulaIcon, { [styles.formulaIconDisable]: disable })}>
                <span
                    className={clsx(styles.iconContainer, styles.iconContainerError)}
                    onClick={handleCloseBtnClick}
                >
                    <CloseSingle />
                </span>

                <span
                    className={clsx(styles.iconContainer, styles.iconContainerSuccess)}
                    onClick={handleConfirmBtnClick}
                >
                    <CheckMarkSingle />
                </span>
            </div>
        </div>
    );
}
