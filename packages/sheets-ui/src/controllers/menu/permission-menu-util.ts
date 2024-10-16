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
import { FOCUSING_COMMON_DRAWINGS, IContextService, IPermissionService, IUniverInstanceService, Rectangle, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { RangeProtectionRuleModel, SheetsSelectionsService, WorkbookEditablePermission, WorkbookManageCollaboratorPermission, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import { combineLatest, map, merge, of, startWith, switchMap } from 'rxjs';

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

                            const selectedRange = selectionRanges[0];

                            const worksheetRule = worksheetRuleModel.getRule(unitId, subUnitId);
                            if (worksheetRule?.permissionId) {
                                return false;
                            }

                            const lapRanges = ruleRanges.filter((ruleRange) => Rectangle.intersects(ruleRange, selectedRange));

                            return lapRanges.length !== 1;
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
                    const permission$ = permissionService.composePermission$([new WorkbookManageCollaboratorPermission(unitId).id, new WorkbookEditablePermission(unitId).id]).pipe(map((permissions) => permissions.every((permission) => permission.value))) ?? of(false);
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
                    const contextService = accessor.get(IContextService);
                    const focusingDrawing$ = contextService.subscribeContextValue$(FOCUSING_COMMON_DRAWINGS).pipe(startWith(false));
                    const unitId = workbook.getUnitId();
                    const subUnitId = worksheet.getSheetId();
                    const selectionProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
                    const worksheetProtectionRuleModel = accessor.get(WorksheetProtectionRuleModel);
                    const selectionManagerService = accessor.get(SheetsSelectionsService);
                    const permission$ = permissionService.composePermission$([new WorkbookManageCollaboratorPermission(unitId).id, new WorkbookEditablePermission(unitId).id]).pipe(map((permissions) => permissions.every((permission) => permission.value))) ?? of(false);
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
                    const permission$ = permissionService.composePermission$([new WorkbookManageCollaboratorPermission(unitId).id, new WorkbookEditablePermission(unitId).id]).pipe(map((permissions) => permissions.every((permission) => permission.value))) ?? of(false);
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
                    const permission$ = permissionService.composePermission$([new WorkbookManageCollaboratorPermission(unitId).id, new WorkbookEditablePermission(unitId).id]).pipe(map((permissions) => permissions.every((permission) => permission.value))) ?? of(false);
                    return combineLatest([permission$, worksheetProtectionRuleModel.ruleChange$.pipe(startWith(null))]).pipe(
                        map(([permission, _]) => {
                            if (!permission) return true;
                            const worksheetPermissionRule = worksheetProtectionRuleModel.getRule(unitId, subUnitId);
                            return !(worksheetPermissionRule?.permissionId);
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
                    const permission$ = permissionService.composePermission$([new WorkbookManageCollaboratorPermission(unitId).id, new WorkbookEditablePermission(unitId).id]).pipe(map((permissions) => permissions.every((permission) => permission.value))) ?? of(false);
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
                    const permission$ = permissionService.composePermission$([new WorkbookManageCollaboratorPermission(unitId).id, new WorkbookEditablePermission(unitId).id]).pipe(map((permissions) => permissions.every((permission) => permission.value))) ?? of(false);

                    const changes$ = merge(
                        selectionProtectionRuleModel.ruleChange$,
                        worksheetProtectionRuleModel.ruleChange$,
                        sheetSelectionsService.selectionMoveEnd$
                    ).pipe(startWith(null));
                    return combineLatest([changes$, permission$]).pipe(
                        map(([_, permission]) => {
                            if (!permission) {
                                return true;
                            }
                            const selections = accessor.get(SheetsSelectionsService).getCurrentSelections();
                            const selectionRanges = selections?.map((selection) => selection.range);
                            if (!selectionRanges?.length || selectionRanges.length > 1) {
                                return true;
                            }

                            const selectionRange = selectionRanges[0];

                            const worksheetRule = worksheetProtectionRuleModel.getRule(unitId, subUnitId);
                            if (worksheetRule?.permissionId) {
                                return false;
                            }

                            const subUnitRuleRanges = selectionProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).map((rule) => rule.ranges).flat();

                            const hasLap = subUnitRuleRanges.some((ruleRange) => {
                                return Rectangle.intersects(selectionRange, ruleRange);
                            });

                            if (hasLap) {
                                return false;
                            } else {
                                return true;
                            }
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
                    const permission$ = permissionService.getPermissionPoint$(new WorkbookEditablePermission(unitId).id)?.pipe(map((e) => !!e.value)) ?? of(false);
                    return permission$.pipe(
                        map((permission) => !permission)
                    );
                })
            );
        })
    );
}

