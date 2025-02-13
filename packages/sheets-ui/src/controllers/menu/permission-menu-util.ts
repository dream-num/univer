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

import type { IAccessor, Workbook } from '@univerjs/core';
import { FOCUSING_COMMON_DRAWINGS, FOCUSING_FX_BAR_EDITOR, IContextService, IPermissionService, IUniverInstanceService, RANGE_TYPE, Rectangle, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { RangeProtectionCache, RangeProtectionRuleModel, SheetsSelectionsService, UnitAction, WorkbookCreateProtectPermission, WorkbookEditablePermission, WorkbookManageCollaboratorPermission, WorksheetDeleteProtectionPermission, WorksheetManageCollaboratorPermission, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import { combineLatest, map, merge, of, startWith, switchMap } from 'rxjs';
import { IEditorBridgeService } from '../../services/editor-bridge.service';

export function getAddPermissionHidden$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook$ = univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);
    const userManagerService = accessor.get(UserManagerService);

    return combineLatest([workbook$, userManagerService.currentUser$]).pipe(
        switchMap(([workbook, _]) => {
            if (!workbook) {
                return of(true);
            }

            return workbook.activeSheet$.pipe(
                switchMap((worksheet) => {
                    if (!worksheet) {
                        return of(true);
                    }
                    const rangeProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
                    const worksheetRuleModel = accessor.get(WorksheetProtectionRuleModel);
                    const selectionManagerService = accessor.get(SheetsSelectionsService);
                    return merge(
                        selectionManagerService.selectionMoveEnd$,
                        rangeProtectionRuleModel.ruleChange$,
                        worksheetRuleModel.ruleChange$
                    ).pipe(
                        map(() => {
                            const unitId = workbook.getUnitId();
                            const subUnitId = worksheet.getSheetId();
                            const subUnitRuleList = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId);
                            const selections = selectionManagerService.getCurrentSelections();
                            const selectionsRanges = selections?.map((selection) => selection.range);
                            const ruleRanges = subUnitRuleList.map((rule) => rule.ranges).flat();
                            if (!selectionsRanges) {
                                return false;
                            }
                            const worksheetRule = worksheetRuleModel.getRule(unitId, subUnitId);
                            if (worksheetRule?.permissionId) {
                                return true;
                            }
                            return selectionsRanges?.some((selectionRange) => {
                                return ruleRanges.some((ruleRange) => {
                                    return Rectangle.intersects(selectionRange, ruleRange);
                                });
                            });
                        })
                    );
                })
            );
        })
    );
}

export function getEditPermissionHidden$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const rangeRuleModel = accessor.get(RangeProtectionRuleModel);

    const workbook$ = univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);
    const userManagerService = accessor.get(UserManagerService);

    return combineLatest([workbook$, userManagerService.currentUser$]).pipe(
        switchMap(([workbook, _]) => {
            if (!workbook) {
                return of(true);
            }

            return workbook.activeSheet$.pipe(
                switchMap((worksheet) => {
                    if (!worksheet) {
                        return of(true);
                    }
                    const rangeProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
                    const worksheetRuleModel = accessor.get(WorksheetProtectionRuleModel);
                    const permissionService = accessor.get(IPermissionService);

                    const selectionManagerService = accessor.get(SheetsSelectionsService);
                    return merge(
                        selectionManagerService.selectionMoveEnd$,
                        rangeProtectionRuleModel.ruleChange$,
                        worksheetRuleModel.ruleChange$
                    ).pipe(
                        map(() => {
                            const unitId = workbook.getUnitId();
                            const subUnitId = worksheet.getSheetId();
                            const subUnitRuleList = rangeRuleModel.getSubunitRuleList(unitId, subUnitId);
                            const selectionRanges = selectionManagerService.getCurrentSelections()?.map((selection) => selection.range);

                            const ruleRanges = subUnitRuleList.map((rule) => rule.ranges).flat();
                            if (!selectionRanges?.length) {
                                return true;
                            }

                            if (selectionRanges.length > 1) {
                                return true;
                            }

                            const selectionRange = selectionRanges[0];

                            if (selectionRange?.rangeType === RANGE_TYPE.ALL || selectionRange?.rangeType === RANGE_TYPE.COLUMN || selectionRange?.rangeType === RANGE_TYPE.ROW) {
                                return true;
                            }

                            const worksheetRule = worksheetRuleModel.getRule(unitId, subUnitId);
                            if (worksheetRule?.permissionId) {
                                return permissionService.getPermissionPoint(new WorksheetManageCollaboratorPermission(unitId, subUnitId).id)?.value === false;
                            }

                            const overlapRule = subUnitRuleList.filter((rule) => {
                                return rule.ranges.some((range) => {
                                    return Rectangle.intersects(range, selectionRange);
                                });
                            });

                            if (overlapRule.length !== 1) {
                                return true;
                            }

                            const { startRow, endRow, startColumn, endColumn } = selectionRange;
                            const rangeProtectionCache = accessor.get(RangeProtectionCache);
                            for (let i = startRow; i <= endRow; i++) {
                                for (let j = startColumn; j <= endColumn; j++) {
                                    const cellInfo = rangeProtectionCache.getCellInfo(unitId, subUnitId, i, j);
                                    if (cellInfo) {
                                        return cellInfo[UnitAction.ManageCollaborator] === false;
                                    }
                                }
                            }
                            return false;
                        })
                    );
                })
            );
        })
    );
}

