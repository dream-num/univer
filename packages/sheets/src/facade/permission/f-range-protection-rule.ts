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

import type { IDeleteRangeProtectionMutationParams, ISetRangeProtectionMutationParams } from '@univerjs/sheets';
import type { FRange } from '../f-range';
import type { IRangeProtectionOptions, RangePermissionSnapshot } from './permission-types';
import { IAuthzIoService, ICommandService, Inject, Injector, IPermissionService, Rectangle } from '@univerjs/core';
import { UnitObject, UnitRole } from '@univerjs/protocol';
import { DeleteRangeProtectionMutation, RangeProtectionRuleModel, SetRangeProtectionMutation } from '@univerjs/sheets';
import { RANGE_PERMISSION_POINT_MAP } from './permission-point-map';
import { RangePermissionPoint } from './permission-types';
import { handleWorksheetRangePermissionIsEmpty } from './util';

/**
 * Implementation class for range protection rules
 * Encapsulates operations on a single protection rule
 *
 * @hideconstructor
 */
export class FRangeProtectionRule {
    constructor(
        private readonly _unitId: string,
        private readonly _subUnitId: string,
        private readonly _ruleId: string,
        private readonly _permissionId: string,
        private readonly _ranges: FRange[],
        private readonly _options: IRangeProtectionOptions,
        @Inject(Injector) private readonly _injector: Injector,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @IAuthzIoService private readonly _authzIoService: IAuthzIoService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(RangeProtectionRuleModel) private readonly _rangeProtectionRuleModel: RangeProtectionRuleModel
    ) {}

    /**
     * Get the rule ID.
     */
    get id(): string {
        return this._ruleId;
    }

    /**
     * Get the permission ID associated with this rule.
     */
    get permissionId(): string {
        return this._permissionId;
    }

    /**
     * Get the protected ranges.
     */
    get ranges(): FRange[] {
        return this._ranges;
    }

    /**
     * Get the protection options.
     */
    get options(): IRangeProtectionOptions {
        return { ...this._options };
    }

    /**
     * Update the protected ranges.
     * @param {FRange[]} ranges New ranges to protect.
     * @returns {Promise<void>} A promise that resolves when the ranges are updated.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const rules = await fWorksheet.getWorksheetPermission().listRangeProtectionRules();
     * // Update the ranges to A1:C3 for the first rule
     * if (rules.length > 0) {
     *   const rule = rules[0];
     *   const result = await rule.updateRanges([fWorksheet.getRange('A1:C3')]);
     *   console.log(result);
     * }
     * ```
     */
    async updateRanges(ranges: FRange[]): Promise<boolean> {
        if (!ranges || ranges.length === 0) {
            throw new Error('Ranges cannot be empty');
        }

        const rule = this._rangeProtectionRuleModel.getRule(this._unitId, this._subUnitId, this._ruleId);
        if (!rule) {
            throw new Error(`Rule ${this._ruleId} not found`);
        }

        // Check for overlap with other rules
        const subUnitRuleList = this._rangeProtectionRuleModel
            .getSubunitRuleList(this._unitId, this._subUnitId)
            .filter((r) => r.id !== this._ruleId);

        const hasOverlap = subUnitRuleList.some((otherRule) =>
            otherRule.ranges.some((otherRange) =>
                ranges.some((newRange) => Rectangle.intersects(otherRange, newRange.getRange()))
            )
        );

        if (hasOverlap) {
            throw new Error('Range protection cannot intersect with other protection rules');
        }

        // Execute update
        const result = await this._commandService.executeCommand<ISetRangeProtectionMutationParams>(SetRangeProtectionMutation.id, {
            unitId: this._unitId,
            subUnitId: this._subUnitId,
            ruleId: this._ruleId,
            rule: {
                ...rule,
                ranges: ranges.map((range) => range.getRange()),
            },
        });

        if (result) {
            // Update local reference
            this._ranges.length = 0;
            this._ranges.push(...ranges);
        }

        return result;
    }

    /**
     * Delete the current protection rule.
     * @returns {Promise<void>} A promise that resolves when the rule is removed.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const rules = await fWorksheet.getWorksheetPermission().listRangeProtectionRules();
     * // Remove the first protection rule
     * if (rules.length > 0) {
     *   const rule = rules[0];
     *   const result = await rule.remove();
     *   console.log(result);
     * }
     * ```
     */
    async remove(): Promise<boolean> {
        const result = await this._commandService.executeCommand<IDeleteRangeProtectionMutationParams>(DeleteRangeProtectionMutation.id, {
            unitId: this._unitId,
            subUnitId: this._subUnitId,
            ruleIds: [this._ruleId],
        });

        if (result) {
            handleWorksheetRangePermissionIsEmpty(this._injector, this._unitId, this._subUnitId);
        }

        return result;
    }

