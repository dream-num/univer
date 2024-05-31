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
import { IPermissionService, IUniverInstanceService, Rectangle, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { RangeProtectionRuleModel, SelectionManagerService, WorkbookEditablePermission, WorkbookManageCollaboratorPermission, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';
import { combineLatest, map, merge, of, startWith, switchMap } from 'rxjs';

export function getAddPermissionHidden$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;

    const rangeProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
    const worksheetRuleModel = accessor.get(WorksheetProtectionRuleModel);

    return merge(
        selectionManagerService.selectionMoveEnd$,
        rangeProtectionRuleModel.ruleChange$,
        worksheetRuleModel.ruleChange$
    ).pipe(
        map(() => {
            const worksheet = workbook.getActiveSheet();
            const unitId = workbook.getUnitId();
            const subUnitId = worksheet.getSheetId();
            const subUnitRuleList = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId);
            const selections = selectionManagerService.getSelections();
            const selectionsRanges = selections?.map((selection) => selection.range);
            const ruleRanges = subUnitRuleList.map((rule) => rule.ranges).flat();
            if (!selectionsRanges) {
                return false;
            }
            const worksheetRule = worksheetRuleModel.getRule(unitId, subUnitId);
            if (worksheetRule?.permissionId && worksheetRule?.name) {
                return true;
            }
            return selectionsRanges?.some((selectionRange) => {
                return ruleRanges.some((ruleRange) => {
                    return Rectangle.intersects(selectionRange, ruleRange);
                });
            });
        })
    );
}

export function getEditPermissionHidden$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;

    const rangeRuleModel = accessor.get(RangeProtectionRuleModel);
    const worksheetRuleModel = accessor.get(WorksheetProtectionRuleModel);

    return merge(
        selectionManagerService.selectionMoveEnd$,
        rangeRuleModel.ruleChange$,
        worksheetRuleModel.ruleChange$
    ).pipe(
        map(() => {
            const worksheet = workbook.getActiveSheet();
            const unitId = workbook.getUnitId();
            const subUnitId = worksheet.getSheetId();
            const subUnitRuleList = rangeRuleModel.getSubunitRuleList(unitId, subUnitId);
            const selectionRanges = selectionManagerService.getSelections()?.map((selection) => selection.range);

            const ruleRanges = subUnitRuleList.map((rule) => rule.ranges).flat();
            if (!selectionRanges?.length) {
                return true;
            }

            if (selectionRanges.length > 1) {
                return true;
            }

            const selectedRange = selectionRanges[0];

            const worksheetRule = worksheetRuleModel.getRule(unitId, subUnitId);
            if (worksheetRule?.permissionId && worksheetRule?.name) {
                return false;
            }

            const lapRanges = ruleRanges.filter((ruleRange) => Rectangle.intersects(ruleRange, selectedRange));

            return lapRanges.length !== 1;
        })
    );
}

