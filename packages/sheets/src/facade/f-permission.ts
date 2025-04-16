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

import type { RangePermissionPointConstructor, WorkbookPermissionPointConstructor, WorkSheetPermissionPointConstructor } from '@univerjs/core';
import type { ISetWorksheetPermissionPointsMutationParams } from '@univerjs/sheets';
import type { Observable } from 'rxjs';
import type { FRange } from './f-range';
import { generateRandomId, IAuthzIoService, ICommandService, Inject, Injector, IPermissionService, Rectangle } from '@univerjs/core';
import { FBase } from '@univerjs/core/facade';
import { AddRangeProtectionMutation, AddWorksheetProtectionMutation, DeleteRangeProtectionMutation, DeleteWorksheetProtectionMutation, getAllWorksheetPermissionPoint, getAllWorksheetPermissionPointByPointPanel, PermissionPointsDefinitions, RangeProtectionRuleModel, SetRangeProtectionMutation, SetWorksheetPermissionPointsMutation, UnitObject, WorkbookEditablePermission, WorksheetEditPermission, WorksheetProtectionPointModel, WorksheetProtectionRuleModel, WorksheetViewPermission } from '@univerjs/sheets';

/**
 * @description Used to generate permission instances to control permissions for the entire workbook
 * @hideconstructor
 */