    /**
     * Set a specific permission point for the range rule (low-level API).
     *
     * **Important:** This method only updates the permission point value for an existing protection rule.
     * It does NOT create permission checks that will block actual editing operations.
     * You must call `protect()` first to create a protection rule before using this method.
     *
     * This method is useful for:
     * - Fine-tuning permissions after creating a protection rule with `protect()`
     * - Dynamically adjusting permissions based on runtime conditions
     * - Advanced permission management scenarios
     *
     * @param {RangePermissionPoint} point The permission point to set.
     * @param {boolean} value The value to set (true = allowed, false = denied).
     * @returns {Promise<void>} A promise that resolves when the point is set.
     * @throws {Error} If no protection rule exists for this range.
     *
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const fRange = fWorksheet.getRange('A1:B2');
     * // First, create a protection rule
     * const rule = await fRange.getRangePermission().protect({ name: 'My Range', allowEdit: true });
     * // Then you can dynamically update permission points
     * await rule.setPoint(univerAPI.Enum.RangePermissionPoint.Edit, false); // Now disable edit
     * await rule.setPoint(univerAPI.Enum.RangePermissionPoint.View, true);  // Ensure view is enabled
     * ```
     */
    async setPoint(point: RangePermissionPoint, value: boolean): Promise<void> {
        const PermissionPointClass = RANGE_PERMISSION_POINT_MAP[point];
        if (!PermissionPointClass) {
            throw new Error(`Unknown range permission point: ${point}`);
        }

        const instance = new PermissionPointClass(this._unitId, this._subUnitId, this._permissionId);
        const permissionPoint = this._permissionService.getPermissionPoint(instance.id);

        if (permissionPoint && permissionPoint.value === value) {
            return; // Value unchanged, no update needed
        }

        if (!permissionPoint) {
            this._permissionService.addPermissionPoint(instance);
        }

        await this._authzIoService.update({
            objectType: UnitObject.SelectRange,
            objectID: this._permissionId,
            unitID: this._unitId,
            share: undefined,
            name: this._options.name || '',
            strategies: [{
                action: instance.subType,
                role: value ? UnitRole.Editor : UnitRole.Owner,
            }],
            scope: undefined,
            collaborators: undefined,
        });

        this._permissionService.updatePermissionPoint(instance.id, value);
    }

    /**
     * Get the value of a specific permission point.
     * @param {RangePermissionPoint} point The range permission point to query.
     * @returns {boolean} true if allowed, false if denied.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const rules = await fWorksheet.getWorksheetPermission().listRangeProtectionRules();
     * // Check if the first rule allows editing
     * if (rules.length > 0) {
     *   const rule = rules[0];
     *   const canEdit = rule.getPoint(univerAPI.Enum.RangePermissionPoint.Edit);
     *   console.log(canEdit);
     * }
     * ```
     */
    getPoint(point: RangePermissionPoint): boolean {
        const PermissionPointClass = RANGE_PERMISSION_POINT_MAP[point];
        if (!PermissionPointClass) {
            console.warn(`Unknown permission point: ${point}`);
            return false;
        }

        const permissionPoint = new PermissionPointClass(this._unitId, this._subUnitId, this._permissionId);
        const permission = this._permissionService.getPermissionPoint(permissionPoint.id);
        if (permission) {
            return permission.value;
        }

        return true;
    }

    /**
     * Check if the current user can edit this range.
     * @returns {boolean} true if editable, false otherwise.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const rules = await fWorksheet.getWorksheetPermission().listRangeProtectionRules();
     * // Check if the first rule allows editing
     * const rule = rules[0];
     * if (rule?.canEdit()) {
     *   console.log(`You can edit this range ${rule.ranges.map(r => r.getA1Notation()).join(', ')}`);
     * }
     * ```
     */
    canEdit(): boolean {
        // Always check the permission point value first
        // This handles cases where setPoint() was called without protect()
        return this.getPoint(RangePermissionPoint.Edit);
    }

    /**
     * Check if the current user can view this range.
     * @returns {boolean} true if viewable, false otherwise.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const rules = await fWorksheet.getWorksheetPermission().listRangeProtectionRules();
     * // Check if the first rule allows viewing
     * const rule = rules[0];
     * if (rule?.canView()) {
     *   console.log(`You can view this range ${rule.ranges.map(r => r.getA1Notation()).join(', ')}`);
     * }
     * ```
     */
    canView(): boolean {
        // Always check the permission point value first
        // This handles cases where setPoint() was called without protect()
        return this.getPoint(RangePermissionPoint.View);
    }

    /**
     * Check if the current user can manage collaborators for this range.
     * @returns {boolean} true if can manage collaborators, false otherwise.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const rules = await fWorksheet.getWorksheetPermission().listRangeProtectionRules();
     * // Check if the first rule allows managing collaborators
     * const rule = rules[0];
     * if (rule?.canManageCollaborator()) {
     *   console.log(`You can manage collaborators for this range ${rule.ranges.map(r => r.getA1Notation()).join(', ')}`);
     * }
     * ```
     */
    canManageCollaborator(): boolean {
        // Always check the permission point value first
        // This handles cases where setPoint() was called without protect()
        return this.getPoint(RangePermissionPoint.ManageCollaborator);
    }

    /**
     * Check if the current user can delete this protection rule.
     * @returns {boolean} true if can delete rule, false otherwise.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const rules = await fWorksheet.getWorksheetPermission().listRangeProtectionRules();
     * // Check if the first rule allows deleting the rule
     * const rule = rules[0];
     * if (rule?.canDelete()) {
     *   console.log(`You can delete this protection rule for this range ${rule.ranges.map(r => r.getA1Notation()).join(', ')}`);
     * }
     * ```
     */
    canDelete(): boolean {
        // Always check the permission point value first
        // This handles cases where setPoint() was called without protect()
        return this.getPoint(RangePermissionPoint.Delete);
    }

    /**
     * Get the current permission snapshot.
     * @returns {RangePermissionSnapshot} Snapshot of all permission points.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const rules = await fWorksheet.getWorksheetPermission().listRangeProtectionRules();
     * // Get the permission snapshot of the first rule
     * if (rules.length > 0) {
     *   const rule = rules[0];
     *   const snapshot = rule.getSnapshot();
     *   console.log(snapshot);
     * }
     * ```
     */
    getSnapshot(): RangePermissionSnapshot {
        const snapshot: RangePermissionSnapshot = {} as RangePermissionSnapshot;

        Object.values(RangePermissionPoint).forEach((point) => {
            snapshot[point] = this.getPoint(point);
        });

        return snapshot;
    }
}