export function getPermissionDisableBase$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const permissionService = accessor.get(IPermissionService);
    const workbook$ = univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);
    const userManagerService = accessor.get(UserManagerService);

    return combineLatest([workbook$, userManagerService.currentUser$]).pipe(
        switchMap(([workbook, _]) => {
            if (!workbook) {
                return of(true);
            }

            return workbook.activeSheet$.pipe(
                switchMap((worksheet) => {
                    if (!worksheet) {
                        return of(true);
                    }
                    const unitId = workbook.getUnitId();
                    const selectionManagerService = accessor.get(SheetsSelectionsService);
                    const selectionProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
                    const worksheetProtectionRuleModel = accessor.get(WorksheetProtectionRuleModel);

                    const permission$ = permissionService.composePermission$([new WorkbookEditablePermission(unitId).id]).pipe(map((permissions) => permissions.every((permission) => permission.value))) ?? of(false);
                    const ruleChange$ = merge(
                        selectionProtectionRuleModel.ruleChange$,
                        worksheetProtectionRuleModel.ruleChange$
                    ).pipe(
                        startWith(null)
                    );
                    return combineLatest([permission$, ruleChange$, selectionManagerService.selectionMoveEnd$]).pipe(
                        map(([permission, _, __]) => {
                            if (!permission) {
                                return true;
                            }
                            const selections = selectionManagerService.getCurrentSelections();
                            const selectionRanges = selections?.map((selection) => selection.range);
                            if (!selectionRanges?.length) {
                                return false;
                            }

                            if (selectionRanges.length > 1) {
                                return true;
                            }
                            return false;
                        })
                    );
                })
            );
        })
    );
}

export function getAddPermissionDisableBase$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const permissionService = accessor.get(IPermissionService);
    const workbook$ = univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);
    const userManagerService = accessor.get(UserManagerService);
    const editorBridgeService = accessor.has(IEditorBridgeService) ? accessor.get(IEditorBridgeService) : null;
    const contextService = accessor.get(IContextService);
    const formulaEditorFocus$ = contextService.subscribeContextValue$(FOCUSING_FX_BAR_EDITOR);
    const editorVisible$ = editorBridgeService?.visible$ ?? of(null);

    return combineLatest([workbook$, userManagerService.currentUser$, editorVisible$, formulaEditorFocus$]).pipe(
        switchMap(([workbook, _, visible, formulaEditorFocus]) => {
            if (!workbook || (visible?.visible && visible.unitId === workbook.getUnitId()) || formulaEditorFocus) {
                return of(true);
            }

            return workbook.activeSheet$.pipe(
                switchMap((worksheet) => {
                    if (!worksheet) {
                        return of(true);
                    }
                    const contextService = accessor.get(IContextService);
                    const focusingDrawing$ = contextService.subscribeContextValue$(FOCUSING_COMMON_DRAWINGS).pipe(startWith(false));
                    const unitId = workbook.getUnitId();
                    const subUnitId = worksheet.getSheetId();
                    const selectionProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
                    const worksheetProtectionRuleModel = accessor.get(WorksheetProtectionRuleModel);
                    const selectionManagerService = accessor.get(SheetsSelectionsService);
                    const permission$ = permissionService.composePermission$([new WorkbookCreateProtectPermission(unitId).id]).pipe(map((permissions) => permissions.every((permission) => permission.value))) ?? of(false);
                    const ruleChange$ = merge(
                        selectionProtectionRuleModel.ruleChange$,
                        worksheetProtectionRuleModel.ruleChange$
                    ).pipe(
                        startWith(null)
                    );
                    return combineLatest([permission$, ruleChange$, selectionManagerService.selectionMoveEnd$, focusingDrawing$]).pipe(
                        map(([permission, _, __, focus]) => {
                            if (!permission || focus) {
                                return true;
                            }
                            const selections = selectionManagerService.getCurrentSelections();
                            const selectionRanges = selections?.map((selection) => selection.range);
                            if (!selectionRanges?.length) {
                                return true;
                            }

                            const worksheetRule = worksheetProtectionRuleModel.getRule(unitId, subUnitId);
                            if (worksheetRule?.permissionId) {
                                return true;
                            }

                            const subunitRuleList = selectionProtectionRuleModel.getSubunitRuleList(unitId, subUnitId);
                            const hasLap = selectionRanges?.some((selectionRange) => {
                                return subunitRuleList.some((rule) => {
                                    return rule.ranges.some((ruleRange) => {
                                        return Rectangle.intersects(selectionRange, ruleRange);
                                    });
                                });
                            });
                            return hasLap;
                        })
                    );
                })
            );
        })
    );
}