export function getPermissionDisableBase$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const selectionProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
    const worksheetProtectionRuleModel = accessor.get(WorksheetProtectionRuleModel);
    const unitId = workbook.getUnitId();
    const permissionService = accessor.get(IPermissionService);

    const selectionManagerService = accessor.get(SelectionManagerService);
    const userManagerService = accessor.get(UserManagerService);

    return combineLatest([workbook.activeSheet$, userManagerService.currentUser$]).pipe(
        switchMap(([sheet, _]) => {
            if (!sheet) {
                return of(true);
            }
            const permission$ = permissionService.getPermissionPoint$(new WorkbookManageCollaboratorPermission(unitId).id)?.pipe(map((e) => !!e.value)) ?? of(false);
            const ruleChange$ = merge(
                selectionManagerService.selectionMoveEnd$,
                selectionProtectionRuleModel.ruleChange$,
                worksheetProtectionRuleModel.ruleChange$
            ).pipe(
                startWith(null)
            );

            return combineLatest([permission$, ruleChange$]).pipe(
                map(([permission, _]) => {
                    if (!permission) {
                        return true;
                    }
                    const selections = selectionManagerService.getSelections();
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
}

export function getAddPermissionDisableBase$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const selectionProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
    const worksheetProtectionRuleModel = accessor.get(WorksheetProtectionRuleModel);
    const unitId = workbook.getUnitId();
    const selectionManagerService = accessor.get(SelectionManagerService);
    const userManagerService = accessor.get(UserManagerService);
    const permissionService = accessor.get(IPermissionService);

    return combineLatest([workbook.activeSheet$, userManagerService.currentUser$]).pipe(
        switchMap(([sheet, _]) => {
            if (!sheet) {
                return of(true);
            }
            const subUnitId = sheet.getSheetId();
            const permission$ = permissionService.getPermissionPoint$(new WorkbookManageCollaboratorPermission(unitId).id)?.pipe(map((e) => !!e.value)) ?? of(false);
            const ruleChange$ = merge(
                selectionManagerService.selectionMoveEnd$,
                selectionProtectionRuleModel.ruleChange$,
                worksheetProtectionRuleModel.ruleChange$
            ).pipe(
                startWith(null)
            );

            return combineLatest([permission$, ruleChange$]).pipe(
                map(([permission, _]) => {
                    if (!permission) {
                        return true;
                    }
                    const selections = selectionManagerService.getSelections();
                    const selectionRanges = selections?.map((selection) => selection.range);
                    if (!selectionRanges?.length) {
                        return true;
                    }

                    const worksheetRule = worksheetProtectionRuleModel.getRule(unitId, subUnitId);
                    if (worksheetRule?.permissionId && worksheetRule?.name) {
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
}

export function getAddPermissionFromSheetBarDisable$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const selectionProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
    const worksheetProtectionRuleModel = accessor.get(WorksheetProtectionRuleModel);
    const permissionService = accessor.get(IPermissionService);
    const userManagerService = accessor.get(UserManagerService);

    return combineLatest([workbook.activeSheet$, userManagerService.currentUser$]).pipe(
        switchMap(([activeSheet, _]) => {
            if (!activeSheet) {
                return of(true);
            }
            const unitId = workbook.getUnitId();
            const subUnitId = activeSheet.getSheetId();
            const permission$ = permissionService.getPermissionPoint$(new WorkbookManageCollaboratorPermission(unitId).id)?.pipe(map((e) => !!e.value)) ?? of(false);

            const ruleChange$ = merge(
                worksheetProtectionRuleModel.ruleChange$,
                selectionProtectionRuleModel.ruleChange$
            ).pipe(
                startWith(null)
            );

            return combineLatest([
                permission$,
                ruleChange$,
            ]).pipe(
                map(([permission, _]) => {
                    if (!permission) return true;
                    const worksheetRule = worksheetProtectionRuleModel.getRule(unitId, subUnitId);
                    if (worksheetRule?.permissionId && worksheetRule?.name) return true;
                    const subUnitRuleList = selectionProtectionRuleModel.getSubunitRuleList(unitId, subUnitId)?.filter((item) => item?.permissionId && item?.name);
                    return subUnitRuleList.length > 0;
                })
            );
        })
    );
}

export function getRemovePermissionFromSheetBarDisable$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const worksheetProtectionRuleModel = accessor.get(WorksheetProtectionRuleModel);
    const userManagerService = accessor.get(UserManagerService);
    const permissionService = accessor.get(IPermissionService);

    return combineLatest([workbook.activeSheet$, userManagerService.currentUser$, worksheetProtectionRuleModel.ruleChange$.pipe(startWith(null))]).pipe(
        switchMap(([activeSheet, _]) => {
            if (!activeSheet) {
                return of(true);
            }
            const unitId = workbook.getUnitId();
            const subUnitId = activeSheet.getSheetId();
            const permission$ = permissionService.getPermissionPoint$(new WorkbookManageCollaboratorPermission(unitId).id)?.pipe(map((e) => !!e.value)) ?? of(false);

            return permission$.pipe(
                map((permission) => {
                    if (!permission) return true;
                    const worksheetPermissionRule = worksheetProtectionRuleModel.getRule(unitId, subUnitId);
                    return !(worksheetPermissionRule?.permissionId && worksheetPermissionRule?.name);
                })
            );
        })
    );
}

export function getSetPermissionFromSheetBarDisable$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const permissionService = accessor.get(IPermissionService);
    const unitId = workbook.getUnitId();
    const userManagerService = accessor.get(UserManagerService);
    const worksheetRuleModel = accessor.get(WorksheetProtectionRuleModel);
    const selectionProtectionRuleModel = accessor.get(RangeProtectionRuleModel);

    return combineLatest([workbook.activeSheet$, userManagerService.currentUser$]).pipe(
        switchMap(([activeSheet, _]) => {
            if (!activeSheet) {
                return of(true);
            }
            const permission$ = permissionService.getPermissionPoint$(new WorkbookManageCollaboratorPermission(unitId).id)?.pipe(map((e) => !!e.value)) ?? of(false);
            const worksheetRuleChange$ = worksheetRuleModel.ruleChange$.pipe(startWith(null));
            const selectionRuleChange$ = selectionProtectionRuleModel.ruleChange$.pipe(startWith(null));
            return combineLatest([permission$, worksheetRuleChange$, selectionRuleChange$]).pipe(
                map(([permission, _, __]) => {
                    if (!permission) {
                        return true;
                    }
                    const subUnitId = activeSheet.getSheetId();
                    const worksheetRule = worksheetRuleModel.getRule(unitId, subUnitId);
                    const selectionRuleList = selectionProtectionRuleModel.getSubunitRuleList(unitId, subUnitId);
                    if (worksheetRule || selectionRuleList.length) {
                        return false;
                    }
                    return true;
                })
            );
        })
    );
}

export function getRemovePermissionDisable$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const selectionProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
    const worksheetProtectionRuleModel = accessor.get(WorksheetProtectionRuleModel);
    const unitId = workbook.getUnitId();
    const permissionService = accessor.get(IPermissionService);
    const userManagerService = accessor.get(UserManagerService);

    return combineLatest([workbook.activeSheet$, userManagerService.currentUser$]).pipe(
        switchMap(([activeSheet, _]) => {
            if (!activeSheet) {
                return of(true);
            }
            const subUnitId = activeSheet.getSheetId();
            const changes$ = merge(
                accessor.get(SelectionManagerService).selectionMoveEnd$,
                accessor.get(RangeProtectionRuleModel).ruleChange$,
                accessor.get(WorksheetProtectionRuleModel).ruleChange$
            );
            const permission$ = permissionService.getPermissionPoint$(new WorkbookManageCollaboratorPermission(unitId).id)?.pipe(map((e) => !!e.value)) ?? of(false);

            return combineLatest([changes$, permission$]).pipe(
                map(([_, permission]) => {
                    if (!permission) {
                        return true;
                    }
                    const selections = accessor.get(SelectionManagerService).getSelections();
                    const selectionRanges = selections?.map((selection) => selection.range);
                    if (!selectionRanges?.length || selectionRanges.length > 1) {
                        return true;
                    }

                    const selectionRange = selectionRanges[0];

                    const worksheetRule = worksheetProtectionRuleModel.getRule(unitId, subUnitId);
                    if (worksheetRule?.permissionId && worksheetRule?.name) {
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
}

export function getViewPermissionDisable$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const unitId = workbook.getUnitId();
    const userManagerService = accessor.get(UserManagerService);
    const permissionService = accessor.get(IPermissionService);

    return combineLatest([workbook.activeSheet$, userManagerService.currentUser$]).pipe(
        switchMap(([sheet, _]) => {
            if (!sheet) {
                return of(true);
            }
            const permission$ = permissionService.getPermissionPoint$(new WorkbookEditablePermission(unitId).id)?.pipe(map((e) => !!e.value)) ?? of(false);
            return permission$.pipe(
                map((permission) => !permission)
            );
        })
    );
}
