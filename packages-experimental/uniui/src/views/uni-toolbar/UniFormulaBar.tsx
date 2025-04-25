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

import type { Nullable, Workbook } from '@univerjs/core';
import { BooleanNumber, DEFAULT_EMPTY_DOCUMENT_VALUE, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, DocumentFlavor, HorizontalAlign, ICommandService, IPermissionService, IUniverInstanceService, Rectangle, ThemeService, UniverInstanceType, VerticalAlign, WrapStrategy } from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { CheckMarkSingle, CloseSingle, FxSingle } from '@univerjs/icons';
import { RangeProtectionPermissionEditPoint, RangeProtectionRuleModel, SheetsSelectionsService, WorkbookEditablePermission, WorksheetEditPermission, WorksheetProtectionRuleModel, WorksheetSetCellValuePermission } from '@univerjs/sheets';
import { IEditorBridgeService, IFormulaEditorManagerService, SetCellEditVisibleOperation, useActiveWorkbook } from '@univerjs/sheets-ui';
import { KeyCode, useDependency, useObservable } from '@univerjs/ui';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { EMPTY, merge, switchMap } from 'rxjs';

export const UniFormulaBar = () => {
    const editorBridgeService = useDependency(IEditorBridgeService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const commandService = useDependency(ICommandService);

    const visibleInfo = useObservable(editorBridgeService.visible$);
    const focusedId = useObservable(univerInstanceService.focused$);
    const visible = (visibleInfo?.visible && focusedId) || false;

    const handleOpenWrite = useCallback(() => {
        if (focusedId) {
            commandService.executeCommand(SetCellEditVisibleOperation.id, {
                visible: true,
                eventType: DeviceInputEventType.PointerDown,
                unitId: focusedId,
            });
        }
    }, [editorBridgeService, focusedId]);

    return (
        <>
            <div
                className={clsx(`
                  univer-flex univer-items-center univer-gap-2 univer-rounded-md univer-px-3 univer-py-1.5
                  univer-text-sm univer-text-primary-600
                `, {
                    'univer-opacity-30': !focusedId,
                })}
                onClick={() => handleOpenWrite()}
            >
                <FxSingle />
                <span className="univer-whitespace-nowrap univer-text-xs">
                    Write formula
                </span>
            </div>
            {visible && (
                <div
                    className={`
                      univer-absolute univer-left-0 univer-top-0 univer-z-10 univer-h-full univer-w-full univer-bg-white
                    `}
                >
                    <FormulaBar />
                </div>
            )}
        </>
    );
};

// This copies the FormulaBar component from the sheets-ui package.
// FIXME@wzhudev: it is not appropriate to copy the component here.
export function FormulaBar() {
    const formulaEditorManagerService = useDependency(IFormulaEditorManagerService);
    const editorBridgeService = useDependency(IEditorBridgeService);
    const themeService = useDependency(ThemeService);
    const progressBarColor = themeService.getCurrentTheme().primaryColor;
    const commandService = useDependency(ICommandService);
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

    return (
        <div
            className={`
              univer-relative univer-box-border univer-flex univer-items-center unvier-gap-2 univer-h-full univer-p-2
            `}
        >
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
            <div className={clsx('univer-py-1.5', { 'univer-cursor-not-allowed univer-text-gray-200': disable })}>
                <span
                    className={`
                      univer-flex univer-items-center univer-justify-center univer-rounded univer-p-1 univer-text-lg
                      univer-text-red-600
                    `}
                    onClick={handleCloseBtnClick}
                >
                    <CloseSingle />
                </span>

                <span
                    className={`
                      univer-flex univer-items-center univer-justify-center univer-rounded univer-p-1 univer-text-lg
                      univer-text-green-600
                    `}
                    onClick={handleConfirmBtnClick}
                >
                    <CheckMarkSingle />
                </span>
            </div>
        </div>
    );
}