export function getAddPermissionFromSheetBarDisable$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const permissionService = accessor.get(IPermissionService);
    const workbook$ = univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);
    const userManagerService = accessor.get(UserManagerService);

    return combineLatest([workbook$, userManagerService.currentUser$]).pipe(
        switchMap(([workbook, _]) => {
            if (!workbook) {
                return of(true);
            }

            return workbook.activeSheet$.pipe(
                switchMap((worksheet) => {
                    if (!worksheet) {
                        return of(true);
                    }
                    const unitId = workbook.getUnitId();
                    const subUnitId = worksheet.getSheetId();
                    const selectionProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
                    const worksheetProtectionRuleModel = accessor.get(WorksheetProtectionRuleModel);
                    const permission$ = permissionService.composePermission$([new WorkbookCreateProtectPermission(unitId).id]).pipe(map((permissions) => permissions.every((permission) => permission.value))) ?? of(false);
                    const ruleChange$ = merge(
                        selectionProtectionRuleModel.ruleChange$,
                        worksheetProtectionRuleModel.ruleChange$
                    ).pipe(
                        startWith(null)
                    );
                    return combineLatest([permission$, ruleChange$]).pipe(
                        map(([permission, _]) => {
                            if (!permission) return true;
                            const worksheetRule = worksheetProtectionRuleModel.getRule(unitId, subUnitId);
                            if (worksheetRule?.permissionId) return true;
                            const subUnitRuleList = selectionProtectionRuleModel.getSubunitRuleList(unitId, subUnitId)?.filter((item) => item?.permissionId);
                            return subUnitRuleList.length > 0;
                        })
                    );
                })
            );
        })
    );
}

export function getRemovePermissionFromSheetBarDisable$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const permissionService = accessor.get(IPermissionService);
    const workbook$ = univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);
    const userManagerService = accessor.get(UserManagerService);

    return combineLatest([workbook$, userManagerService.currentUser$]).pipe(
        switchMap(([workbook, _]) => {
            if (!workbook) {
                return of(true);
            }

            return workbook.activeSheet$.pipe(
                switchMap((worksheet) => {
                    if (!worksheet) {
                        return of(true);
                    }
                    const unitId = workbook.getUnitId();
                    const subUnitId = worksheet.getSheetId();
                    const worksheetProtectionRuleModel = accessor.get(WorksheetProtectionRuleModel);
                    return worksheetProtectionRuleModel.ruleChange$.pipe(startWith(null)).pipe(
                        map(() => {
                            const rule = worksheetProtectionRuleModel.getRule(unitId, subUnitId);
                            if (rule) {
                                return permissionService.getPermissionPoint(new WorksheetDeleteProtectionPermission(unitId, subUnitId).id)?.value === false;
                            }
                            return true;
                        })
                    );
                })
            );
        })
    );
}

export function getSetPermissionFromSheetBarDisable$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const permissionService = accessor.get(IPermissionService);
    const workbook$ = univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);
    const userManagerService = accessor.get(UserManagerService);

    return combineLatest([workbook$, userManagerService.currentUser$]).pipe(
        switchMap(([workbook, _]) => {
            if (!workbook) {
                return of(true);
            }

            return workbook.activeSheet$.pipe(
                switchMap((worksheet) => {
                    if (!worksheet) {
                        return of(true);
                    }
                    const unitId = workbook.getUnitId();
                    const selectionProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
                    const worksheetProtectionRuleModel = accessor.get(WorksheetProtectionRuleModel);
                    const permission$ = permissionService.composePermission$([new WorkbookCreateProtectPermission(unitId).id, new WorkbookManageCollaboratorPermission(unitId).id]).pipe(map((permissions) => permissions.every((permission) => permission.value))) ?? of(false);
                    const worksheetRuleChange$ = worksheetProtectionRuleModel.ruleChange$.pipe(startWith(null));
                    const selectionRuleChange$ = selectionProtectionRuleModel.ruleChange$.pipe(startWith(null));
                    return combineLatest([permission$, worksheetRuleChange$, selectionRuleChange$]).pipe(
                        map(([permission, _, __]) => {
                            if (!permission) {
                                return true;
                            }
                            const subUnitId = worksheet.getSheetId();
                            const worksheetRule = worksheetProtectionRuleModel.getRule(unitId, subUnitId);
                            const selectionRuleList = selectionProtectionRuleModel.getSubunitRuleList(unitId, subUnitId);
                            if (worksheetRule || selectionRuleList.length) {
                                return false;
                            }
                            return true;
                        })
                    );
                })
            );
        })
    );
}

