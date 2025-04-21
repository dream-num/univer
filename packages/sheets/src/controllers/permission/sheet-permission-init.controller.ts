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
import type { UnitAction } from '@univerjs/protocol';
import type { IAddRangeProtectionMutationParams } from '../../commands/mutations/add-range-protection.mutation';
import type { IAddWorksheetProtectionParams } from '../../commands/mutations/add-worksheet-protection.mutation';
import type { ISetWorksheetPermissionPointsMutationParams } from '../../commands/mutations/set-worksheet-permission-points.mutation';
import { Disposable, IAuthzIoService, ICommandService, Inject, IPermissionService, IUndoRedoService, IUniverInstanceService, UniverInstanceType, UserManagerService } from '@univerjs/core';
import { UnitObject } from '@univerjs/protocol';
import { skip } from 'rxjs';
import { AddRangeProtectionMutation } from '../../commands/mutations/add-range-protection.mutation';
import { AddWorksheetProtectionMutation } from '../../commands/mutations/add-worksheet-protection.mutation';
import { SetWorksheetPermissionPointsMutation } from '../../commands/mutations/set-worksheet-permission-points.mutation';
import { RangeProtectionRuleModel } from '../../model/range-protection-rule.model';
import { defaultWorksheetPermissionPoint, getAllWorksheetPermissionPoint, getAllWorksheetPermissionPointByPointPanel } from '../../services/permission';
import { baseProtectionActions, getAllRangePermissionPoint } from '../../services/permission/range-permission/util';
import { defaultWorkbookPermissionPoints, getAllWorkbookPermissionPoint } from '../../services/permission/workbook-permission';
import { WorkbookPermissionService } from '../../services/permission/workbook-permission/workbook-permission.service';
import { WorksheetProtectionPointModel, WorksheetProtectionRuleModel } from '../../services/permission/worksheet-permission';

