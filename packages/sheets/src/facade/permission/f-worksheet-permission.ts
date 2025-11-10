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
import type {
    CellPermissionDebugInfo,
    RangeProtectionOptions,
    RangeProtectionRule,
    UnsubscribeFn,
    WorksheetMode,
    WorksheetPermission,
    WorksheetPermissionConfig,
    WorksheetPermissionSnapshot,
} from './permission-types';
import { generateRandomId, IAuthzIoService, ICommandService, Inject, Injector, IPermissionService } from '@univerjs/core';
import {
    AddRangeProtectionMutation,
    DeleteRangeProtectionMutation,
    EditStateEnum,
    RangeProtectionRuleModel,
    UnitObject,
    ViewStateEnum,
    WorksheetProtectionPointModel,
} from '@univerjs/sheets';
import { BehaviorSubject, Subject } from 'rxjs';
import { distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { FRangeProtectionRule } from './f-range-protection-rule';
import { RANGE_PERMISSION_POINT_MAP, WORKSHEET_PERMISSION_POINT_MAP } from './permission-point-map';
import { RangePermissionPoint, WorksheetPermissionPoint } from './permission-types';

/**
 * Implementation class for WorksheetPermission
 * Provides worksheet-level permission control
 *
 * @hideconstructor
 */
export class FWorksheetPermission implements WorksheetPermission {
    private readonly _permissionSubject: BehaviorSubject<WorksheetPermissionSnapshot>;
    private readonly _pointChangeSubject = new Subject<{
        point: WorksheetPermissionPoint;
        value: boolean;
        oldValue: boolean;
    }>();

    private readonly _rangeProtectionChangeSubject = new Subject<{
        type: 'add' | 'update' | 'delete';
        rules: RangeProtectionRule[];
    }>();

    /**
     * Observable stream of permission snapshot changes (BehaviorSubject)
     * Emits immediately on subscription with current state, then on any permission point change
     */
    readonly permission$: Observable<WorksheetPermissionSnapshot>;

    /**
     * Observable stream of individual permission point changes
     * Emits when a specific permission point value changes
     */
    readonly pointChange$: Observable<{
        point: WorksheetPermissionPoint;
        value: boolean;
        oldValue: boolean;
    }>;

    /**
     * Observable stream of range protection rule changes
     * Emits when protection rules are added, updated, or deleted
     */
    readonly rangeProtectionChange$: Observable<{
        type: 'add' | 'update' | 'delete';
        rules: RangeProtectionRule[];
    }>;

    /**
     * Observable stream of current range protection rules list (BehaviorSubject)
     * Emits immediately on subscription with current rules, then auto-updates when rules change
     */
    readonly rangeProtectionRules$: Observable<RangeProtectionRule[]>;

    private readonly _unitId: string;
    private readonly _subUnitId: string;

    constructor(
        private readonly _worksheet: FWorksheet,
        @Inject(Injector) private readonly _injector: Injector,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @IAuthzIoService private readonly _authzIoService: IAuthzIoService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(RangeProtectionRuleModel) private readonly _rangeProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(WorksheetProtectionPointModel) private readonly _worksheetProtectionPointModel: WorksheetProtectionPointModel
    ) {
        // Get unitId and subUnitId from worksheet
        this._unitId = this._worksheet.getWorkbook().getUnitId();
        this._subUnitId = this._worksheet.getSheetId();
        // Initialize BehaviorSubject
        this._permissionSubject = new BehaviorSubject(this._buildSnapshot());
        this.permission$ = this._permissionSubject.asObservable().pipe(
            distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
            shareReplay(1)
        );

        this.pointChange$ = this._pointChangeSubject.asObservable();
        this.rangeProtectionChange$ = this._rangeProtectionChangeSubject.asObservable();

        // Range rules list stream - use BehaviorSubject to emit initial value
        const rangeRulesSubject = new BehaviorSubject<RangeProtectionRule[]>(this._buildRangeProtectionRules());

        // Update when rules change
        this._rangeProtectionRuleModel.ruleChange$.subscribe((change) => {
            if (change.unitId === this._unitId && change.subUnitId === this._subUnitId) {
                const rules = this._buildRangeProtectionRules();
                rangeRulesSubject.next(rules);

                // Also emit rangeProtectionChange event
                const changeType: 'add' | 'update' | 'delete' = change.oldRule ? 'update' : 'add';
                this._rangeProtectionChangeSubject.next({
                    type: changeType,
                    rules,
                });
            }
        });

        this.rangeProtectionRules$ = rangeRulesSubject.asObservable().pipe(
            distinctUntilChanged((prev, curr) => {
                // Compare by rule IDs instead of JSON.stringify to avoid circular reference issues
                if (prev.length !== curr.length) {
                    return false;
                }
                return prev.every((p, i) => p.id === curr[i].id);
            }),
            shareReplay(1)
        );
    }

    /**
     * Read the actual edit permission from a rule's permissionId
     */
    private _getRuleEditPermission(rule: { permissionId: string }): boolean {
        const PermissionPointClass = RANGE_PERMISSION_POINT_MAP[RangePermissionPoint.Edit];
        if (!PermissionPointClass) {
            return false;
        }

        const permissionPoint = new PermissionPointClass(
            this._unitId,
            this._subUnitId,
            rule.permissionId
        );

        const permission = this._permissionService.getPermissionPoint(permissionPoint.id);
        return permission?.value ?? false;
    }

    /**
     * Build permission snapshot
     */
    private _buildSnapshot(): WorksheetPermissionSnapshot {
        const snapshot = {} as WorksheetPermissionSnapshot;
        for (const point in WorksheetPermissionPoint) {
            const pointKey = WorksheetPermissionPoint[point as keyof typeof WorksheetPermissionPoint];
            snapshot[pointKey] = this.getPoint(pointKey);
        }
        return snapshot;
    }

    /**
     * Build range protection rules list
     */
    private _buildRangeProtectionRules(): RangeProtectionRule[] {
        const rules = this._rangeProtectionRuleModel.getSubunitRuleList(this._unitId, this._subUnitId);
        return rules.map((rule) => {
            // Convert IRange to FRange using worksheet
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
                    allowEdit: this._getRuleEditPermission(rule),
                }
            );
        });
    }

    /**
     * Set permission mode for the worksheet
     * @param mode - The permission mode to set ('editable' | 'readOnly' | 'filterOnly' | 'commentOnly')
     */
    async setMode(mode: WorksheetMode): Promise<void> {
        const pointsToSet: Partial<Record<WorksheetPermissionPoint, boolean>> = {};

        switch (mode) {
            case 'editable':
                // Fully editable
                Object.values(WorksheetPermissionPoint).forEach((point) => {
                    pointsToSet[point] = true;
                });
                break;
            case 'readOnly':
                // Fully read-only
                pointsToSet[WorksheetPermissionPoint.View] = true;
                pointsToSet[WorksheetPermissionPoint.Edit] = false;
                pointsToSet[WorksheetPermissionPoint.SetCellValue] = false;
                pointsToSet[WorksheetPermissionPoint.SetCellStyle] = false;
                pointsToSet[WorksheetPermissionPoint.InsertRow] = false;
                pointsToSet[WorksheetPermissionPoint.InsertColumn] = false;
                pointsToSet[WorksheetPermissionPoint.DeleteRow] = false;
                pointsToSet[WorksheetPermissionPoint.DeleteColumn] = false;
                pointsToSet[WorksheetPermissionPoint.Sort] = false;
                pointsToSet[WorksheetPermissionPoint.Filter] = false;
                break;
            case 'filterOnly':
                // Can only filter/sort
                pointsToSet[WorksheetPermissionPoint.View] = true;
                pointsToSet[WorksheetPermissionPoint.Sort] = true;
                pointsToSet[WorksheetPermissionPoint.Filter] = true;
                pointsToSet[WorksheetPermissionPoint.Edit] = false;
                pointsToSet[WorksheetPermissionPoint.SetCellValue] = false;
                pointsToSet[WorksheetPermissionPoint.SetCellStyle] = false;
                break;
            case 'commentOnly':
                // Can only comment
                pointsToSet[WorksheetPermissionPoint.View] = true;
                pointsToSet[WorksheetPermissionPoint.Edit] = false;
                pointsToSet[WorksheetPermissionPoint.SetCellValue] = false;
                break;
        }

        // Batch set permission points
        for (const [point, value] of Object.entries(pointsToSet)) {
            await this.setPoint(point as WorksheetPermissionPoint, value);
        }
    }

    /**
     * Set the worksheet to read-only mode
     */
    async setReadOnly(): Promise<void> {
        await this.setMode('readOnly');
    }

    /**
     * Set the worksheet to editable mode
     */
    async setEditable(): Promise<void> {
        await this.setMode('editable');
    }

    /**
     * Check if the worksheet is editable
     * @returns true if the worksheet can be edited, false otherwise
     */
    canEdit(): boolean {
        return this.getPoint(WorksheetPermissionPoint.Edit);
    }

    /**
     * Check if a specific cell can be edited
     * @param row - Row index
     * @param col - Column index
     * @returns true if the cell can be edited, false otherwise
     */
    canEditCell(row: number, col: number): boolean {
        // First check worksheet-level permission
        if (!this.canEdit()) {
            return false;
        }

        // Check if there are range protection rules covering this cell
        const rules = this._rangeProtectionRuleModel.getSubunitRuleList(this._unitId, this._subUnitId);
        for (const rule of rules) {
            for (const range of rule.ranges) {
                if (
                    row >= range.startRow &&
                    row <= range.endRow &&
                    col >= range.startColumn &&
                    col <= range.endColumn
                ) {
                    // Cell is within protected range, check the rule's edit permission
                    return this._getRuleEditPermission(rule);
                }
            }
        }

        return true;
    }

    /**
     * Check if a specific cell can be viewed
     * @param _row - Row index (unused, for API consistency)
     * @param _col - Column index (unused, for API consistency)
     * @returns true if the cell can be viewed, false otherwise
     */
    canViewCell(_row: number, _col: number): boolean {
        // View permission is usually true by default
        return this.getPoint(WorksheetPermissionPoint.View);
    }

    /**
     * Debug cell permission information
     * @param row - Row index
     * @param col - Column index
     * @returns Debug information about which rules affect this cell, or null if no rules apply
     */
    debugCellPermission(row: number, col: number): CellPermissionDebugInfo | null {
        const hitRules = [];
        const rules = this._rangeProtectionRuleModel.getSubunitRuleList(this._unitId, this._subUnitId);

        for (const rule of rules) {
            for (const range of rule.ranges) {
                if (
                    row >= range.startRow &&
                    row <= range.endRow &&
                    col >= range.startColumn &&
                    col <= range.endColumn
                ) {
                    hitRules.push({
                        ruleId: rule.id,
                        rangeRefs: rule.ranges.map(
                            (r) => `R${r.startRow}C${r.startColumn}:R${r.endRow}C${r.endColumn}`
                        ),
                        options: {
                            name: rule.description || '',
                            allowEdit: this._getRuleEditPermission(rule),
                        },
                    });
                    break;
                }
            }
        }

        if (hitRules.length === 0) {
            return null;
        }

        return {
            row,
            col,
            hitRules,
        };
    }

    /**
     * Set a specific permission point for the worksheet
     * @param point - The permission point to set
     * @param value - The value to set (true = allowed, false = denied)
     */
    async setPoint(point: WorksheetPermissionPoint, value: boolean): Promise<void> {
        const PointClass = WORKSHEET_PERMISSION_POINT_MAP[point];
        if (!PointClass) {
            throw new Error(`Unknown worksheet permission point: ${point}`);
        }

        const oldValue = this.getPoint(point);
        if (oldValue === value) {
            return; // Value unchanged, no update needed
        }

        const instance = new PointClass(this._unitId, this._subUnitId);
        const permissionPoint = this._permissionService.getPermissionPoint(instance.id);

        if (!permissionPoint) {
            this._permissionService.addPermissionPoint(instance);
        }

        this._permissionService.updatePermissionPoint(instance.id, value);

        // Trigger change event
        this._pointChangeSubject.next({ point, value, oldValue });

        // Update snapshot
        const newSnapshot = this._buildSnapshot();
        this._permissionSubject.next(newSnapshot);
    }

    /**
     * Get the value of a specific permission point
     * @param point - The permission point to query
     * @returns true if allowed, false if denied
     */
    getPoint(point: WorksheetPermissionPoint): boolean {
        const PointClass = WORKSHEET_PERMISSION_POINT_MAP[point];
        if (!PointClass) {
            throw new Error(`Unknown worksheet permission point: ${point}`);
        }

        const instance = new PointClass(this._unitId, this._subUnitId);
        const permissionPoint = this._permissionService.getPermissionPoint(instance.id);

        return permissionPoint?.value ?? true; // Default to true (allowed)
    }

    /**
     * Get a snapshot of all permission points
     * @returns An object containing all permission point values
     */
    getSnapshot(): WorksheetPermissionSnapshot {
        return this._buildSnapshot();
    }

    /**
     * Apply a permission configuration to the worksheet
     * @param config - The configuration to apply
     */
    async applyConfig(config: WorksheetPermissionConfig): Promise<void> {
        // Apply mode
        if (config.mode) {
            await this.setMode(config.mode);
        }

        // Apply permission point configuration
        if (config.points) {
            for (const [point, value] of Object.entries(config.points)) {
                await this.setPoint(point as WorksheetPermissionPoint, value);
            }
        }

        // Batch create range protection
        if (config.rangeProtections && config.rangeProtections.length > 0) {
            const protectionConfigs = config.rangeProtections.map((protection) => ({
                ranges: protection.rangeRefs.map((rangeRef) => this._worksheet.getRange(rangeRef)),
                options: protection.options,
            }));
            await this.protectRanges(protectionConfigs);
        }
    }

    /**
     * Protect multiple ranges at once (batch operation)
     * @param configs - Array of protection configurations
     * @returns Array of created protection rules
     */
    async protectRanges(
        configs: Array<{
            ranges: FRange[];
            options?: RangeProtectionOptions;
        }>
    ): Promise<RangeProtectionRule[]> {
        if (!configs || configs.length === 0) {
            throw new Error('Configs cannot be empty');
        }

        // 1. Create permissionId in parallel
        const permissionIds = await Promise.all(
            configs.map((c) =>
                this._authzIoService.create({
                    objectType: UnitObject.SelectRange,
                    selectRangeObject: {
                        collaborators: [],
                        unitID: this._unitId,
                        name: c.options?.name || '',
                        scope: undefined,
                    },
                })
            )
        );

        // 2. Add multiple rules at once (reuse underlying batch capability)
        const ruleParams = configs.map((c, i) => ({
            permissionId: permissionIds[i],
            unitType: UnitObject.SelectRange,
            unitId: this._unitId,
            subUnitId: this._subUnitId,
            ranges: c.ranges.map((r) => r.getRange()),
            id: `ruleId_${generateRandomId(6)}`,
            description: c.options?.name || '',
            viewState: ViewStateEnum.OthersCanView,
            editState: c.options?.allowEdit ? EditStateEnum.DesignedUserCanEdit : EditStateEnum.OnlyMe,
        }));

        const result = await this._commandService.executeCommand(AddRangeProtectionMutation.id, {
            unitId: this._unitId,
            subUnitId: this._subUnitId,
            rules: ruleParams, // ✅ Batch pass multiple rules
        });

        if (!result) {
            throw new Error('Failed to create range protection rules');
        }

        // 3. Create RangeProtectionRule objects
        const rules = ruleParams.map((param, i) =>
            this._injector.createInstance(
                FRangeProtectionRule,
                this._unitId,
                this._subUnitId,
                param.id,
                param.permissionId,
                configs[i].ranges,
                configs[i].options || {}
            )
        );

        // Trigger change event
        this._rangeProtectionChangeSubject.next({
            type: 'add',
            rules,
        });

        return rules;
    }

    /**
     * Remove multiple protection rules at once
     * @param ruleIds - Array of rule IDs to remove
     */
    async unprotectRules(ruleIds: string[]): Promise<void> {
        if (!ruleIds || ruleIds.length === 0) {
            return;
        }

        await this._commandService.executeCommand(DeleteRangeProtectionMutation.id, {
            unitId: this._unitId,
            subUnitId: this._subUnitId,
            ruleIds,
        });

        // Trigger change event
        this._rangeProtectionChangeSubject.next({
            type: 'delete',
            rules: [], // Deleted rules
        });
    }

    /**
     * List all range protection rules for the worksheet
     * @returns Array of protection rules
     */
    async listRangeProtectionRules(): Promise<RangeProtectionRule[]> {
        return this._buildRangeProtectionRules();
    }

    /**
     * Subscribe to permission changes (simplified interface for users not familiar with RxJS)
     * @param listener - Callback function to be called when permissions change
     * @returns Unsubscribe function
     */
    subscribe(listener: (snapshot: WorksheetPermissionSnapshot) => void): UnsubscribeFn {
        const subscription = this.permission$.subscribe(listener);
        return () => subscription.unsubscribe();
    }

    /**
     * Clean up resources
     */
    dispose(): void {
        this._permissionSubject.complete();
        this._pointChangeSubject.complete();
        this._rangeProtectionChangeSubject.complete();
    }
}
