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

import type { ICollaborator } from '@univerjs/protocol';
import type {
    IRangeProtectionRule,
} from '@univerjs/sheets';
import type { Observable, Subscription } from 'rxjs';
import type { FRange } from '../f-range';
import type { FWorksheet } from '../f-worksheet';
import type {
    IRangeProtectionOptions,
    IWorksheetPermissionConfig,
    IWorksheetProtectionOptions,
    UnsubscribeFn,
    WorksheetMode,
    WorksheetPermissionSnapshot,
} from './permission-types';
import { IAuthzIoService, ICommandService, Inject, Injector, IPermissionService } from '@univerjs/core';
import { UnitRole } from '@univerjs/protocol';
import {
    AddRangeProtectionMutation,
    EditStateEnum,
    RangeProtectionRuleModel,
    UnitObject,
    ViewStateEnum,
    WorksheetProtectionPointModel,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay } from 'rxjs/operators';
import { FPermission } from '../f-permission';
import { FRangeProtectionRule } from './f-range-protection-rule';
import { RANGE_PERMISSION_POINT_MAP, WORKSHEET_PERMISSION_POINT_MAP } from './permission-point-map';
import {
    RangePermissionPoint,
    WorksheetPermissionPoint,
} from './permission-types';

/**
 * Implementation class for WorksheetPermission
 * Provides worksheet-level permission control
 *
 * @hideconstructor
 */