export class SheetPermissionInitController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IPermissionService private _permissionService: IPermissionService,
        @IAuthzIoService private _authzIoService: IAuthzIoService,
        @Inject(RangeProtectionRuleModel) private _rangeProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(WorksheetProtectionRuleModel) private _worksheetProtectionRuleModel: WorksheetProtectionRuleModel,
        @Inject(UserManagerService) private _userManagerService: UserManagerService,
        @Inject(WorksheetProtectionPointModel) private _worksheetProtectionPointRuleModel: WorksheetProtectionPointModel,
        @Inject(WorkbookPermissionService) private _workbookPermissionService: WorkbookPermissionService,
        @Inject(IUndoRedoService) private _undoRedoService: IUndoRedoService,
        @Inject(ICommandService) private _commandService: ICommandService
    ) {
        super();
    }

    public initPermission() {
        this._initRangePermissionFromSnapshot();
        this._initRangePermissionChange();
        this._initWorksheetPermissionFromSnapshot();
        this._initWorksheetPermissionChange();
        this._initWorksheetPermissionPointsChange();
        this._initWorkbookPermissionFromSnapshot();
        this._initUserChange();
        this._refreshPermissionByCollaCreate();
    }

    private async _initRangePermissionFromSnapshot() {
        const initRangePermissionFunc = async (workbook: Workbook) => {
            const allAllowedParams: {
                objectID: string;
                unitID: string;
                objectType: UnitObject;
                actions: UnitAction[];
            }[] = [];
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
                        actions: baseProtectionActions,
                    });
                });
            });

            if (!allAllowedParams.length) {
                this._rangeProtectionRuleModel.changeRuleInitState(true);
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
                this._rangeProtectionRuleModel.changeRuleInitState(true);
            });
        };

        await Promise.all(this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET).map((workbook) => initRangePermissionFunc(workbook)));
        this._rangeProtectionRuleModel.changeRuleInitState(true);
    }

    private _initRangePermissionChange() {
        this.disposeWithMe(
            this._rangeProtectionRuleModel.ruleChange$.subscribe((info) => {
                if (info.type !== 'delete') {
                    this._authzIoService.allowed({
                        objectID: info.rule.permissionId,
                        unitID: info.unitId,
                        objectType: UnitObject.SelectRange,
                        actions: baseProtectionActions,
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
                        this._rangeProtectionRuleModel.ruleRefresh(info.rule.permissionId);
                    });
                } else {
                    const ruleList = this._rangeProtectionRuleModel.getSubunitRuleList(info.unitId, info.subUnitId);
                    if (ruleList.length === 0) {
                        // because this rule is attached to other protection, if other protection is deleted, this rule should be deleted.
                        this._worksheetProtectionPointRuleModel.deleteRule(info.unitId, info.subUnitId);
                        [...getAllWorksheetPermissionPointByPointPanel()].forEach((F) => {
                            const instance = new F(info.unitId, info.subUnitId);
                            this._permissionService.updatePermissionPoint(instance.id, instance.value);
                        });
                    }
                }
            })
        );
    }

    public async initWorkbookPermissionChange(_unitId?: string) {
        const unitId = _unitId || this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)?.getUnitId();
        if (!unitId) {
            return;
        }
        return this._authzIoService.allowed({
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

    private async _initWorkbookPermissionFromSnapshot() {
        await Promise.all(this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET).map((workbook) => this.initWorkbookPermissionChange(workbook.getUnitId())));
        this._workbookPermissionService.changeUnitInitState(true);
    }

    private _initWorksheetPermissionChange() {
        this.disposeWithMe(
            this._worksheetProtectionRuleModel.ruleChange$.subscribe((info) => {
                if (info.type !== 'delete') {
                    this._authzIoService.allowed({
                        objectID: info.rule.permissionId,
                        unitID: info.unitId,
                        objectType: UnitObject.Worksheet,
                        actions: baseProtectionActions,
                    }).then((actionList) => {
                        getAllWorksheetPermissionPoint().forEach((F) => {
                            const instance = new F(info.unitId, info.subUnitId);
                            const unitActionName = instance.subType;
                            const action = actionList.find((item) => item.action === unitActionName);
                            if (action) {
                                this._permissionService.updatePermissionPoint(instance.id, action.allowed);
                            }
                        });
                        this._worksheetProtectionRuleModel.ruleRefresh(info.rule.permissionId);
                    });
                } else {
                    [...getAllWorksheetPermissionPoint(), ...getAllWorksheetPermissionPointByPointPanel()].forEach((F) => {
                        const instance = new F(info.unitId, info.subUnitId);
                        this._permissionService.updatePermissionPoint(instance.id, true);
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

    private async _initWorksheetPermissionFromSnapshot() {
        const initSheetPermissionFunc = async (workbook: Workbook) => {
            const allAllowedParams: {
                objectID: string;
                unitID: string;
                objectType: UnitObject;
                actions: UnitAction[];
            }[] = [];
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
                        actions: baseProtectionActions,
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
                this._worksheetProtectionRuleModel.changeRuleInitState(true);
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
                this._worksheetProtectionRuleModel.changeRuleInitState(true);
            });
        };

        await Promise.all(this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET).map((workbook) => initSheetPermissionFunc(workbook)));
        this._worksheetProtectionRuleModel.changeRuleInitState(true);
    }

    private _initUserChange() {
        this.disposeWithMe(
            // When the user changes, the permission points are updated. The first modification needs to be filtered here because it is a Behavior type, but in fact the user information is ready when this controller is initialized.
            this._userManagerService.currentUser$.pipe(skip(1)).subscribe(() => {
                // This is to minimize the need for access providers to update the reference to permission points when the current user changes, reducing the integration steps required.
                // If not handled this way, the access providers would have to handle the changes in user and the resulting changes in permission point references.
                const _map = this._permissionService.getAllPermissionPoint();

                this._permissionService.clearPermissionMap();

                this._worksheetProtectionRuleModel.changeRuleInitState(false);

                const workbooks = this._univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                workbooks.forEach((workbook) => {
                    const unitId = workbook.getUnitId();

                    getAllWorkbookPermissionPoint().forEach((F) => {
                        let instance = new F(unitId);
                        if (_map.has(instance.id)) {
                            instance = _map.get(instance.id) as any;
                        }
                        this._permissionService.addPermissionPoint(instance);
                    });

                    workbook.getSheets().forEach((sheet) => {
                        const subUnitId = sheet.getSheetId();
                        [...getAllWorksheetPermissionPoint(), ...getAllWorksheetPermissionPointByPointPanel()].forEach((F) => {
                            let instance = new F(unitId, subUnitId);
                            if (_map.has(instance.id)) {
                                instance = _map.get(instance.id) as any;
                            }
                            this._permissionService.addPermissionPoint(instance);
                        });

                        const ruleList = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId);
                        ruleList.forEach((rule) => {
                            getAllRangePermissionPoint().forEach((F) => {
                                let instance = new F(unitId, subUnitId, rule.permissionId);
                                if (_map.has(instance.id)) {
                                    instance = _map.get(instance.id) as any;
                                }
                                this._permissionService.addPermissionPoint(instance);
                            });
                        });
                    });

                    this._initWorkbookPermissionFromSnapshot();
                    this._initWorksheetPermissionFromSnapshot();
                    this._initRangePermissionFromSnapshot();
                });
            })
        );
    }

    public refreshPermission(unitId: string, permissionId: string) {
        const sheetRuleItem = this._worksheetProtectionRuleModel.getTargetByPermissionId(unitId, permissionId);
        let needClearUndoRedo = false;
        if (sheetRuleItem) {
            const [_, subUnitId] = sheetRuleItem;
            this._authzIoService.allowed({
                objectID: permissionId,
                unitID: unitId,
                objectType: UnitObject.Worksheet,
                actions: baseProtectionActions,
            }).then((actionList) => {
                let key = '';
                getAllWorksheetPermissionPoint().forEach((F) => {
                    const instance = new F(unitId, subUnitId);
                    const unitActionName = instance.subType;
                    const action = actionList.find((item) => item.action === unitActionName);
                    if (action) {
                        const originValue = this._permissionService.getPermissionPoint(instance.id)?.value;
                        if (originValue !== action.allowed) {
                            needClearUndoRedo = true;
                        }
                        this._permissionService.updatePermissionPoint(instance.id, action.allowed);
                        key += `${action.action}_${action.allowed}`;
                    }
                });
                this._worksheetProtectionRuleModel.ruleRefresh(`${permissionId}_${key}`);
                if (needClearUndoRedo) {
                    this._undoRedoService.clearUndoRedo(unitId);
                }
            });
        }
        const sheetPointItem = this._worksheetProtectionPointRuleModel.getTargetByPermissionId(unitId, permissionId);
        if (sheetPointItem) {
            const [_, subUnitId] = sheetPointItem;
            this._authzIoService.allowed({
                objectID: permissionId,
                unitID: unitId,
                objectType: UnitObject.Worksheet,
                actions: defaultWorksheetPermissionPoint,
            }).then((actionList) => {
                getAllWorksheetPermissionPointByPointPanel().forEach((F) => {
                    const instance = new F(unitId, subUnitId);
                    const unitActionName = instance.subType;
                    const action = actionList.find((item) => item.action === unitActionName);
                    if (action) {
                        const originValue = this._permissionService.getPermissionPoint(instance.id)?.value;
                        if (originValue !== action.allowed) {
                            needClearUndoRedo = true;
                        }
                        this._permissionService.updatePermissionPoint(instance.id, action.allowed);
                    }
                });
                if (needClearUndoRedo) {
                    this._undoRedoService.clearUndoRedo(unitId);
                }
            });
        }
        const rangeRuleItem = this._rangeProtectionRuleModel.getTargetByPermissionId(unitId, permissionId);
        if (rangeRuleItem) {
            const [_, subUnitId] = rangeRuleItem;
            this._authzIoService.allowed({
                objectID: permissionId,
                unitID: unitId,
                objectType: UnitObject.SelectRange,
                actions: baseProtectionActions,
            }).then((actionList) => {
                let key = '';
                getAllRangePermissionPoint().forEach((F) => {
                    const instance = new F(unitId, subUnitId, permissionId);
                    const unitActionName = instance.subType;
                    const action = actionList.find((item) => item.action === unitActionName);
                    if (action) {
                        const originValue = this._permissionService.getPermissionPoint(instance.id)?.value;
                        if (originValue !== action.allowed) {
                            needClearUndoRedo = true;
                        }
                        this._permissionService.updatePermissionPoint(instance.id, action.allowed);
                        key += `${action.action}_${action.allowed}`;
                    }
                });
                this._rangeProtectionRuleModel.ruleRefresh(`${permissionId}_${key}`);
                if (needClearUndoRedo) {
                    this._undoRedoService.clearUndoRedo(unitId);
                }
            });
        }
    }

    private _refreshPermissionByCollaCreate() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command, options) => {
                if (options?.fromCollab) {
                    if (
                        command.id === AddRangeProtectionMutation.id
                        || command.id === AddWorksheetProtectionMutation.id
                        || command.id === SetWorksheetPermissionPointsMutation.id
                    ) {
                        const params = command.params as IAddRangeProtectionMutationParams | IAddWorksheetProtectionParams | ISetWorksheetPermissionPointsMutationParams;
                        this._undoRedoService.clearUndoRedo(params.unitId);
                    }
                }
            })
        );
    }
}
