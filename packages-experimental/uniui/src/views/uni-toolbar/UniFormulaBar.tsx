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
import {
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    FOCUSING_FX_BAR_EDITOR,
    ICommandService,
    IContextService,
    IPermissionService,
    IUniverInstanceService,
    Rectangle,
    UniverInstanceType,
} from '@univerjs/core';
import { Button, clsx } from '@univerjs/design';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { CheckMarkSingle, CloseSingle, FxSingle } from '@univerjs/icons';
import {
    RangeProtectionPermissionEditPoint,
    RangeProtectionRuleModel,
    SheetsSelectionsService,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetProtectionRuleModel,
    WorksheetSetCellValuePermission,
} from '@univerjs/sheets';
import { EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY, IEditorBridgeService, IFormulaEditorManagerService, SetCellEditVisibleOperation, useActiveWorkbook, useKeyEventConfig } from '@univerjs/sheets-ui';
import { ComponentManager, KeyCode, useDependency, useObservable } from '@univerjs/ui';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
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
                  univer-flex univer-cursor-pointer univer-items-center univer-gap-2 univer-rounded-md
                  univer-border-primary-400 univer-bg-primary-300 univer-px-3 univer-py-1.5 univer-text-sm
                  univer-text-primary-600
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
            <div
                className={clsx(`
                  univer-absolute univer-left-0 univer-top-0 univer-z-10 univer-h-full univer-w-full univer-bg-white
                  dark:univer-bg-dark
                `, {
                    'univer-hidden': !visible,
                })}
            >
                <FormulaBar />
            </div>
        </>
    );
};

// This copies the FormulaBar component from the sheets-ui package.
// FIXME@wzhudev: it is not appropriate to copy the component here.
export function FormulaBar() {
    const formulaEditorManagerService = useDependency(IFormulaEditorManagerService);
    const editorBridgeService = useDependency(IEditorBridgeService);
    const componentManager = useDependency(ComponentManager);
    const commandService = useDependency(ICommandService);
    const selectionManager = useDependency(SheetsSelectionsService);
    const worksheetProtectionRuleModel = useDependency(WorksheetProtectionRuleModel);
    const rangeProtectionRuleModel = useDependency(RangeProtectionRuleModel);
    const permissionService = useDependency(IPermissionService);
    const contextService = useDependency(IContextService);

    const [disable, setDisable] = useState<boolean>(false);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const FormulaEditor = componentManager.get(EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY);
    const currentWorkbook = useActiveWorkbook();
    const isFocusFxBar = contextService.getContextValue(FOCUSING_FX_BAR_EDITOR);
    const editState = useObservable(editorBridgeService.currentEditCellState$);
    const isRefSelecting = useRef<0 | 1 | 2>(0);
    const keyCodeConfig = useKeyEventConfig(isRefSelecting, editState?.unitId ?? '');

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

    return (
        <div
            className={`
              univer-box-border univer-flex univer-h-full univer-w-full univer-items-center univer-gap-2 univer-p-2
            `}
        >
            <div className={clsx('univer-flex univer-univer-grow-0 univer-shrink-0 univer-px-1.5', { 'univer-cursor-not-allowed univer-text-gray-200': disable })}>
                <Button size="small" variant="text" className="univer-text-red-600" onClick={handleCloseBtnClick}>
                    <CloseSingle />
                </Button>
                <Button size="small" variant="text" className="univer-text-green-600" onClick={handleConfirmBtnClick}>
                    <CheckMarkSingle />
                </Button>
            </div>
            {FormulaEditor && (
                <FormulaEditor
                    className="univer-h-full univer-shrink univer-grow"
                    disableSelectionOnClick
                    editorId={DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY}
                    initValue=""
                    onChange={() => { }}
                    isFocus={isFocusFxBar}
                    unitId={editState?.unitId}
                    subUnitId={editState?.sheetId}
                    autofocus={false}
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
        </div>
    );
}
