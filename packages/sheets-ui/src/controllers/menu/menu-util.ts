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

import type { ICellDataForSheetInterceptor, IPermissionTypes, IRange, Nullable, Workbook, Worksheet } from '@univerjs/core';
import { IPermissionService, IUniverInstanceService, Rectangle, Tools, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { UnitAction } from '@univerjs/protocol';

import type { ICellPermission } from '@univerjs/sheets';
import { RangeProtectionRuleModel, SelectionManagerService, WorkbookEditablePermission, WorkbookManageCollaboratorPermission, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';
import type { Observable } from 'rxjs';
import { combineLatest, map, of, switchMap } from 'rxjs';

interface IActive {
    workbook: Workbook;
    worksheet: Worksheet;
}

function getActiveSheet$(univerInstanceService: IUniverInstanceService): Observable<Nullable<IActive>> {
    return univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET).pipe(switchMap((workbook) =>
        workbook
            ? workbook.activeSheet$.pipe(map((worksheet) => {
                if (!worksheet) return null;
                return { workbook, worksheet };
            }))
            : of(null)));
}

export function deriveStateFromActiveSheet$<T>(univerInstanceService: IUniverInstanceService, defaultValue: T, callback: (active: IActive) => Observable<T>) {
    return getActiveSheet$(univerInstanceService).pipe(switchMap((active) => {
        if (!active) return of(defaultValue);
        return callback(active);
    }));
}

export function getCurrentRangeDisable$(accessor: IAccessor, permissionTypes: IPermissionTypes = {}) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const rangeProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
    const worksheetRuleModel = accessor.get(WorksheetProtectionRuleModel);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const userManagerService = accessor.get(UserManagerService);
    if (!workbook) {
        return of(true);
    }
    return combineLatest([userManagerService.currentUser$, workbook.activeSheet$, selectionManagerService.selectionMoveEnd$]).pipe(
        switchMap(() => {
            const worksheet = workbook.getActiveSheet();
            const unitId = workbook.getUnitId();
            const subUnitId = worksheet.getSheetId();

            const permissionService = accessor.get(IPermissionService);

            const { workbookTypes = [WorkbookEditablePermission], worksheetTypes, rangeTypes } = permissionTypes;

            const permissionIds: string[] = [];

            workbookTypes?.forEach((F) => {
                permissionIds.push(new F(unitId).id);
            });

            worksheetTypes?.forEach((F) => {
                permissionIds.push(new F(unitId, subUnitId).id);
            });

            const worksheetRule = worksheetRuleModel.getRule(unitId, subUnitId);

            if (worksheetRule) {
                return permissionService.composePermission$(permissionIds).pipe(map((list) => {
                    return list.some((item) => item.value === false);
                }));
            }

            const selectionRanges = selectionManagerService.getSelections()?.map((selection) => selection.range);
            const rules = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).filter((rule) => {
                return selectionRanges?.some((range) => {
                    return rule.ranges.some((ruleRange) => Rectangle.intersects(range, ruleRange));
                });
            });

            rangeTypes?.forEach((F) => {
                rules.forEach((rule) => {
                    permissionIds.push(new F(unitId, subUnitId, rule.permissionId).id);
                });
            });

            return permissionService.composePermission$(permissionIds).pipe(map((list) => {
                return list.some((item) => item.value === false);
            }));
        })
    );
}

export function getCommentDisable$(accessor: IAccessor, permissionTypes: IPermissionTypes = {}) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const selectionManagerService = accessor.get(SelectionManagerService);
    const rangeProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
    const worksheetRuleModel = accessor.get(WorksheetProtectionRuleModel);
    const userManagerService = accessor.get(UserManagerService);
    return combineLatest([userManagerService.currentUser$, selectionManagerService.selectionMoveEnd$]).pipe(
        switchMap(() => {
            const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            if (!workbook) {
                return of(true);
            }
            const worksheet = workbook.getActiveSheet();
            const unitId = workbook.getUnitId();
            const subUnitId = worksheet.getSheetId();

            const permissionService = accessor.get(IPermissionService);

            const { workbookTypes = [WorkbookEditablePermission], worksheetTypes, rangeTypes } = permissionTypes;

            const permissionIds: string[] = [];

            workbookTypes?.forEach((F) => {
                permissionIds.push(new F(unitId).id);
            });

            worksheetTypes?.forEach((F) => {
                permissionIds.push(new F(unitId, subUnitId).id);
            });

            const worksheetRule = worksheetRuleModel.getRule(unitId, subUnitId);

            if (worksheetRule) {
                return permissionService.composePermission$(permissionIds).pipe(map((list) => {
                    return list.some((item) => item.value === false);
                }));
            }

            const selectionRanges = selectionManagerService.getSelections()?.map((selection) => selection.range);
            const rules = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).filter((rule) => {
                return selectionRanges?.some((range) => {
                    return rule.ranges.some((ruleRange) => Rectangle.intersects(range, ruleRange));
                });
            });

            rangeTypes?.forEach((F) => {
                rules.forEach((rule) => {
                    permissionIds.push(new F(unitId, subUnitId, rule.permissionId).id);
                });
            });

            return permissionService.composePermission$(permissionIds).pipe(map((list) => {
                return list.some((item) => item.value === false);
            }));
        })
    );
}

