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

import type { Observable } from 'rxjs';
import type { FRange } from '../f-range';
import type { FWorksheet } from '../f-worksheet';
import type { RangePermission, RangePermissionSnapshot, RangeProtectionOptions, RangeProtectionRule } from './permission-types';
import { IAuthzIoService, ICommandService, Inject, Injector, IPermissionService } from '@univerjs/core';
import { AddRangeProtectionMutation, DeleteRangeProtectionMutation, EditStateEnum, RangeProtectionRuleModel, ViewStateEnum } from '@univerjs/sheets';
import { BehaviorSubject, Subject } from 'rxjs';
import { FRangeProtectionRule } from './f-range-protection-rule';
import { RANGE_PERMISSION_POINT_MAP } from './permission-point-map';
import { RangePermissionPoint } from './permission-types';

/**
 * Implementation class for RangePermission
 * Manages range-level permissions
 *
 * @hideconstructor
 */
export class FRangePermission implements RangePermission {
    private readonly _permission$: BehaviorSubject<RangePermissionSnapshot>;
    private readonly _protectionChange$ = new Subject<{
        type: 'protected' | 'unprotected';
        rules: RangeProtectionRule[];
    }>();

    constructor(
        private readonly _unitId: string,
        private readonly _subUnitId: string,
        private readonly _range: FRange,
        private readonly _worksheet: FWorksheet,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(IPermissionService) private readonly _permissionService: IPermissionService,
        @Inject(IAuthzIoService) private readonly _authzIoService: IAuthzIoService,
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @Inject(RangeProtectionRuleModel) private readonly _rangeProtectionRuleModel: RangeProtectionRuleModel
    ) {
        this._permission$ = new BehaviorSubject<RangePermissionSnapshot>(this._buildSnapshot());

        // Listen to permission point changes
        this._permissionService.permissionPointUpdate$.subscribe(() => {
            this._permission$.next(this._buildSnapshot());
        });

        // Listen to protection rule changes
        this._rangeProtectionRuleModel.ruleChange$.subscribe((change) => {
            if (change.unitId === this._unitId && change.subUnitId === this._subUnitId) {
                const rules = this._buildProtectionRules();
                const isProtected = this.isProtected();
                this._protectionChange$.next({
                    type: isProtected ? 'protected' : 'unprotected',
                    rules,
                });
                this._permission$.next(this._buildSnapshot());
            }
        });
    }

    /**
     * Observable stream of permission snapshot changes
     * @returns Observable that emits when permission snapshot changes
     */
    get permission$(): Observable<RangePermissionSnapshot> {
        return this._permission$.asObservable();
    }

    /**
     * Observable stream of protection state changes
     * @returns Observable that emits when protection state changes
     */
    get protectionChange$(): Observable<{
        type: 'protected' | 'unprotected';
        rules: RangeProtectionRule[];
    }> {
        return this._protectionChange$.asObservable();
    }

    /**
     * Get the value of a specific permission point
     * @param point - The permission point to query
     * @returns true if allowed, false if denied
     */
    getPoint(point: RangePermissionPoint): boolean {
        const rule = this._getProtectionRule();
        if (!rule) {
            return true; // Not protected, has permission by default
        }

        const PermissionPointClass = RANGE_PERMISSION_POINT_MAP[point];
        if (!PermissionPointClass) {
            console.warn(`Unknown permission point: ${point}`);
            return false;
        }

        const permissionPoint = new PermissionPointClass(this._unitId, this._subUnitId, rule.permissionId);
        const permission = this._permissionService.getPermissionPoint(permissionPoint.id);
        return permission?.value ?? false;
    }

    /**
     * Get the current permission snapshot
     * @returns Snapshot of all permission points
     */
    getSnapshot(): RangePermissionSnapshot {
        return this._buildSnapshot();
    }

    /**
     * Check if the current range is protected
     * @returns true if protected, false otherwise
     */
    isProtected(): boolean {
        return this._getProtectionRule() !== null;
    }

    /**
     * Check if the current user can edit this range
     * @returns true if editable, false otherwise
     */
    canEdit(): boolean {
        if (!this.isProtected()) {
            return true; // Not protected, can edit
        }
        return this.getPoint(RangePermissionPoint.Edit);
    }

