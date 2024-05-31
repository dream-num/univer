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
import { IAuthzIoService, IPermissionService, IUniverInstanceService, LifecycleStages, OnLifecycle, RxDisposable, UniverInstanceType, UserManagerService } from '@univerjs/core';

import { defaultWorkbookPermissionPoints, defaultWorksheetPermissionPoint, getAllRangePermissionPoint, getAllWorkbookPermissionPoint, getAllWorksheetPermissionPoint, getAllWorksheetPermissionPointByPointPanel, RangeProtectionRuleModel, WorksheetProtectionPointModel, WorksheetProtectionRuleModel } from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';
import { IDialogService } from '@univerjs/ui';

import { UnitAction, UnitObject, UniverType } from '@univerjs/protocol';

import type { IRenderContext } from '@univerjs/engine-render';

@OnLifecycle(LifecycleStages.Rendered, SheetPermissionInitController)
export class SheetPermissionInitController extends RxDisposable {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IDialogService private readonly _dialogService: IDialogService,
        @IPermissionService private _permissionService: IPermissionService,
        @IAuthzIoService private _authzIoService: IAuthzIoService,
        @Inject(RangeProtectionRuleModel) private _rangeProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(WorksheetProtectionRuleModel) private _worksheetProtectionRuleModel: WorksheetProtectionRuleModel,
        @Inject(UserManagerService) private _userManagerService: UserManagerService,
        @Inject(WorksheetProtectionPointModel) private _worksheetProtectionPointRuleModel: WorksheetProtectionPointModel
    ) {
        super();
        this._initRangePermissionFromSnapshot();
        this._initRangePermissionChange();
        this._initWorksheetPermissionFromSnapshot();
        this._initWorksheetPermissionChange();
        this._initWorksheetPermissionPointsChange();
        this._initWorkbookPermissionChange();
        this._initUserChange();
    }

    private _initRangePermissionFromSnapshot() {
        const allAllowedParams: {
            objectID: string;
            unitID: string;
            objectType: UnitObject;
            actions: UnitAction[];
        }[] = [];
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverType.UNIVER_SHEET)!;
        const unitId = workbook.getUnitId();
        const allSheets = workbook.getSheets();
        const permissionIdWithRuleInstanceMap = new Map();
        allSheets.forEach((sheet) => {
            const subunitId = sheet.getSheetId();
            this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subunitId).forEach((rule) => {
                permissionIdWithRuleInstanceMap.set(rule.permissionId, rule);
                allAllowedParams.push({
                    objectID: rule.permissionId,
                    unitID: unitId,
                    objectType: UnitObject.SelectRange,
                    actions: [UnitAction.View, UnitAction.Edit],
                });
            });
        });

        if (!allAllowedParams.length) {
            return;
        }

        this._authzIoService.batchAllowed(allAllowedParams).then((permissionMap) => {
            permissionMap.forEach((item) => {
                const rule = permissionIdWithRuleInstanceMap.get(item.objectID);
                if (rule) {
                    getAllRangePermissionPoint().forEach((F) => {
                        const instance = new F(unitId, rule.subUnitId, item.objectID);
                        const unitActionName = instance.subType;
                        const result = item.actions.find((action) => action.action === unitActionName);
                        if (result?.allowed !== undefined) {
                            this._permissionService.updatePermissionPoint(instance.id, result.allowed);
                        }
                    });
                }
            });
        });
    }

    private _initRangePermissionChange() {
        this.disposeWithMe(
            this._rangeProtectionRuleModel.ruleChange$.subscribe((info) => {
                if (info.type !== 'delete') {
                    this._authzIoService.allowed({
                        objectID: info.rule.permissionId,
                        unitID: info.unitId,
                        objectType: UnitObject.SelectRange,
                        actions: [UnitAction.Edit, UnitAction.View],
                    }).then((actionList) => {
                        getAllRangePermissionPoint().forEach((F) => {
                            if (info.type === 'set') {
                                const { rule, oldRule } = info;
                                if (rule.permissionId === oldRule?.permissionId) {
                                    return;
                                }
                            }
                            const rule = info.rule;
                            const instance = new F(rule.unitId, rule.subUnitId, rule.permissionId);
                            const unitActionName = instance.subType;
                            const action = actionList.find((item) => item.action === unitActionName);
                            if (action) {
                                this._permissionService.updatePermissionPoint(instance.id, action.allowed);
                            }
                        });
                    });
                } else {
                    const ruleList = this._rangeProtectionRuleModel.getSubunitRuleList(info.unitId, info.subUnitId);
                    if (ruleList.length === 0) {
                        this._worksheetProtectionPointRuleModel.deleteRule(info.unitId, info.subUnitId);
                        [...getAllWorksheetPermissionPointByPointPanel()].forEach((F) => {
                            const instance = new F(info.unitId, info.subUnitId);
                            this._permissionService.addPermissionPoint(instance);
                        });
                    }
                }
            })
        );
    }

    private _initWorkbookPermissionChange() {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const unitId = workbook.getUnitId();
        this._authzIoService.allowed({
            objectID: unitId,
            objectType: UnitObject.Workbook,
            unitID: unitId,
            actions: defaultWorkbookPermissionPoints,
        }).then((actionList) => {
            getAllWorkbookPermissionPoint().forEach((F) => {
                const instance = new F(unitId);
                const unitActionName = instance.subType;
                const action = actionList.find((item) => item.action === unitActionName);
                if (action) {
                    this._permissionService.updatePermissionPoint(instance.id, action.allowed);
                }
            });
        });
    }

    private _initWorksheetPermissionChange() {
        this.disposeWithMe(
            this._worksheetProtectionRuleModel.ruleChange$.subscribe((info) => {
                if (info.type !== 'delete') {
                    this._authzIoService.allowed({
                        objectID: info.rule.permissionId,
                        unitID: info.unitId,
                        objectType: UnitObject.Worksheet,
                        actions: [UnitAction.Edit, UnitAction.View],
                    }).then((actionList) => {
                        getAllWorksheetPermissionPoint().forEach((F) => {
                            const instance = new F(info.unitId, info.subUnitId);
                            const unitActionName = instance.subType;
                            const action = actionList.find((item) => item.action === unitActionName);
                            if (action) {
                                this._permissionService.updatePermissionPoint(instance.id, action.allowed);
                            }
                        });
                    });
                } else {
                    [...getAllWorksheetPermissionPoint(), ...getAllWorksheetPermissionPointByPointPanel()].forEach((F) => {
                        const instance = new F(info.unitId, info.subUnitId);
                        this._permissionService.addPermissionPoint(instance);
                    });
                    this._worksheetProtectionPointRuleModel.deleteRule(info.unitId, info.subUnitId);
                }
            })
        );
    }

    private _initWorksheetPermissionPointsChange() {
        this.disposeWithMe(
            this._worksheetProtectionPointRuleModel.pointChange$.subscribe((info) => {
                this._authzIoService.allowed({
                    objectID: info.permissionId,
                    unitID: info.unitId,
                    objectType: UnitObject.Worksheet,
                    actions: defaultWorksheetPermissionPoint,
                }).then((actionList) => {
                    getAllWorksheetPermissionPointByPointPanel().forEach((F) => {
                        const instance = new F(info.unitId, info.subUnitId);
                        const unitActionName = instance.subType;
                        const action = actionList.find((item) => item.action === unitActionName);
                        if (action) {
                            this._permissionService.updatePermissionPoint(instance.id, action.allowed);
                        }
                    });
                });
            })
        );
    }

    private _initWorksheetPermissionFromSnapshot() {
        const allAllowedParams: {
            objectID: string;
            unitID: string;
            objectType: UnitObject;
            actions: UnitAction[];
        }[] = [];
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverType.UNIVER_SHEET)!;
        const unitId = workbook.getUnitId();
        const allSheets = workbook.getSheets();
        const permissionIdWithRuleInstanceMap = new Map();
        allSheets.forEach((sheet) => {
            const subUnitId = sheet.getSheetId();
            const rule = this._worksheetProtectionRuleModel.getRule(unitId, subUnitId);
            if (rule) {
                permissionIdWithRuleInstanceMap.set(rule.permissionId, rule);
                allAllowedParams.push({
                    objectID: rule.permissionId,
                    unitID: unitId,
                    objectType: UnitObject.Worksheet,
                    actions: [UnitAction.Edit, UnitAction.View],
                });
            }

            const pointRule = this._worksheetProtectionPointRuleModel.getRule(unitId, subUnitId);
            if (pointRule) {
                permissionIdWithRuleInstanceMap.set(pointRule.permissionId, pointRule);
                allAllowedParams.push({
                    objectID: pointRule.permissionId,
                    unitID: unitId,
                    objectType: UnitObject.Worksheet,
                    actions: defaultWorksheetPermissionPoint,
                });
            }
        });

        if (!allAllowedParams.length) {
            return;
        }

        this._authzIoService.batchAllowed(allAllowedParams).then((permissionMap) => {
            permissionMap.forEach((item) => {
                const rule = permissionIdWithRuleInstanceMap.get(item.objectID);
                if (rule) {
                    [...getAllWorksheetPermissionPoint(), ...getAllWorksheetPermissionPointByPointPanel()].forEach((F) => {
                        const instance = new F(unitId, rule.subUnitId);
                        const unitActionName = instance.subType;
                        const result = item.actions.find((action) => action.action === unitActionName);
                        if (result?.allowed !== undefined) {
                            this._permissionService.updatePermissionPoint(instance.id, result.allowed);
                        }
                    });
                }
            });
        });
    }

    private _initUserChange() {
        this.disposeWithMe(
            this._userManagerService.currentUser$.subscribe(() => {
                this._permissionService.clearPermissionMap();
                this._worksheetProtectionRuleModel.changeRuleInitState(false);

                const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
                const unitId = workbook.getUnitId();

                getAllWorkbookPermissionPoint().forEach((F) => {
                    const instance = new F(unitId);
                    this._permissionService.addPermissionPoint(instance);
                });

                workbook.getSheets().forEach((sheet) => {
                    const subUnitId = sheet.getSheetId();
                    [...getAllWorksheetPermissionPoint(), ...getAllWorksheetPermissionPointByPointPanel()].forEach((F) => {
                        const instance = new F(unitId, subUnitId);
                        this._permissionService.addPermissionPoint(instance);
                    });

                    const ruleList = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId);
                    ruleList.forEach((rule) => {
                        getAllRangePermissionPoint().forEach((F) => {
                            const instance = new F(unitId, subUnitId, rule.permissionId);
                            this._permissionService.addPermissionPoint(instance);
                        });
                    });
                });

                this._initWorkbookPermissionChange();
                this._initWorksheetPermissionFromSnapshot();
                this._initRangePermissionFromSnapshot();
            })
        );
    }
}