export function getBaseRangeMenuHidden$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);

    const selectionManagerService = accessor.get(SelectionManagerService);
    const rangeProtectionRuleModel = accessor.get(RangeProtectionRuleModel);

    return selectionManagerService.selectionMoveEnd$.pipe(
        map(() => {
            const range = selectionManagerService.getLast()?.range;
            if (!range) return true;

            const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            const worksheet = workbook.getActiveSheet();
            const unitId = workbook.getUnitId();
            const subUnitId = worksheet.getSheetId();

            const permissionLapRanges = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).reduce((acc, rule) => {
                return [...acc, ...rule.ranges];
            }, [] as IRange[]).filter((ruleRange) => Rectangle.intersects(range, ruleRange));

            return permissionLapRanges.some((ruleRange) => {
                const { startRow, startColumn, endRow, endColumn } = ruleRange;
                for (let row = startRow; row <= endRow; row++) {
                    for (let col = startColumn; col <= endColumn; col++) {
                        const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                        if (permission?.[UnitAction.Edit] === false) {
                            return true;
                        }
                    }
                }
                return false;
            });
        })
    );
}

export function getInsertAfterMenuHidden$(accessor: IAccessor, type: 'row' | 'col') {
    const univerInstanceService = accessor.get(IUniverInstanceService);

    const selectionManagerService = accessor.get(SelectionManagerService);
    const rangeProtectionRuleModel = accessor.get(RangeProtectionRuleModel);

    return selectionManagerService.selectionMoveEnd$.pipe(
        map(() => {
            const range = selectionManagerService.getLast()?.range;
            if (!range) return true;

            const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            const worksheet = workbook.getActiveSheet();
            const unitId = workbook.getUnitId();
            const subUnitId = worksheet.getSheetId();

            const permissionLapRanges = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).reduce((acc, rule) => {
                return [...acc, ...rule.ranges];
            }, [] as IRange[]).filter((ruleRange) => {
                if (type === 'row') {
                    return range.endRow > ruleRange.startRow && range.endRow <= ruleRange.endRow;
                } else {
                    return range.endColumn > ruleRange.startColumn && range.endColumn <= ruleRange.endColumn;
                }
            });

            return permissionLapRanges.some((ruleRange) => {
                const { startRow, startColumn, endRow, endColumn } = ruleRange;
                for (let row = startRow; row <= endRow; row++) {
                    for (let col = startColumn; col <= endColumn; col++) {
                        const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                        if (permission?.[UnitAction.Edit] === false) {
                            return true;
                        }
                    }
                }
                return false;
            });
        })
    );
}

export function getInsertBeforeMenuHidden$(accessor: IAccessor, type: 'row' | 'col') {
    const univerInstanceService = accessor.get(IUniverInstanceService);

    const selectionManagerService = accessor.get(SelectionManagerService);
    const rangeProtectionRuleModel = accessor.get(RangeProtectionRuleModel);

    return selectionManagerService.selectionMoveEnd$.pipe(
        map(() => {
            const range = selectionManagerService.getLast()?.range;
            if (!range) return true;

            const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            const worksheet = workbook.getActiveSheet();
            const unitId = workbook.getUnitId();
            const subUnitId = worksheet.getSheetId();

            const permissionLapRanges = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).reduce((acc, rule) => {
                return [...acc, ...rule.ranges];
            }, [] as IRange[]).filter((ruleRange) => {
                if (type === 'row') {
                    return range.startRow > ruleRange.startRow && range.startRow <= ruleRange.endRow;
                } else {
                    return range.startColumn > ruleRange.startColumn && range.startColumn <= ruleRange.endColumn;
                }
            });

            return permissionLapRanges.some((ruleRange) => {
                const { startRow, startColumn, endRow, endColumn } = ruleRange;
                for (let row = startRow; row <= endRow; row++) {
                    for (let col = startColumn; col <= endColumn; col++) {
                        const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                        if (permission?.[UnitAction.Edit] === false) {
                            return true;
                        }
                    }
                }
                return false;
            });
        })
    );
}