    /**
     * Protect the current range
     * @param options - Protection options
     * @returns The created protection rule
     */
    async protect(options?: RangeProtectionOptions): Promise<RangeProtectionRule> {
        if (this.isProtected()) {
            throw new Error('Range is already protected');
        }

        const permissionId = `range-protection-${this._unitId}-${this._subUnitId}-${Date.now()}`;
        const ruleId = this._rangeProtectionRuleModel.createRuleId(this._unitId, this._subUnitId);

        const range = this._range.getRange();
        await this._commandService.executeCommand(AddRangeProtectionMutation.id, {
            unitId: this._unitId,
            subUnitId: this._subUnitId,
            rules: [{
                id: ruleId,
                permissionId,
                unitType: 3, // UnitObject.SelectRange
                unitId: this._unitId,
                subUnitId: this._subUnitId,
                ranges: [range],
                description: options?.name,
                viewState: ViewStateEnum.OthersCanView,
                editState: options?.allowEdit ? EditStateEnum.DesignedUserCanEdit : EditStateEnum.OnlyMe,
            }],
        });

        // Create and return FRangeProtectionRule instance
        const rule = this._injector.createInstance(
            FRangeProtectionRule,
            this._unitId,
            this._subUnitId,
            ruleId,
            permissionId,
            [this._range],
            options || {}
        );

        const rules = this._buildProtectionRules();
        this._protectionChange$.next({ type: 'protected', rules });

        return rule;
    }

    /**
     * Unprotect the current range
     */
    async unprotect(): Promise<void> {
        const rule = this._getProtectionRule();
        if (!rule) {
            // Silently handle unprotecting a non-protected range
            return;
        }

        await this._commandService.executeCommand(DeleteRangeProtectionMutation.id, {
            unitId: this._unitId,
            subUnitId: this._subUnitId,
            ruleIds: [rule.id],
        });

        const rules = this._buildProtectionRules();
        this._protectionChange$.next({ type: 'unprotected', rules });
    }

    /**
     * List all protection rules
     * @returns Array of protection rules
     */
    async listRules(): Promise<RangeProtectionRule[]> {
        return this._buildProtectionRules();
    }

    /**
     * Subscribe to permission changes (simplified interface)
     * @param listener - Callback function to be called when permissions change
     * @returns Unsubscribe function
     */
    subscribe(listener: (snapshot: RangePermissionSnapshot) => void): (() => void) {
        const subscription = this._permission$.subscribe(listener);
        return () => subscription.unsubscribe();
    }

    /**
     * Get the protection rule for the current range
     */
    private _getProtectionRule(): any {
        const rules = this._rangeProtectionRuleModel.getSubunitRuleList(this._unitId, this._subUnitId);
        const range = this._range.getRange();

        for (const rule of rules) {
            for (const ruleRange of rule.ranges) {
                if (
                    range.startRow === ruleRange.startRow &&
                    range.startColumn === ruleRange.startColumn &&
                    range.endRow === ruleRange.endRow &&
                    range.endColumn === ruleRange.endColumn
                ) {
                    return rule;
                }
            }
        }

        return null;
    }

    /**
     * Build Facade objects for all protection rules
     */
    private _buildProtectionRules(): FRangeProtectionRule[] {
        const rules = this._rangeProtectionRuleModel.getSubunitRuleList(this._unitId, this._subUnitId);

        return rules.map((rule) => {
            const ranges = rule.ranges.map((range) =>
                this._worksheet.getRange(
                    range.startRow,
                    range.startColumn,
                    range.endRow - range.startRow + 1,
                    range.endColumn - range.startColumn + 1
                )
            );

            return this._injector.createInstance(
                FRangeProtectionRule,
                this._unitId,
                this._subUnitId,
                rule.id,
                rule.permissionId,
                ranges,
                {
                    name: rule.description || '',
                    allowEdit: rule.editState === EditStateEnum.DesignedUserCanEdit,
                }
            );
        });
    }

    /**
     * Build permission snapshot
     */
    private _buildSnapshot(): RangePermissionSnapshot {
        const snapshot: RangePermissionSnapshot = {} as RangePermissionSnapshot;

        Object.values(RangePermissionPoint).forEach((point) => {
            snapshot[point] = this.getPoint(point);
        });

        return snapshot;
    }
}