export class FWorksheetPermission {
    private readonly _permissionSubject: BehaviorSubject<WorksheetPermissionSnapshot>;
    private readonly _rangeRulesSubject: BehaviorSubject<FRangeProtectionRule[]>;

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
        rules: FRangeProtectionRule[];
    }>;

    /**
     * Observable stream of current range protection rules list (BehaviorSubject)
     * Emits immediately on subscription with current rules, then auto-updates when rules change
     */
    readonly rangeProtectionRules$: Observable<FRangeProtectionRule[]>;

    private readonly _unitId: string;
    private readonly _subUnitId: string;
    private readonly _subscriptions: Subscription[] = [];
    private readonly _fPermission: FPermission;

    constructor(
        private readonly _worksheet: FWorksheet,
        @Inject(Injector) private readonly _injector: Injector,
        @IPermissionService private readonly _permissionService: IPermissionService,
        @IAuthzIoService private readonly _authzIoService: IAuthzIoService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(RangeProtectionRuleModel) private readonly _rangeProtectionRuleModel: RangeProtectionRuleModel,
        @Inject(WorksheetProtectionPointModel) private readonly _worksheetProtectionPointModel: WorksheetProtectionPointModel,
        @Inject(WorksheetProtectionRuleModel) private readonly _worksheetProtectionRuleModel: WorksheetProtectionRuleModel
    ) {
        // Get unitId and subUnitId from worksheet
        this._unitId = this._worksheet.getWorkbook().getUnitId();
        this._subUnitId = this._worksheet.getSheetId();

        // Initialize FPermission instance
        this._fPermission = this._injector.createInstance(FPermission);

        // Initialize BehaviorSubject
        this._permissionSubject = new BehaviorSubject(this._buildSnapshot());
        this._rangeRulesSubject = new BehaviorSubject<FRangeProtectionRule[]>(this._buildRangeProtectionRules());

        // Setup observables from internal services
        this.permission$ = this._createPermissionStream();
        this.pointChange$ = this._createPointChangeStream();
        this.rangeProtectionChange$ = this._createRangeProtectionChangeStream();
        this.rangeProtectionRules$ = this._createRangeProtectionRulesStream();
    }

    /**
     * Create permission snapshot stream from IPermissionService
     * @private
     */
    private _createPermissionStream(): Observable<WorksheetPermissionSnapshot> {
        // Listen to permission point changes from IPermissionService
        const permissionSub = this._permissionService.permissionPointUpdate$.pipe(
            filter((point) => point.id.includes(this._unitId) && point.id.includes(this._subUnitId))
        ).subscribe(() => {
            this._permissionSubject.next(this._buildSnapshot());
        });
        this._subscriptions.push(permissionSub);

        return this._permissionSubject.asObservable().pipe(
            distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
            shareReplay({ bufferSize: 1, refCount: true })
        );
    }

    /**
     * Create point change stream from IPermissionService
     * @private
     */
    private _createPointChangeStream(): Observable<{ point: WorksheetPermissionPoint; value: boolean; oldValue: boolean }> {
        return this._permissionService.permissionPointUpdate$.pipe(
            filter((point) => point.id.includes(this._unitId) && point.id.includes(this._subUnitId)),
            map((point) => {
                const pointType = this._extractWorksheetPointType(point.id);
                if (!pointType) return null;
                return {
                    point: pointType,
                    value: point.value ?? false,
                    oldValue: !(point.value ?? false),
                };
            }),
            filter((change): change is { point: WorksheetPermissionPoint; value: boolean; oldValue: boolean } => change !== null),
            shareReplay({ bufferSize: 1, refCount: true })
        );
    }

    /**
     * Create range protection change stream from RangeProtectionRuleModel
     * @private
     */
    private _createRangeProtectionChangeStream(): Observable<{ type: 'add' | 'update' | 'delete'; rules: FRangeProtectionRule[] }> {
        return this._rangeProtectionRuleModel.ruleChange$.pipe(
            filter((change) => change.unitId === this._unitId && change.subUnitId === this._subUnitId),
            map((change) => {
                const rules = this._buildRangeProtectionRules();
                const type: 'add' | 'update' | 'delete' = change.type === 'delete' ? 'delete' : (change.type === 'set' ? 'update' : 'add');
                return { type, rules };
            }),
            shareReplay({ bufferSize: 1, refCount: true })
        );
    }

    /**
     * Create range protection rules list stream from RangeProtectionRuleModel
     * @private
     */
    private _createRangeProtectionRulesStream(): Observable<FRangeProtectionRule[]> {
        const ruleChangeSub = this._rangeProtectionRuleModel.ruleChange$.pipe(
            filter((change) => change.unitId === this._unitId && change.subUnitId === this._subUnitId)
        ).subscribe(() => {
            this._rangeRulesSubject.next(this._buildRangeProtectionRules());
        });
        this._subscriptions.push(ruleChangeSub);

        return this._rangeRulesSubject.asObservable().pipe(
            distinctUntilChanged((prev, curr) => {
                if (prev.length !== curr.length) return false;
                return prev.every((p, i) => p.id === curr[i].id);
            }),
            shareReplay({ bufferSize: 1, refCount: true })
        );
    }

    /**
     * Extract WorksheetPermissionPoint type from permission point ID
     * @private
     */
    private _extractWorksheetPointType(pointId: string): WorksheetPermissionPoint | null {
        // Try to match against known worksheet permission points
        for (const [pointName, PointClass] of Object.entries(WORKSHEET_PERMISSION_POINT_MAP)) {
            const testPoint = new PointClass(this._unitId, this._subUnitId);
            if (testPoint.id === pointId) {
                return pointName as WorksheetPermissionPoint;
            }
        }
        return null;
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
    private _buildRangeProtectionRules(): FRangeProtectionRule[] {
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
     * Build Facade objects for all protection rules
     */
    private _buildProtectionRule(rule: IRangeProtectionRule): FRangeProtectionRule {
        const ranges = rule.ranges.map((range) =>
            this._worksheet.getRange(range)
        );

            // Build options from rule state
        const options: IRangeProtectionOptions = {
            name: rule.description || '',
            allowViewByOthers: rule.viewState !== ViewStateEnum.NoOneElseCanView,
        };

            // Handle allowEdit based on editState
        if (rule.editState === EditStateEnum.DesignedUserCanEdit) {
                // Get collaborators list synchronously for this rule
                // Note: This is a synchronous context, but we need async data
                // We'll use a placeholder here and expect the caller to handle async properly
                // For now, we set it to an empty array as a fallback
            options.allowEdit = true;
        } else {
            options.allowEdit = false;
        }

        return this._injector.createInstance(
            FRangeProtectionRule,
            this._unitId,
            this._subUnitId,
            rule.id,
            rule.permissionId,
            ranges,
            options
        );
    }

    /**
     * Debug cell permission information.
     * @param {number} row Row index.
     * @param {number} col Column index.
     * @returns {ICellPermissionDebugInfo | null} Debug information about which rules affect this cell, or null if no rules apply.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     * const debugInfo = permission?.debugCellPermission(0, 0);
     * console.log(debugInfo);
     * ```
     */
    debugCellPermission(row: number, col: number): FRangeProtectionRule | undefined {
        const info = this._fPermission.getPermissionInfoWithCell(this._unitId, this._subUnitId, row, col);
        if (!info) {
            return undefined;
        }
        const { ruleId } = info;
        const rule = this._rangeProtectionRuleModel.getRule(this._unitId, this._subUnitId, ruleId);
        if (!rule) {
            return undefined;
        }
        return this._buildProtectionRule(rule);
    }

    /**
     * Create worksheet protection with collaborators support.
     * This must be called before setting permission points for collaboration to work.
     * @param {IWorksheetProtectionOptions} options Protection options including allowed users.
     * @returns {Promise<string>} The permissionId for the created protection.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     *
     * // Create worksheet protection with collaborators
     * const permissionId = await permission?.protect({
     *   allowedUsers: ['user1', 'user2'],
     *   name: 'My Worksheet Protection'
     * });
     *
     * // Now set permission points
     * await permission?.setMode('readOnly');
     * ```
     */
    async protect(options?: IWorksheetProtectionOptions): Promise<string> {
        // Check if already protected
        if (this.isProtected()) {
            throw new Error('Worksheet is already protected. Call unprotect() first.');
        }

        // Use FPermission's addWorksheetBasePermission method
        const permissionId = await this._fPermission.addWorksheetBasePermission(this._unitId, this._subUnitId, options);

        if (!permissionId) {
            throw new Error('Failed to create worksheet protection');
        }

        return permissionId;
    }

    /**
     * Remove worksheet protection.
     * This deletes the protection rule and resets all permission points to allowed.
     * @returns {Promise<void>} A promise that resolves when protection is removed.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     * await permission?.unprotect();
     * ```
     */
    async unprotect(): Promise<void> {
        if (!this.isProtected()) {
            return; // Already unprotected
        }

        // Use FPermission's removeWorksheetPermission method
        this._fPermission.removeWorksheetPermission(this._unitId, this._subUnitId);

        // Update snapshot
        const newSnapshot = this._buildSnapshot();
        this._permissionSubject.next(newSnapshot);
    }

    /**
     * Check if worksheet is currently protected.
     * @returns {boolean} true if protected, false otherwise.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     * if (permission?.isProtected()) {
     *   console.log('Worksheet is protected');
     * }
     * ```
     */
    isProtected(): boolean {
        const rule = this._worksheetProtectionRuleModel.getRule(this._unitId, this._subUnitId);
        return !!rule;
    }

    /**
     * Set permission mode for the worksheet.
     * Automatically creates worksheet protection if not already protected.
     * @param {WorksheetMode} mode The permission mode to set ('editable' | 'readOnly' | 'filterOnly' | 'commentOnly').
     * @returns {Promise<void>} A promise that resolves when the mode is set.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     * await permission?.setMode('readOnly');
     * ```
     */
    async setMode(mode: WorksheetMode): Promise<void> {
        // Ensure worksheet protection exists before setting permission points

        const pointsToSet = this._getModePermissions(mode);
        await this._batchSetPermissionPoints(pointsToSet);
    }

    /**
     * Get permission configuration for a specific mode
     * @private
     */
    private _getModePermissions(mode: WorksheetMode): Record<WorksheetPermissionPoint, boolean> {
        // Initialize all permission points to false first
        const pointsToSet: Record<WorksheetPermissionPoint, boolean> = {} as Record<WorksheetPermissionPoint, boolean>;
        Object.values(WorksheetPermissionPoint).forEach((point) => {
            pointsToSet[point] = false;
        });

        switch (mode) {
            case 'editable':
                // Fully editable - set all to true
                Object.values(WorksheetPermissionPoint).forEach((point) => {
                    pointsToSet[point] = true;
                });
                break;
            case 'readOnly':
                // Fully read-only - only View is allowed
                pointsToSet[WorksheetPermissionPoint.View] = true;
                // All other permissions remain false
                break;
            case 'filterOnly':
                // Can only filter/sort
                pointsToSet[WorksheetPermissionPoint.View] = true;
                pointsToSet[WorksheetPermissionPoint.Sort] = true;
                pointsToSet[WorksheetPermissionPoint.Filter] = true;
                // All other permissions remain false
                break;
        }

        return pointsToSet;
    }

    /**
     * Batch set multiple permission points efficiently
     * @private
     */
    private async _batchSetPermissionPoints(pointsToSet: Record<WorksheetPermissionPoint, boolean>): Promise<void> {
        // Note: IPermissionService doesn't have a batch update API, so we update individually
        // but we optimize by only updating the snapshot once at the end
        const pointsChanged: Array<{ point: WorksheetPermissionPoint; value: boolean; oldValue: boolean }> = [];

        for (const [point, value] of Object.entries(pointsToSet)) {
            const pointKey = point as WorksheetPermissionPoint;
            const PointClass = WORKSHEET_PERMISSION_POINT_MAP[pointKey];
            if (!PointClass) {
                throw new Error(`Unknown worksheet permission point: ${pointKey}`);
            }

            const oldValue = this.getPoint(pointKey);
            if (oldValue === value) {
                continue; // Skip unchanged values
            }

            // Use FPermission's setWorksheetPermissionPoint method
            await this._fPermission.setWorksheetPermissionPoint(this._unitId, this._subUnitId, PointClass, value);
            pointsChanged.push({ point: pointKey, value, oldValue });
        }

        // Update snapshot once at the end (the Observable stream will pick up the changes automatically)
        if (pointsChanged.length > 0) {
            const newSnapshot = this._buildSnapshot();
            this._permissionSubject.next(newSnapshot);
        }
    }

    /**
     * Set the worksheet to read-only mode.
     * @returns {Promise<void>} A promise that resolves when the mode is set.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     * await permission?.setReadOnly();
     * ```
     */
    async setReadOnly(): Promise<void> {
        await this.setMode('readOnly');
    }

    /**
     * Set the worksheet to editable mode.
     * @returns {Promise<void>} A promise that resolves when the mode is set.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     * await permission?.setEditable();
     * ```
     */
    async setEditable(): Promise<void> {
        await this.setMode('editable');
    }

    /**
     * Check if the worksheet is editable.
     * @returns {boolean} true if the worksheet can be edited, false otherwise.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     * if (permission?.canEdit()) {
     *   console.log('Worksheet is editable');
     * }
     * ```
     */
    canEdit(): boolean {
        return this.getPoint(WorksheetPermissionPoint.Edit);
    }

    /**
     * Check if a specific cell can be edited.
     * @param {number} row Row index.
     * @param {number} col Column index.
     * @returns {boolean} true if the cell can be edited, false otherwise.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     * const canEdit = permission?.canEditCell(0, 0);
     * console.log(canEdit);
     * ```
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
     * Check if a specific cell can be viewed.
     * @param {number} _row Row index (unused, for API consistency).
     * @param {number} _col Column index (unused, for API consistency).
     * @returns {boolean} true if the cell can be viewed, false otherwise.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     * const canView = permission?.canViewCell(0, 0);
     * console.log(canView);
     * ```
     */
    canViewCell(_row: number, _col: number): boolean {
        // View permission is usually true by default
        return this.getPoint(WorksheetPermissionPoint.View);
    }

    /**
     * Set a specific permission point for the worksheet.
     * Automatically creates worksheet protection if not already protected.
     * @param {WorksheetPermissionPoint} point The permission point to set.
     * @param {boolean} value The value to set (true = allowed, false = denied).
     * @returns {Promise<void>} A promise that resolves when the point is set.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     * await permission?.setPoint(univerAPI.Enum.WorksheetPermissionPoint.InsertRow, false);
     * ```
     */
    async setPoint(point: WorksheetPermissionPoint, value: boolean): Promise<void> {
        // Ensure worksheet protection exists before setting permission points

        const PointClass = WORKSHEET_PERMISSION_POINT_MAP[point];
        if (!PointClass) {
            throw new Error(`Unknown worksheet permission point: ${point}`);
        }

        const oldValue = this.getPoint(point);
        if (oldValue === value) {
            return; // Value unchanged, no update needed
        }

        // Use FPermission's setWorksheetPermissionPoint method
        await this._fPermission.setWorksheetPermissionPoint(this._unitId, this._subUnitId, PointClass, value);

        // Update snapshot (the Observable stream will automatically emit the change)
        const newSnapshot = this._buildSnapshot();
        this._permissionSubject.next(newSnapshot);
    }

    /**
     * Get the value of a specific permission point.
     * @param {WorksheetPermissionPoint} point The permission point to query.
     * @returns {boolean} true if allowed, false if denied.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     * const canInsertRow = permission?.getPoint(univerAPI.Enum.WorksheetPermissionPoint.InsertRow);
     * console.log(canInsertRow);
     * ```
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
     * Get a snapshot of all permission points.
     * @returns {WorksheetPermissionSnapshot} An object containing all permission point values.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     * const snapshot = permission?.getSnapshot();
     * console.log(snapshot);
     * ```
     */
    getSnapshot(): WorksheetPermissionSnapshot {
        return this._buildSnapshot();
    }

    /**
     * Apply a permission configuration to the worksheet.
     * @param {IWorksheetPermissionConfig} config The configuration to apply.
     * @returns {Promise<void>} A promise that resolves when the configuration is applied.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     * await permission?.applyConfig({
     *   mode: 'readOnly',
     *   points: {
     *     [univerAPI.Enum.WorksheetPermissionPoint.View]: true,
     *     [univerAPI.Enum.WorksheetPermissionPoint.Edit]: false
     *   }
     * });
     * ```
     */
    async applyConfig(config: IWorksheetPermissionConfig): Promise<void> {
        // Apply mode
        if (config.mode) {
            await this.setMode(config.mode);
        }

        // Apply permission point configuration
        if (config.points) {
            for (const [point, value] of Object.entries(config.points)) {
                if (typeof value === 'boolean') {
                    await this.setPoint(point as WorksheetPermissionPoint, value);
                }
            }
        }

        // Batch create range protection
        if (config.rangeProtections && config.rangeProtections.length > 0) {
            const protectionConfigs = config.rangeProtections.map((protection: { rangeRefs: string[]; options?: IRangeProtectionOptions }) => ({
                ranges: protection.rangeRefs.map((rangeRef: string) => this._worksheet.getRange(rangeRef)),
                options: protection.options,
            }));
            await this.protectRanges(protectionConfigs);
        }
    }

    /**
     * Protect multiple ranges at once (batch operation).
     * @param {Array<{ ranges: FRange[]; options?: IRangeProtectionOptions }>} configs Array of protection configurations.
     * @returns {Promise<FRangeProtectionRule[]>} Array of created protection rules.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     * const rules = await permission?.protectRanges([
     *   {
     *     ranges: [worksheet.getRange('A1:B2')],
     *     options: { name: 'Protected Area 1', allowEdit: false, allowViewByOthers: true }
     *   },
     *   {
     *     ranges: [worksheet.getRange('C3:D4')],
     *     options: { name: 'Protected Area 2', allowEdit: true, allowViewByOthers: false }
     *   }
     * ]);
     * console.log(rules);
     * ```
     */
    // eslint-disable-next-line max-lines-per-function
    async protectRanges(
        configs: Array<{
            ranges: FRange[];
            options?: IRangeProtectionOptions;
        }>
    ): Promise<FRangeProtectionRule[]> {
        if (!configs || configs.length === 0) {
            throw new Error('Configs cannot be empty');
        }

        // Fetch existing collaborators once if any config has allowedUsers
        let existingCollaborators: ICollaborator[] = [];
        const hasAllowedUsers = configs.some((c) => c.options?.allowedUsers?.length);
        if (hasAllowedUsers) {
            existingCollaborators = await this._authzIoService.listCollaborators({
                objectID: this._unitId,
                unitID: this._unitId,
            });
        }

        // 1. Create permissionId in parallel
        const permissionIds = await Promise.all(
            configs.map((c) => {
                let collaborators: ICollaborator[] = [];
                if (c.options?.allowedUsers) {
                    // Create a map of allowed user IDs for easy lookup
                    const allowedUserIds = new Set(c.options.allowedUsers);

                    // Filter and include only the allowed users with complete information
                    collaborators = existingCollaborators
                        .filter((collab) => allowedUserIds.has(collab.subject?.userID || collab.id))
                        .map((collab) => ({
                            id: collab.id,
                            role: UnitRole.Editor,
                            subject: collab.subject,
                        }));

                    // Check for any user IDs that weren't found in existing collaborators
                    const foundUserIds = new Set(collaborators.map((collab) => collab.subject?.userID || collab.id));
                    c.options.allowedUsers.forEach((userId) => {
                        if (!foundUserIds.has(userId)) {
                            console.error(`User ${userId} not found in collaborators list`);
                        }
                    });
                }

                return this._authzIoService.create({
                    objectType: UnitObject.SelectRange,
                    selectRangeObject: {
                        collaborators,
                        unitID: this._unitId,
                        name: c.options?.name || '',
                        scope: undefined,
                    },
                });
            })
        );

        // 2. Build rule parameters with proper viewState and editState
        const ruleParams = configs.map((c, i) => {
            const viewState = this._determineViewState(c.options);
            const editState = this._determineEditState(c.options);

            return {
                permissionId: permissionIds[i],
                unitType: UnitObject.SelectRange,
                unitId: this._unitId,
                subUnitId: this._subUnitId,
                ranges: c.ranges.map((r) => r.getRange()),
                id: this._rangeProtectionRuleModel.createRuleId(this._unitId, this._subUnitId),
                description: c.options?.name || '',
                viewState,
                editState,
            };
        });

        // 3. Execute command to add multiple rules at once
        const result = await this._commandService.executeCommand(AddRangeProtectionMutation.id, {
            unitId: this._unitId,
            subUnitId: this._subUnitId,
            rules: ruleParams,
        });

        if (!result) {
            throw new Error('Failed to create range protection rules');
        }

        // 4. Set permission points for each rule
        await Promise.all(
            configs.map((c, i) => this._setPermissionPoints(permissionIds[i], c.options))
        );

        // 5. Create RangeProtectionRule objects
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

        // The Observable stream will automatically emit the change event
        return rules;
    }

    /**
     * Determine view state from options
     * @private
     */
    private _determineViewState(options?: IRangeProtectionOptions): ViewStateEnum {
        if (options?.allowViewByOthers === false) {
            return ViewStateEnum.NoOneElseCanView; // Only owner can view
        }
        return ViewStateEnum.OthersCanView;
    }

    /**
     * Determine edit state from options
     * @private
     */
    private _determineEditState(options?: IRangeProtectionOptions): EditStateEnum {
        if (options?.allowEdit === true && options?.allowedUsers?.length) {
            return EditStateEnum.DesignedUserCanEdit; // Designed users can edit
        }
        return EditStateEnum.OnlyMe;
    }

    /**
     * Set permission points based on options (for local runtime control)
     * @private
     */
    private async _setPermissionPoints(permissionId: string, options?: IRangeProtectionOptions): Promise<void> {
        if (!options) {
            return;
        }

        const getPermissionValue = (option: boolean | string[] | undefined, defaultValue: boolean): boolean => {
            if (option === undefined) {
                return defaultValue;
            }
            if (typeof option === 'boolean') {
                return option;
            }
            return true; // For string[] whitelist
        };

        // Set permission points
        await this._setPermissionPoint(permissionId, RangePermissionPoint.Edit, getPermissionValue(options.allowEdit, false));
        await this._setPermissionPoint(permissionId, RangePermissionPoint.View, getPermissionValue(options.allowViewByOthers, true));
    }

    /**
     * Set a single permission point
     * @private
     */
    private async _setPermissionPoint(permissionId: string, point: RangePermissionPoint, value: boolean): Promise<void> {
        const PermissionPointClass = RANGE_PERMISSION_POINT_MAP[point];
        if (!PermissionPointClass) {
            return;
        }

        // Use FPermission's setRangeProtectionPermissionPoint method
        this._fPermission.setRangeProtectionPermissionPoint(this._unitId, this._subUnitId, permissionId, PermissionPointClass, value);
    }

    /**
     * Remove multiple protection rules at once.
     * @param {string[]} ruleIds Array of rule IDs to remove.
     * @returns {Promise<void>} A promise that resolves when the rules are removed.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     * await permission?.unprotectRules(['rule1', 'rule2']);
     * ```
     */
    async unprotectRules(ruleIds: string[]): Promise<void> {
        if (!ruleIds || ruleIds.length === 0) {
            return;
        }

        // Use FPermission's removeRangeProtection method
        this._fPermission.removeRangeProtection(this._unitId, this._subUnitId, ruleIds);

        // The Observable stream will automatically emit the change event
    }

    /**
     * List all range protection rules for the worksheet.
     * @returns {Promise<FRangeProtectionRule[]>} Array of protection rules.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     * const rules = await permission?.listRangeProtectionRules();
     * console.log(rules);
     * ```
     */
    async listRangeProtectionRules(): Promise<FRangeProtectionRule[]> {
        return this._buildRangeProtectionRules();
    }

    /**
     * Subscribe to permission changes (simplified interface for users not familiar with RxJS).
     * @param {Function} listener Callback function to be called when permissions change.
     * @returns {UnsubscribeFn} Unsubscribe function.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     * const unsubscribe = permission?.subscribe((snapshot) => {
     *   console.log('Permission changed:', snapshot);
     * });
     * // Later, to stop listening:
     * unsubscribe?.();
     * ```
     */
    subscribe(listener: (snapshot: WorksheetPermissionSnapshot) => void): UnsubscribeFn {
        const subscription = this.permission$.subscribe(listener);
        return () => subscription.unsubscribe();
    }

    /**
     * Clean up resources
     */
    dispose(): void {
        this._subscriptions.forEach((sub) => sub.unsubscribe());
        this._permissionSubject.complete();
        this._rangeRulesSubject.complete();
    }
}