export function getRemovePermissionDisable$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const permissionService = accessor.get(IPermissionService);
    const workbook$ = univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);
    const userManagerService = accessor.get(UserManagerService);

    return combineLatest([workbook$, userManagerService.currentUser$]).pipe(
        switchMap(([workbook, _]) => {
            if (!workbook) {
                return of(true);
            }

            return workbook.activeSheet$.pipe(
                switchMap((worksheet) => {
                    if (!worksheet) {
                        return of(true);
                    }
                    const unitId = workbook.getUnitId();
                    const subUnitId = worksheet.getSheetId();
                    const sheetSelectionsService = accessor.get(SheetsSelectionsService);
                    const selectionProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
                    const worksheetProtectionRuleModel = accessor.get(WorksheetProtectionRuleModel);

                    const changes$ = merge(
                        selectionProtectionRuleModel.ruleChange$,
                        worksheetProtectionRuleModel.ruleChange$,
                        sheetSelectionsService.selectionMoveEnd$
                    ).pipe(startWith(null));
                    return combineLatest([changes$]).pipe(
                        map(([_]) => {
                            const selections = accessor.get(SheetsSelectionsService).getCurrentSelections();
                            const selectionRanges = selections?.map((selection) => selection.range);
                            if (!selectionRanges?.length || selectionRanges.length > 1) {
                                return true;
                            }

                            const selectionRange = selectionRanges[0];

                            if (selectionRange?.rangeType === RANGE_TYPE.ALL || selectionRange?.rangeType === RANGE_TYPE.COLUMN || selectionRange?.rangeType === RANGE_TYPE.ROW) {
                                return true;
                            }

                            const worksheetRule = worksheetProtectionRuleModel.getRule(unitId, subUnitId);
                            if (worksheetRule?.permissionId) {
                                return permissionService.getPermissionPoint(new WorksheetDeleteProtectionPermission(unitId, subUnitId).id)?.value === false;
                            }

                            const overlapRule = selectionProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).filter((rule) => {
                                return rule.ranges.some((range) => {
                                    return Rectangle.intersects(range, selectionRange);
                                });
                            });

                            if (overlapRule.length !== 1) {
                                return true;
                            }

                            const { startRow, endRow, startColumn, endColumn } = selectionRange;
                            const rangeProtectionCache = accessor.get(RangeProtectionCache);
                            for (let i = startRow; i <= endRow; i++) {
                                for (let j = startColumn; j <= endColumn; j++) {
                                    const cellInfo = rangeProtectionCache.getCellInfo(unitId, subUnitId, i, j);
                                    if (cellInfo) {
                                        return cellInfo[UnitAction.Delete] === false;
                                    }
                                }
                            }
                            return false;
                        })
                    );
                })
            );
        })
    );
}

export function getViewPermissionDisable$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const permissionService = accessor.get(IPermissionService);
    const workbook$ = univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);
    const userManagerService = accessor.get(UserManagerService);
    const editorBridgeService = accessor.has(IEditorBridgeService) ? accessor.get(IEditorBridgeService) : null;
    const contextService = accessor.get(IContextService);
    const formulaEditorFocus$ = contextService.subscribeContextValue$(FOCUSING_FX_BAR_EDITOR);
    const editorVisible$ = editorBridgeService?.visible$ ?? of(null);

    return combineLatest([workbook$, userManagerService.currentUser$, editorVisible$, formulaEditorFocus$]).pipe(
        switchMap(([workbook, _, visible, formulaEditorFocus]) => {
            if (!workbook || (visible?.visible && visible.unitId === workbook.getUnitId()) || formulaEditorFocus) {
                return of(true);
            }

            return workbook.activeSheet$.pipe(
                switchMap((worksheet) => {
                    if (!worksheet) {
                        return of(true);
                    }
                    const unitId = workbook.getUnitId();
                    const permission$ = permissionService.getPermissionPoint$(new WorkbookEditablePermission(unitId).id)?.pipe(map((e) => !!e.value)) ?? of(false);
                    return permission$.pipe(
                        map((permission) => !permission)
                    );
                })
            );
        })
    );
}
