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

import type { IAccessor, IPermissionTypes, IRange, Nullable, Workbook, WorkbookPermissionPointConstructor, Worksheet } from '@univerjs/core';
import type { Observable } from 'rxjs';
import type { IEditorBridgeServiceVisibleParam } from '../../services/editor-bridge.service';
import { FOCUSING_COMMON_DRAWINGS, FOCUSING_FX_BAR_EDITOR, IContextService, IPermissionService, IUniverInstanceService, Rectangle, Tools, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { IExclusiveRangeService, RangeProtectionPermissionEditPoint, RangeProtectionRuleModel, SheetsSelectionsService, WorkbookEditablePermission, WorksheetEditPermission, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import { BehaviorSubject, combineLatest, merge, of } from 'rxjs';
import { debounceTime, finalize, map, startWith, switchMap } from 'rxjs/operators';
import { IEditorBridgeService } from '../../services/editor-bridge.service';

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

/**
 * @description Get the current exclusive range disable status
 * @param accessor The accessor
 * @param {Set<string>} [disableGroupSet] The disable group set, if provided, check if the interestGroupIds contains any of the disableGroupSet, otherwise check if the interestGroupIds is not empty
 * @returns {Observable<boolean>} The current exclusive range disable status
 */
export function getCurrentExclusiveRangeInterest$(accessor: IAccessor, disableGroupSet?: Set<string>) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const exclusiveRangeService = accessor.get(IExclusiveRangeService);
    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const workbook$ = univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);

    return workbook$.pipe(
        switchMap((workbook) => {
            if (!workbook) {
                return of(false);
            }
            return combineLatest([selectionManagerService.selectionMoveEnd$, workbook.activeSheet$]).pipe(
                switchMap(([selections, worksheet]) => {
                    if (!worksheet) {
                        return of(false);
                    }
                    if (selections.length === 0) {
                        return of(false);
                    }

                    const interestGroupIds = exclusiveRangeService.getInterestGroupId(selections);
                    // if disableGroupSet is provided, check if the interestGroupIds contains any of the disableGroupSet
                    if (disableGroupSet) {
                        const disableGroup = interestGroupIds.filter((groupId) => disableGroupSet.has(groupId));
                        return of(disableGroup.length > 0);
                    } else {
                        return of(interestGroupIds.length > 0);
                    }
                })
            );
        })
    );
}

/**
 * Get the observable combine with exclusive range
 * @param accessor The accessor
 * @param {Observable<boolean>} observable$
 * @param {Set<string>} [disableGroupSet] The disable group set, if provided, check if the interestGroupIds contains any of the disableGroupSet, otherwise check if the interestGroupIds is not empty
 * @returns {Observable<boolean>} The observable combine with exclusive range
 */
export function getObservableWithExclusiveRange$(accessor: IAccessor, observable$: Observable<boolean>, disableGroupSet?: Set<string>): Observable<boolean> {
    return combineLatest([observable$, getCurrentExclusiveRangeInterest$(accessor, disableGroupSet)]).pipe(
        map(([observable, exclusiveRangeDisable]) => observable || exclusiveRangeDisable)
    );
}