export function getDeleteMenuHidden$(accessor: IAccessor, type: 'row' | 'col') {
    const univerInstanceService = accessor.get(IUniverInstanceService);

    const selectionManagerService = accessor.get(SelectionManagerService);
    const rangeProtectionRuleModel = accessor.get(RangeProtectionRuleModel);

    return selectionManagerService.selectionMoveEnd$.pipe(
        map(() => {
            const range = selectionManagerService.getLast()?.range;
            if (!range) return true;

            const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            const worksheet = workbook.getActiveSheet();
            const unitId = workbook.getUnitId();
            const subUnitId = worksheet.getSheetId();

            const rowColRangeExpand = Tools.deepClone(range);

            if (type === 'row') {
                rowColRangeExpand.startColumn = 0;
                rowColRangeExpand.endColumn = worksheet.getColumnCount() - 1;
            } else {
                rowColRangeExpand.startRow = 0;
                rowColRangeExpand.endRow = worksheet.getRowCount() - 1;
            }
            const permissionLapRanges = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).reduce((acc, rule) => {
                return [...acc, ...rule.ranges];
            }, [] as IRange[]).filter((ruleRange) => Rectangle.intersects(rowColRangeExpand, ruleRange));

            return permissionLapRanges.some((ruleRange) => {
                const { startRow, startColumn, endRow, endColumn } = ruleRange;
                for (let row = startRow; row <= endRow; row++) {
                    for (let col = startColumn; col <= endColumn; col++) {
                        const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                        if (permission?.[UnitAction.Edit] === false) {
                            return true;
                        }
                    }
                }
                return false;
            });
        })
    );
}

export function getCellMenuHidden$(accessor: IAccessor, type: 'row' | 'col') {
    const univerInstanceService = accessor.get(IUniverInstanceService);

    const selectionManagerService = accessor.get(SelectionManagerService);
    const rangeProtectionRuleModel = accessor.get(RangeProtectionRuleModel);

    return selectionManagerService.selectionMoveEnd$.pipe(
        map(() => {
            const range = selectionManagerService.getLast()?.range;
            if (!range) return true;

            const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
            const worksheet = workbook.getActiveSheet();
            const unitId = workbook.getUnitId();
            const subUnitId = worksheet.getSheetId();

            const rowColRangeExpand = Tools.deepClone(range);
            if (type === 'row') {
                rowColRangeExpand.endRow = worksheet.getRowCount() - 1;
            } else {
                rowColRangeExpand.endColumn = worksheet.getColumnCount() - 1;
            }

            const permissionLapRanges = rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).reduce((acc, rule) => {
                return [...acc, ...rule.ranges];
            }, [] as IRange[]).filter((ruleRange) => Rectangle.intersects(ruleRange, rowColRangeExpand));

            return permissionLapRanges.some((ruleRange) => {
                const { startRow, startColumn, endRow, endColumn } = ruleRange;
                for (let row = startRow; row <= endRow; row++) {
                    for (let col = startColumn; col <= endColumn; col++) {
                        const permission = (worksheet.getCell(row, col) as (ICellDataForSheetInterceptor & { selectionProtection: ICellPermission[] }))?.selectionProtection?.[0];
                        if (permission?.[UnitAction.Edit] === false) {
                            return true;
                        }
                    }
                }
                return false;
            });
        })
    );
}

export function getWorkbookPermissionDisable$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const worksheetRuleModel = accessor.get(WorksheetProtectionRuleModel);
    const selectionRuleModel = accessor.get(RangeProtectionRuleModel);
    const permissionService = accessor.get(IPermissionService);
    const unitId = workbook.getUnitId();

    const activeSheet$ = workbook.activeSheet$;

    const userManagerService = accessor.get(UserManagerService);

    return combineLatest([userManagerService.currentUser$, activeSheet$]).pipe(
        switchMap(([_user, activeSheet]) => {
            if (!activeSheet) {
                return of(true);
            }
            const workbookEditable$ = permissionService.getPermissionPoint$(new WorkbookEditablePermission(unitId).id)?.pipe(map((permission) => permission.value)) ?? of(false);
            const workbookManageCollaboratorPermission$ = permissionService.getPermissionPoint$(new WorkbookManageCollaboratorPermission(unitId).id)?.pipe(map((permission) => permission.value)) ?? of(false);

            return combineLatest([workbookEditable$, workbookManageCollaboratorPermission$]).pipe(
                map(([editable, manageable]) => {
                    if (!editable) {
                        return true;
                    }

                    const subUnitId = activeSheet.getSheetId();
                    const worksheetRule = worksheetRuleModel.getRule(unitId, subUnitId);
                    const worksheetRuleList = selectionRuleModel.getSubunitRuleList(unitId, subUnitId);
                    if (worksheetRule || worksheetRuleList.length) {
                        return !manageable;
                    }
                    return false;
                })
            );
        })
    );
}