export class FPermission extends FBase {
    /**
     * Permission point definition, can read the point constructor want to modify from here
     */
    public permissionPointsDefinition = PermissionPointsDefinitions;
    /**
     * An observable object used to monitor permission change events within a range, thereby triggering corresponding subsequent processing.
     */
    public rangeRuleChangedAfterAuth$: Observable<string>;
    /**
     * An observable object used to monitor permission change events within a worksheet, thereby triggering corresponding subsequent processing.
     */
    public sheetRuleChangedAfterAuth$: Observable<string>;

    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @ICommandService protected readonly _commandService: ICommandService,
        @IPermissionService protected readonly _permissionService: IPermissionService,
        @Inject(WorksheetProtectionRuleModel) protected readonly _worksheetProtectionRuleModel: WorksheetProtectionRuleModel,
        @Inject(RangeProtectionRuleModel) protected readonly _rangeProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(WorksheetProtectionPointModel) protected readonly _worksheetProtectionPointRuleModel: WorksheetProtectionPointModel,
        @Inject(IAuthzIoService) protected readonly _authzIoService: IAuthzIoService
    ) {
        super();
        this.rangeRuleChangedAfterAuth$ = this._rangeProtectionRuleModel.ruleRefresh$;
        this.sheetRuleChangedAfterAuth$ = this._worksheetProtectionRuleModel.ruleRefresh$;
    }

    /**
     * Configures a specific permission point for a workbook.
     * This function sets or updates a permission point for a workbook identified by `unitId`.
     * It creates a new permission point if it does not already exist, and updates the point with the provided value.
     * @param {string} unitId - The unique identifier of the workbook for which the permission is being set.
     * @param {WorkbookPermissionPointConstructor} FPointClass - The constructor function for creating a permission point instance. Other point constructors can See the [permission-point documentation](https://github.com/dream-num/univer/tree/dev/packages/sheets/src/services/permission/permission-point) for more details.
     * @param {boolean} value - The boolean value to determine whether the permission point is enabled or disabled.
     *
     * @example
     * ```typescript
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook.getPermission();
     * const unitId = workbook.getId();
     * permission.setWorkbookPermissionPoint(unitId, permission.permissionPointsDefinition.WorkbookEditablePermission, false)
     * ```
     */
    setWorkbookPermissionPoint(unitId: string, FPointClass: WorkbookPermissionPointConstructor, value: boolean): void {
        const instance = new FPointClass(unitId);
        const permissionPoint = this._permissionService.getPermissionPoint(instance.id);
        if (!permissionPoint) {
            this._permissionService.addPermissionPoint(instance);
        }
        this._permissionService.updatePermissionPoint(instance.id, value);
    }

    /**
     * This function is used to set whether the workbook can be edited
     * @param {string} unitId - The unique identifier of the workbook for which the permission is being set.
     * @param {boolean} value - A value that controls whether the workbook can be edited
     *
     * @example
     * ```typescript
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook.getPermission();
     * const unitId = workbook.getId();
     * permission.setWorkbookEditPermission(unitId, false);
     * ```
     */
    setWorkbookEditPermission(unitId: string, value: boolean): void {
        this.setWorkbookPermissionPoint(unitId, WorkbookEditablePermission, value);
    }

    /**
     * This function is used to add a base permission for a worksheet.
     * Note that after adding, only the background mask of the permission module will be rendered. If you want to modify the function permissions,
     * you need to modify the permission points with the permissionId returned by this function.
     * @param {string} unitId - The unique identifier of the workbook for which the permission is being set.
     * @param {string} subUnitId - The unique identifier of the worksheet for which the permission is being set.
     * @returns {Promise<string | undefined>} - Returns the `permissionId` if the permission is successfully added. If the operation fails or no result is returned, it resolves to `undefined`.
     *
     * @example
     * ```typescript
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook.getPermission();
     * const unitId = workbook.getId();
     * const worksheet = workbook.getActiveSheet();
     * const subUnitId = worksheet.getSheetId();
     * // Note that there will be no permission changes after this step is completed. It only returns an ID for subsequent permission changes.
     * // For details, please see the example of the **`setWorksheetPermissionPoint`** API.
     * const permissionId = await permission.addWorksheetBasePermission(unitId, subUnitId)
     * // Can still edit and read it.
     * console.log('debugger', permissionId)
     * ```
     */
    async addWorksheetBasePermission(unitId: string, subUnitId: string): Promise<string | undefined> {
        const hasRangeProtection = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).length > 0;
        if (hasRangeProtection) {
            throw new Error('sheet protection cannot intersect with range protection');
        }
        const permissionId = await this._authzIoService.create({
            objectType: UnitObject.Worksheet,
            worksheetObject: {
                collaborators: [],
                unitID: unitId,
                strategies: [],
                name: '',
                scope: undefined,
            },
        });
        const res = this._commandService.syncExecuteCommand(AddWorksheetProtectionMutation.id, {
            unitId,
            subUnitId,
            rule: {
                permissionId,
                unitType: UnitObject.Worksheet,
                unitId,
                subUnitId,
            },
        });
        if (res) {
            return permissionId;
        }
    }

    /**
     * Delete the entire table protection set for the worksheet and reset the point permissions of the worksheet to true
     * @param {string} unitId - The unique identifier of the workbook for which the permission is being set.
     * @param {string} subUnitId - The unique identifier of the worksheet for which the permission is being set.
     *
     * @example
     * ```typescript
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook.getPermission();
     * const unitId = workbook.getId();
     * const worksheet = workbook.getActiveSheet();
     * const subUnitId = worksheet.getSheetId();
     * permission.removeWorksheetPermission(unitId, subUnitId);
     * ```
     */
    removeWorksheetPermission(unitId: string, subUnitId: string): void {
        this._commandService.syncExecuteCommand(DeleteWorksheetProtectionMutation.id, {
            unitId,
            subUnitId,
        });

        [...getAllWorksheetPermissionPoint(), ...getAllWorksheetPermissionPointByPointPanel()].forEach((F) => {
            const instance = new F(unitId, subUnitId);
            this._permissionService.updatePermissionPoint(instance.id, true);
        });
        this._worksheetProtectionPointRuleModel.deleteRule(unitId, subUnitId);
    }

    /**
     * Sets the worksheet permission point by updating or adding the permission point for the worksheet.
     * If the worksheet doesn't have a base permission, it creates one to used render
     * @param {string} unitId - The unique identifier of the workbook.
     * @param {string} subUnitId - The unique identifier of the worksheet.
     * @param {WorkSheetPermissionPointConstructor} FPointClass - The constructor for the permission point class.
     *    See the [permission-point documentation](https://github.com/dream-num/univer/tree/dev/packages/sheets/src/services/permission/permission-point) for more details.
     * @param {boolean} value - The new permission value to be set for the worksheet.
     * @returns {Promise<string | undefined>} - Returns the `permissionId` if the permission point is successfully set or created. If no permission is set, it resolves to `undefined`.
     *
     * @example
     * ```typescript
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook.getPermission();
     * const unitId = workbook.getId();
     * const worksheet = workbook.getActiveSheet();
     * const subUnitId = worksheet.getSheetId();
     * const permissionId = await permission.addWorksheetBasePermission(unitId, subUnitId)
     * // After this line of code , the worksheet will no longer be editable
     * permission.setWorksheetPermissionPoint(unitId, subUnitId, permission.permissionPointsDefinition.WorksheetEditPermission, false);
     * ```
     */
    async setWorksheetPermissionPoint(unitId: string, subUnitId: string, FPointClass: WorkSheetPermissionPointConstructor, value: boolean): Promise<string | undefined> {
        const hasBasePermission = this._worksheetProtectionRuleModel.getRule(unitId, subUnitId);
        let permissionId;
        const isBasePoint = FPointClass === WorksheetEditPermission || FPointClass === WorksheetViewPermission;
        if (isBasePoint) {
            if (!hasBasePermission) {
                const hasRangeProtection = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).length > 0;
                if (hasRangeProtection) {
                    throw new Error('sheet protection cannot intersect with range protection');
                }
                permissionId = await this.addWorksheetBasePermission(unitId, subUnitId);
            } else {
                permissionId = hasBasePermission.permissionId;
            }
        } else {
            const rule = this._worksheetProtectionPointRuleModel.getRule(unitId, subUnitId);
            if (!rule) {
                permissionId = await this._authzIoService.create({
                    objectType: UnitObject.Worksheet,
                    worksheetObject: {
                        collaborators: [],
                        unitID: unitId,
                        strategies: [],
                        name: '',
                        scope: undefined,
                    },
                });
                this._commandService.syncExecuteCommand<ISetWorksheetPermissionPointsMutationParams>(SetWorksheetPermissionPointsMutation.id, { unitId, subUnitId, rule: { unitId, subUnitId, permissionId } });
            } else {
                permissionId = rule.permissionId;
            }
        }

        const instance = new FPointClass(unitId, subUnitId);
        const permissionPoint = this._permissionService.getPermissionPoint(instance.id);
        if (!permissionPoint) {
            this._permissionService.addPermissionPoint(instance);
        }
        this._permissionService.updatePermissionPoint(instance.id, value);

        return permissionId;
    }

    /**
     * Adds a range protection to the worksheet.
     * Note that after adding, only the background mask of the permission module will be rendered. If you want to modify the function permissions,
     * you need to modify the permission points with the permissionId returned by this function.
     * @param {string} unitId - The unique identifier of the workbook.
     * @param {string} subUnitId - The unique identifier of the worksheet.
     * @param {FRange[]} ranges - The ranges to be protected.
     * @returns {Promise<{ permissionId: string, ruleId: string } | undefined>} - Returns an object containing the `permissionId` and `ruleId` if the range protection is successfully added. If the operation fails or no result is returned, it resolves to `undefined`. permissionId is used to stitch permission point ID，ruleId is used to store permission rules
     *
     * @example
     * ```typescript
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook.getPermission();
     * const unitId = workbook.getId();
     * const worksheet = workbook.getActiveSheet();
     * const subUnitId = worksheet.getSheetId();
     * const range = worksheet.getRange('A1:B2');
     * const ranges = [];
     * ranges.push(range);
     * // Note that there will be no permission changes after this step is completed. It only returns an ID for subsequent permission changes.
     * // For details, please see the example of the **`setRangeProtectionPermissionPoint`** API.
     * const res = await permission.addRangeBaseProtection(unitId, subUnitId, ranges);
     * const {permissionId, ruleId} = res;
     * console.log('debugger', permissionId, ruleId);
     * ```
     */
    async addRangeBaseProtection(unitId: string, subUnitId: string, ranges: FRange[]): Promise<{
        permissionId: string;
        ruleId: string;
    } | undefined> {
        // The permission ID generation here only provides the most basic permission type. If need collaborators later, need to expand this
        const permissionId = await this._authzIoService.create({
            objectType: UnitObject.SelectRange,
            selectRangeObject: {
                collaborators: [],
                unitID: unitId,
                name: '',
                scope: undefined,
            },
        });
        const ruleId = `ruleId_${generateRandomId(6)}`;
        const worksheetProtection = this._worksheetProtectionRuleModel.getRule(unitId, subUnitId);
        if (worksheetProtection) {
            throw new Error('sheet protection cannot intersect with range protection');
        }
        const subunitRuleList = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId);
        const overlap = subunitRuleList.some((rule) => {
            return rule.ranges.some((range) => {
                return ranges.some((newRange) => {
                    return Rectangle.intersects(newRange.getRange(), range);
                });
            });
        });
        if (overlap) {
            throw new Error('range protection cannot intersect');
        }
        const res = this._commandService.syncExecuteCommand(AddRangeProtectionMutation.id, {
            unitId,
            subUnitId,
            rules: [{
                permissionId,
                unitType: UnitObject.SelectRange,
                unitId,
                subUnitId,
                ranges: ranges.map((range) => range.getRange()),
                id: ruleId,
            }],
        });
        if (res) {
            return {
                permissionId,
                ruleId,
            };
        }
    }

    /**
     * Removes the range protection from the worksheet.
     * @param {string} unitId - The unique identifier of the workbook.
     * @param {string} subUnitId - The unique identifier of the worksheet.
     * @param {string[]} ruleIds - The rule IDs of the range protection to be removed.
     *
     * @example
     * ```typescript
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook.getPermission();
     * const unitId = workbook.getId();
     * const worksheet = workbook.getActiveSheet();
     * const subUnitId = worksheet.getSheetId();
     * const range = worksheet.getRange('A1:B2');
     * const ranges = [];
     * ranges.push(range);
     * const res = await permission.addRangeBaseProtection(unitId, subUnitId, ranges);
     * const ruleId = res.ruleId;
     * permission.removeRangeProtection(unitId, subUnitId, [ruleId]);
     * ```
     */
    removeRangeProtection(unitId: string, subUnitId: string, ruleIds: string[]): void {
        const res = this._commandService.syncExecuteCommand(DeleteRangeProtectionMutation.id, {
            unitId,
            subUnitId,
            ruleIds,
        });
        if (res) {
            const ruleList = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId);
            if (ruleList.length === 0) {
                // because this rule is attached to other protection, if other protection is deleted, this rule should be deleted.
                this._worksheetProtectionPointRuleModel.deleteRule(unitId, subUnitId);
                [...getAllWorksheetPermissionPointByPointPanel()].forEach((F) => {
                    const instance = new F(unitId, subUnitId);
                    this._permissionService.updatePermissionPoint(instance.id, instance.value);
                });
            }
        }
    }

    /**
     * Modify the permission points of a custom area
     * @param {string} unitId - The unique identifier of the workbook.
     * @param {string} subUnitId - The unique identifier of the worksheet within the workbook.
     * @param {string} permissionId - The unique identifier of the permission that controls access to the range.
     * @param {RangePermissionPointConstructor} FPointClass - The constructor for the range permission point class.
     *    See the [permission-point documentation](https://github.com/dream-num/univer/tree/dev/packages/sheets/src/services/permission/permission-point) for more details.
     * @param {boolean} value - The new permission value to be set for the range (e.g., true for allowing access, false for restricting access).
     *
     * @example
     * ```typescript
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook.getPermission();
     * const unitId = workbook.getId();
     * const worksheet = workbook.getActiveSheet();
     * const subUnitId = worksheet.getSheetId();
     * const range = worksheet.getRange('A1:B2');
     * const ranges = [];
     * ranges.push(range);
     * // Note that there will be no permission changes after this step is completed. It only returns an ID for subsequent permission changes.
     * // For details, please see the example of the **`setRangeProtectionPermissionPoint`** API.
     * const res = await permission.addRangeBaseProtection(unitId, subUnitId, ranges);
     * const {permissionId, ruleId} = res;
     * // After passing the following line of code, the range set above will become uneditable
     * permission.setRangeProtectionPermissionPoint(unitId,subUnitId,permissionId, permission.permissionPointsDefinition.RangeProtectionPermissionEditPoint, false);
     * ```
     */
    setRangeProtectionPermissionPoint(unitId: string, subUnitId: string, permissionId: string, FPointClass: RangePermissionPointConstructor, value: boolean): void {
        const instance = new FPointClass(unitId, subUnitId, permissionId);
        const permissionPoint = this._permissionService.getPermissionPoint(instance.id);
        if (!permissionPoint) {
            this._permissionService.addPermissionPoint(instance);
        }
        this._permissionService.updatePermissionPoint(instance.id, value);
    }

    /**
     * Sets the ranges for range protection in a worksheet.
     *
     * This method finds the rule by unitId, subUnitId, and ruleId, and updates the rule with the provided ranges.
     * It checks for overlaps with existing ranges in the same subunit and shows an error message if any overlap is detected.
     * If no overlap is found, it executes the command to update the range protection with the new ranges.
     * @param {string} unitId - The unique identifier of the workbook.
     * @param {string} subUnitId - The unique identifier of the worksheet within the workbook.
     * @param {string} ruleId - The ruleId of the range protection rule that is being updated.
     * @param {FRange[]} ranges - The array of new ranges to be set for the range protection rule.
     *
     * @example
     * ```typescript
     * const workbook = univerAPI.getActiveWorkbook();
     * const permission = workbook.getPermission();
     * const unitId = workbook.getId();
     * const worksheet = workbook.getActiveSheet();
     * const subUnitId = worksheet.getSheetId();
     * const range = worksheet.getRange('A1:B2');
     * const ranges = [];
     * ranges.push(range);
     * const res = await permission.addRangeBaseProtection(unitId, subUnitId, ranges);
     * const {permissionId, ruleId} = res;
     * const newRange = worksheet.getRange('C1:D2');
     * permission.setRangeProtectionRanges(unitId, subUnitId, ruleId, [newRange]);
     * ```
     */
    setRangeProtectionRanges(unitId: string, subUnitId: string, ruleId: string, ranges: FRange[]): void {
        const rule = this._rangeProtectionRuleModel.getRule(unitId, subUnitId, ruleId);
        if (rule) {
            const subunitRuleList = this._rangeProtectionRuleModel.getSubunitRuleList(unitId, subUnitId).filter((r) => r.id !== ruleId);
            const overlap = subunitRuleList.some((rule) => {
                return rule.ranges.some((range) => {
                    return ranges.some((newRange) => {
                        return Rectangle.intersects(newRange.getRange(), range);
                    });
                });
            });
            if (overlap) {
                throw new Error('range protection cannot intersect');
            }
            this._commandService.syncExecuteCommand(SetRangeProtectionMutation.id, {
                unitId,
                subUnitId,
                ruleId,
                rule: {
                    ...rule,
                    ranges: ranges.map((range) => range.getRange()),
                },
            });
        }
    }
}