// eslint-disable-next-line max-lines-per-function
export function getCurrentRangeDisable$(accessor: IAccessor, permissionTypes: IPermissionTypes = {}, supportCellEdit = false) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook$ = univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET);
    const userManagerService = accessor.get(UserManagerService);
    const editorBridgeService = accessor.has(IEditorBridgeService) ? accessor.get(IEditorBridgeService) : null;
    const contextService = accessor.get(IContextService);
    const formulaEditorFocus$ = new BehaviorSubject<boolean>(false);
    const _editorVisible$ = editorBridgeService?.visible$;

    const editorVisible$ = new BehaviorSubject<IEditorBridgeServiceVisibleParam | null>(null);
    const subscription = contextService.subscribeContextValue$(FOCUSING_FX_BAR_EDITOR).subscribe((visible) => {
        formulaEditorFocus$.next(visible);
    });

    const editorVisibleSubscription = _editorVisible$?.subscribe((visible) => {
        editorVisible$.next(visible);
    });

    const observable = combineLatest([userManagerService.currentUser$, workbook$, editorVisible$, formulaEditorFocus$]).pipe(
        finalize(() => {
            subscription.unsubscribe();
            editorVisibleSubscription?.unsubscribe();
            formulaEditorFocus$.complete();
        }),
        switchMap(([_, workbook, visible, formulaEditorFocus]) => {
            if (
                !workbook ||
                (visible?.visible && visible.unitId === workbook.getUnitId() && !supportCellEdit) ||
                (formulaEditorFocus && !supportCellEdit)
            ) {
                return of(true);
            }

            return workbook.activeSheet$.pipe(
                switchMap((worksheet) => {
                    if (!worksheet) {
                        return of(true);
                    }

                    const selectionManagerService = accessor.get(SheetsSelectionsService);
                    const rangeProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
                    const worksheetRuleModel = accessor.get(WorksheetProtectionRuleModel);

                    const contextService = accessor.get(IContextService);
                    const focusedOnDrawing$ = contextService.subscribeContextValue$(FOCUSING_COMMON_DRAWINGS).pipe(startWith(false));

                    return combineLatest([selectionManagerService.selectionMoveEnd$, focusedOnDrawing$]).pipe(
                        switchMap(([selection, focusOnDrawings]) => {
                            if (focusOnDrawings) {
                                return of(true);
                            }

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

                            const selectionRanges = selection?.map((selection) => selection.range);
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
                })
            );
        })
    );

    return observable;
}

export function getBaseRangeMenuHidden$(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);

    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const rangeProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
    const permissionService = accessor.get(IPermissionService);

    return merge(selectionManagerService.selectionMoveEnd$, permissionService.permissionPointUpdate$.pipe(debounceTime(100))).pipe(
        map(() => {
            const range = selectionManagerService.getCurrentLastSelection()?.range;
            if (!range) return true;

            const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            const worksheet = workbook?.getActiveSheet();
            if (!workbook || !worksheet) {
                return true;
            }

            const unitId = workbook.getUnitId();
            const subUnitId = worksheet.getSheetId();

            const permissionIds: string[] = [new WorkbookEditablePermission(unitId).id, new WorksheetEditPermission(unitId, subUnitId).id];

            rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).filter((rule) => {
                return rule.ranges.some((ruleRange) => Rectangle.intersects(range, ruleRange));
            }).forEach((rule) => {
                permissionIds.push(new RangeProtectionPermissionEditPoint(unitId, subUnitId, rule.permissionId).id);
            });

            return permissionService.composePermission(permissionIds).some((item) => item.value === false);
        })
    );
}

export function getInsertAfterMenuHidden$(accessor: IAccessor, type: 'row' | 'col') {
    const univerInstanceService = accessor.get(IUniverInstanceService);

    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const rangeProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
    const permissionService = accessor.get(IPermissionService);

    return merge(selectionManagerService.selectionMoveEnd$, permissionService.permissionPointUpdate$.pipe(debounceTime(100))).pipe(
        map(() => {
            const range = selectionManagerService.getCurrentLastSelection()?.range;
            if (!range) return true;

            const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            const worksheet = workbook?.getActiveSheet();
            if (!workbook || !worksheet) {
                return true;
            }

            const unitId = workbook.getUnitId();
            const subUnitId = worksheet.getSheetId();

            const permissionIds: string[] = [new WorkbookEditablePermission(unitId).id, new WorksheetEditPermission(unitId, subUnitId).id];

            rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).filter((rule) => {
                if (type === 'row') {
                    return rule.ranges.some((ruleRange) => {
                        return range.endRow > ruleRange.startRow && range.endRow <= ruleRange.endRow;
                    });
                } else {
                    return rule.ranges.some((ruleRange) => {
                        return range.endColumn > ruleRange.startColumn && range.endColumn <= ruleRange.endColumn;
                    });
                }
            }).forEach((rule) => {
                permissionIds.push(new RangeProtectionPermissionEditPoint(unitId, subUnitId, rule.permissionId).id);
            });

            return permissionService.composePermission(permissionIds).some((item) => item.value === false);
        })
    );
}

export function getInsertBeforeMenuHidden$(accessor: IAccessor, type: 'row' | 'col') {
    const univerInstanceService = accessor.get(IUniverInstanceService);

    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const rangeProtectionRuleModel = accessor.get(RangeProtectionRuleModel);
    const permissionService = accessor.get(IPermissionService);

    return merge(selectionManagerService.selectionMoveEnd$, permissionService.permissionPointUpdate$.pipe(debounceTime(100))).pipe(
        map(() => {
            const range = selectionManagerService.getCurrentLastSelection()?.range;
            if (!range) return true;

            const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            const worksheet = workbook?.getActiveSheet();
            if (!workbook || !worksheet) {
                return true;
            }

            const unitId = workbook.getUnitId();
            const subUnitId = worksheet.getSheetId();

            const permissionIds: string[] = [new WorkbookEditablePermission(unitId).id, new WorksheetEditPermission(unitId, subUnitId).id];

            rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).filter((rule) => {
                if (type === 'row') {
                    return rule.ranges.some((ruleRange) => {
                        return range.startRow > ruleRange.startRow && range.startRow <= ruleRange.endRow;
                    });
                } else {
                    return rule.ranges.some((ruleRange) => {
                        return range.startColumn > ruleRange.startColumn && range.startColumn <= ruleRange.endColumn;
                    });
                }
            }).forEach((rule) => {
                permissionIds.push(new RangeProtectionPermissionEditPoint(unitId, subUnitId, rule.permissionId).id);
            });

            return permissionService.composePermission(permissionIds).some((item) => item.value === false);
        })
    );
}

export function getDeleteMenuHidden$(accessor: IAccessor, type: 'row' | 'col') {
    const univerInstanceService = accessor.get(IUniverInstanceService);

    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const rangeProtectionRuleModel = accessor.get(RangeProtectionRuleModel);

    const permissionService = accessor.get(IPermissionService);

    return merge(selectionManagerService.selectionMoveEnd$, permissionService.permissionPointUpdate$.pipe(debounceTime(100))).pipe(
        map(() => {
            const range = selectionManagerService.getCurrentLastSelection()?.range;
            if (!range) return true;

            const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            const worksheet = workbook?.getActiveSheet();
            if (!workbook || !worksheet) {
                return true;
            }

            const unitId = workbook.getUnitId();
            const subUnitId = worksheet.getSheetId();

            const permissionIds: string[] = [new WorkbookEditablePermission(unitId).id, new WorksheetEditPermission(unitId, subUnitId).id];

            const rowColRangeExpand = Tools.deepClone(range) as IRange;

            if (type === 'row') {
                rowColRangeExpand.startColumn = 0;
                rowColRangeExpand.endColumn = worksheet.getColumnCount() - 1;
            } else {
                rowColRangeExpand.startRow = 0;
                rowColRangeExpand.endRow = worksheet.getRowCount() - 1;
            }

            rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).filter((rule) => {
                return rule.ranges.some((ruleRange) => Rectangle.intersects(rowColRangeExpand, ruleRange));
            }).forEach((rule) => {
                permissionIds.push(new RangeProtectionPermissionEditPoint(unitId, subUnitId, rule.permissionId).id);
            });

            return permissionService.composePermission(permissionIds).some((item) => item.value === false);
        })
    );
}

export function getCellMenuHidden$(accessor: IAccessor, type: 'row' | 'col') {
    const univerInstanceService = accessor.get(IUniverInstanceService);

    const selectionManagerService = accessor.get(SheetsSelectionsService);
    const rangeProtectionRuleModel = accessor.get(RangeProtectionRuleModel);

    const permissionService = accessor.get(IPermissionService);

    return merge(selectionManagerService.selectionMoveEnd$, permissionService.permissionPointUpdate$.pipe(debounceTime(100))).pipe(
        map(() => {
            const range = selectionManagerService.getCurrentLastSelection()?.range;
            if (!range) return true;

            const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            const worksheet = workbook?.getActiveSheet();
            if (!workbook || !worksheet) {
                return true;
            }

            const unitId = workbook.getUnitId();
            const subUnitId = worksheet.getSheetId();

            const permissionIds: string[] = [new WorkbookEditablePermission(unitId).id, new WorksheetEditPermission(unitId, subUnitId).id];

            const rowColRangeExpand = Tools.deepClone(range) as IRange;
            if (type === 'row') {
                rowColRangeExpand.endRow = worksheet.getRowCount() - 1;
            } else {
                rowColRangeExpand.endColumn = worksheet.getColumnCount() - 1;
            }

            rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).filter((rule) => {
                return rule.ranges.some((ruleRange) => Rectangle.intersects(rowColRangeExpand, ruleRange));
            }).forEach((rule) => {
                permissionIds.push(new RangeProtectionPermissionEditPoint(unitId, subUnitId, rule.permissionId).id);
            });

            return permissionService.composePermission(permissionIds).some((item) => item.value === false);
        })
    );
}

export function getWorkbookPermissionDisable$(accessor: IAccessor, workbookPermissionTypes: WorkbookPermissionPointConstructor[]) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook$ = univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
    const worksheetRuleModel = accessor.get(WorksheetProtectionRuleModel);
    const selectionRuleModel = accessor.get(RangeProtectionRuleModel);
    const permissionService = accessor.get(IPermissionService);
    const userManagerService = accessor.get(UserManagerService);

    return combineLatest([userManagerService.currentUser$, workbook$]).pipe(
        switchMap(([_user, workbook]) => {
            if (!workbook) {
                return of(true);
            }
            return workbook.activeSheet$.pipe(
                switchMap((activeSheet) => {
                    if (!activeSheet) {
                        return of(true);
                    }
                    const unitId = workbook.getUnitId();
                    const workbookPermissionIds: string[] = [];
                    workbookPermissionTypes.forEach((F) => workbookPermissionIds.push(new F(unitId).id));
                    const workbookPermission$ = permissionService.composePermission$(workbookPermissionIds).pipe(map((list) => list.every((item) => item.value === true)));

                    return workbookPermission$.pipe(
                        map((basePermission) => {
                            if (!basePermission) {
                                return true;
                            }

                            const subUnitId = activeSheet.getSheetId();
                            const worksheetRule = worksheetRuleModel.getRule(unitId, subUnitId);
                            const rangeRuleList = selectionRuleModel.getSubunitRuleList(unitId, subUnitId);
                            if (worksheetRule || rangeRuleList.length) {
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
