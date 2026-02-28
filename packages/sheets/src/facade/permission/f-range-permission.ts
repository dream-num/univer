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

import type { Nullable } from '@univerjs/core';
import type { IRangeProtectionRule } from '@univerjs/sheets';
import type { Observable, Subscription } from 'rxjs';
import type { FRange } from '../f-range';
import type { FWorksheet } from '../f-worksheet';
import type {
    IRangeProtectionOptions,
    RangePermissionSnapshot,
} from './permission-types';
import { IAuthzIoService, ICommandService, Inject, Injector, IPermissionService } from '@univerjs/core';
import { UnitRole } from '@univerjs/protocol';
import { EditStateEnum, RangeProtectionRuleModel, ViewStateEnum } from '@univerjs/sheets';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay } from 'rxjs/operators';
import { FPermission } from '../f-permission';
import { FRangeProtectionRule } from './f-range-protection-rule';
import { RANGE_PERMISSION_POINT_MAP } from './permission-point-map';
import { RangePermissionPoint } from './permission-types';

/**
 * Implementation class for RangePermission
 * Manages range-level permissions
 *
 * @hideconstructor
 */
export class FRangePermission {
    private readonly _permissionSubject: BehaviorSubject<RangePermissionSnapshot>;
    private readonly _subscriptions: Subscription[] = [];
    private readonly _fPermission: FPermission;

    /**
     * Observable stream of permission snapshot changes
     * @returns Observable that emits when permission snapshot changes
     */
    readonly permission$: Observable<RangePermissionSnapshot>;

    /**
     * Observable stream of protection state changes
     * @returns Observable that emits when protection state changes
     */
    readonly protectionChange$: Observable<{
        type: 'protected';
        rule: FRangeProtectionRule;
    } | {
        type: 'unprotected';
        ruleId: string;
    }>;

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
        // Initialize FPermission instance
        this._fPermission = this._injector.createInstance(FPermission);

        this._permissionSubject = new BehaviorSubject<RangePermissionSnapshot>(this._buildSnapshot());

        // Create permission$ stream from IPermissionService
        this.permission$ = this._createPermissionStream();

        // Create protectionChange$ stream from RangeProtectionRuleModel
        this.protectionChange$ = this._createProtectionChangeStream();
    }

    /**
     * Create permission snapshot stream from IPermissionService
     * @private
     */
    private _createPermissionStream(): Observable<RangePermissionSnapshot> {
        // Listen to permission point changes from IPermissionService
        const sub = this._permissionService.permissionPointUpdate$.pipe(
            filter((point) => {
                // Filter for permission points related to this range
                const pointId = point.id;
                return pointId.includes(this._unitId) && pointId.includes(this._subUnitId);
            })
        ).subscribe(() => {
            this._permissionSubject.next(this._buildSnapshot());
        });

        // Store subscription for cleanup
        this._subscriptions.push(sub);

        return this._permissionSubject.asObservable().pipe(
            distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
            shareReplay({ bufferSize: 1, refCount: true })
        );
    }

    /**
     * Create protection change stream from RangeProtectionRuleModel
     * @private
     */
    private _createProtectionChangeStream(): Observable<{
        type: 'protected';
        rule: FRangeProtectionRule;
    } | {
        type: 'unprotected';
        ruleId: string;
    }> {
        return this._rangeProtectionRuleModel.ruleChange$.pipe(
            filter((change) => {
                // Only process changes for this worksheet
                if (change.unitId !== this._unitId || change.subUnitId !== this._subUnitId) {
                    return false;
                }

                // Only emit for changes that affect this specific range
                if (change.type === 'delete') {
                    // Check if the deleted rule was protecting this range
                    return this._rangeMatches(change.rule);
                } else if (change.type === 'add') {
                    // Check if the new rule protects this range
                    return this._rangeMatches(change.rule);
                }
                return false;
            }),
            map((change) => {
                // Also update permission snapshot
                this._permissionSubject.next(this._buildSnapshot());

                if (change.type === 'delete') {
                    return {
                        type: 'unprotected' as const,
                        ruleId: change.rule.id,
                    };
                } else {
                    // change.type === 'add'
                    const rule = this._createFacadeRule(change.rule);
                    return {
                        type: 'protected' as const,
                        rule,
                    };
                }
            }),
            shareReplay({ bufferSize: 1, refCount: true })
        );
    }

    /**
     * Check if a protection rule matches this range
     */
    private _rangeMatches(rule: IRangeProtectionRule): boolean {
        const range = this._range.getRange();
        return rule.ranges.some((ruleRange) =>
            range.startRow === ruleRange.startRow &&
            range.startColumn === ruleRange.startColumn &&
            range.endRow === ruleRange.endRow &&
            range.endColumn === ruleRange.endColumn
        );
    }

    /**
     * Create a Facade rule from internal rule
     */
    private _createFacadeRule(rule: IRangeProtectionRule): FRangeProtectionRule {
        const ranges = rule.ranges.map((range) =>
            this._worksheet.getRange(
                range.startRow,
                range.startColumn,
                range.endRow - range.startRow + 1,
                range.endColumn - range.startColumn + 1
            )
        );

        const options: IRangeProtectionOptions = {
            name: rule.description || '',
            allowViewByOthers: rule.viewState !== ViewStateEnum.NoOneElseCanView,
            allowEdit: rule.editState === EditStateEnum.DesignedUserCanEdit,
        };

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
     * Get the value of a specific permission point.
     * @param {RangePermissionPoint} point The permission point to query.
     * @returns {boolean} true if allowed, false if denied.
     * @example
     * ```ts
     * const range = univerAPI.getActiveWorkbook()?.getActiveSheet()?.getRange('A1:B2');
     * const permission = range?.getRangePermission();
     * const canEdit = permission?.getPoint(univerAPI.Enum.RangePermissionPoint.Edit);
     * console.log(canEdit);
     * ```
     */
    getPoint(point: RangePermissionPoint): boolean {
        const PermissionPointClass = RANGE_PERMISSION_POINT_MAP[point];
        if (!PermissionPointClass) {
            console.warn(`Unknown permission point: ${point}`);
            return false;
        }

        // Try to get permission from protection rule
        const rule = this._getProtectionRule();
        if (rule) {
            const permissionPoint = new PermissionPointClass(this._unitId, this._subUnitId, rule.permissionId);
            const permission = this._permissionService.getPermissionPoint(permissionPoint.id);
            if (permission) {
                return permission.value;
            }
        }

        // Default to true (allowed) when no permission point is set
        // This aligns with worksheet-level permission behavior
        // If a range is not explicitly protected, it should be accessible
        return true;
    }

    /**
     * Get the current permission snapshot.
     * @returns {RangePermissionSnapshot} Snapshot of all permission points.
     * @example
     * ```ts
     * const range = univerAPI.getActiveWorkbook()?.getActiveSheet()?.getRange('A1:B2');
     * const permission = range?.getRangePermission();
     * const snapshot = permission?.getSnapshot();
     * console.log(snapshot);
     * ```
     */
    getSnapshot(): RangePermissionSnapshot {
        return this._buildSnapshot();
    }

    /**
     * Check if the current range is protected.
     * @returns {boolean} true if protected, false otherwise.
     * @example
     * ```ts
     * const range = univerAPI.getActiveWorkbook()?.getActiveSheet()?.getRange('A1:B2');
     * const permission = range?.getRangePermission();
     * const isProtected = permission?.isProtected();
     * console.log(isProtected);
     * ```
     */
    isProtected(): boolean {
        return this._getProtectionRule() !== null;
    }

    /**
     * Check if the current user can edit this range.
     * @returns {boolean} true if editable, false otherwise.
     * @example
     * ```ts
     * const range = univerAPI.getActiveWorkbook()?.getActiveSheet()?.getRange('A1:B2');
     * const permission = range?.getRangePermission();
     * if (permission?.canEdit()) {
     *   console.log('You can edit this range');
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
     * const range = univerAPI.getActiveWorkbook()?.getActiveSheet()?.getRange('A1:B2');
     * const permission = range?.getRangePermission();
     * if (permission?.canView()) {
     *   console.log('You can view this range');
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
     * const range = univerAPI.getActiveWorkbook()?.getActiveSheet()?.getRange('A1:B2');
     * const permission = range?.getRangePermission();
     * if (permission?.canManageCollaborator()) {
     *   console.log('You can manage collaborators for this range');
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
     * const range = univerAPI.getActiveWorkbook()?.getActiveSheet()?.getRange('A1:B2');
     * const permission = range?.getRangePermission();
     * if (permission?.canDelete()) {
     *   console.log('You can delete this protection rule');
     * }
     * ```
     */
    canDelete(): boolean {
        // Always check the permission point value first
        // This handles cases where setPoint() was called without protect()
        return this.getPoint(RangePermissionPoint.Delete);
    }

    /**
     * Set a specific permission point for the range (low-level API).
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
     * const range = univerAPI.getActiveWorkbook()?.getActiveSheet()?.getRange('A1:B2');
     * const permission = range?.getRangePermission();
     *
     * // First, create a protection rule
     * await permission?.protect({ name: 'My Range', allowEdit: true });
     *
     * // Then you can dynamically update permission points
     * await permission?.setPoint(univerAPI.Enum.RangePermissionPoint.Edit, false); // Now disable edit
     * await permission?.setPoint(univerAPI.Enum.RangePermissionPoint.View, true);  // Ensure view is enabled
     * ```
     */
    async setPoint(point: RangePermissionPoint, value: boolean): Promise<void> {
        const PermissionPointClass = RANGE_PERMISSION_POINT_MAP[point];
        if (!PermissionPointClass) {
            throw new Error(`Unknown permission point: ${point}`);
        }

        // Must have a protection rule to set permission points
        const rule = this._getProtectionRule();
        if (!rule) {
            throw new Error('Cannot set permission point: No protection rule exists for this range. Call protect() first.');
        }

        const oldValue = this.getPoint(point);
        if (oldValue === value) {
            return; // Value unchanged, no update needed
        }

        const permissionId = rule.permissionId;

        // Use FPermission's setRangeProtectionPermissionPoint method
        this._fPermission.setRangeProtectionPermissionPoint(this._unitId, this._subUnitId, permissionId, PermissionPointClass, value);

        // Update snapshot (the Observable stream will automatically emit the change)
        this._permissionSubject.next(this._buildSnapshot());
    }

    /**
     * Protect the current range.
     * @param {IRangeProtectionOptions} options Protection options.
     * @returns {Promise<FRangeProtectionRule>} The created protection rule.
     * @example
     * ```ts
     * const range = univerAPI.getActiveWorkbook()?.getActiveSheet()?.getRange('A1:B2');
     * const permission = range?.getRangePermission();
     * const rule = await permission?.protect({
     *   name: 'My protected range',
     *   allowEdit: true,
     *   allowedUsers: ['user1', 'user2'],
     *   allowViewByOthers: false,
     * });
     * console.log(rule);
     * ```
     */
    async protect(options?: IRangeProtectionOptions): Promise<FRangeProtectionRule> {
        if (this.isProtected()) {
            throw new Error('Range is already protected');
        }

        // Use FPermission's addRangeBaseProtection method
        const result = await this._fPermission.addRangeBaseProtection(
            this._unitId,
            this._subUnitId,
            [this._range],
            options
        );

        if (!result) {
            throw new Error('Failed to create range protection');
        }

        const { permissionId, ruleId } = result;

        // Set permission points for local runtime control
        await this._setPermissionPoints(permissionId, options);

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

        // The Observable stream will automatically emit the change
        return rule;
    }

    /**
     * Determine view state from options
     * @private
     */
    private _determineViewState(options?: IRangeProtectionOptions): ViewStateEnum {
        if (options?.allowViewByOthers === false) {
            return ViewStateEnum.NoOneElseCanView; // Only owner can view
        }
        // For true, undefined, or string[], default to OthersCanView
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
        // For false or undefined, default to OnlyMe
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

        // Helper function to determine permission value
        const getPermissionValue = (option: boolean | string[] | undefined, defaultValue: boolean): boolean => {
            if (option === undefined) {
                return defaultValue;
            }
            if (typeof option === 'boolean') {
                return option;
            }
            // For string[] (whitelist), we default to true and let the collaboration system handle it
            return true;
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
     * Unprotect the current range.
     * @returns {Promise<void>} A promise that resolves when the range is unprotected.
     * @example
     * ```ts
     * const range = univerAPI.getActiveWorkbook()?.getActiveSheet()?.getRange('A1:B2');
     * const permission = range?.getRangePermission();
     * await permission?.unprotect();
     * ```
     */
    async unprotect(): Promise<void> {
        const rule = this._getProtectionRule();
        if (!rule) {
            // Silently handle unprotecting a non-protected range
            return;
        }

        const ruleId = rule.id;

        // Use FPermission's removeRangeProtection method
        this._fPermission.removeRangeProtection(this._unitId, this._subUnitId, [ruleId]);
    }

    /**
     * List all protection rules.
     * @returns {Promise<FRangeProtectionRule[]>} Array of protection rules.
     * @example
     * ```ts
     * const range = univerAPI.getActiveWorkbook()?.getActiveSheet()?.getRange('A1:B2');
     * const permission = range?.getRangePermission();
     * const rules = await permission?.listRules();
     * console.log(rules);
     * ```
     */
    async listRules(): Promise<FRangeProtectionRule[]> {
        return await this._buildProtectionRulesAsync();
    }

    /**
     * Subscribe to permission changes (simplified interface).
     * @param {Function} listener Callback function to be called when permissions change.
     * @returns {Function} Unsubscribe function.
     * @example
     * ```ts
     * const range = univerAPI.getActiveWorkbook()?.getActiveSheet()?.getRange('A1:B2');
     * const permission = range?.getRangePermission();
     * const unsubscribe = permission?.subscribe((snapshot) => {
     *   console.log('Permission changed:', snapshot);
     * });
     * // Later, to stop listening:
     * unsubscribe?.();
     * ```
     */
    subscribe(listener: (snapshot: RangePermissionSnapshot) => void): (() => void) {
        const subscription = this.permission$.subscribe(listener);
        return () => subscription.unsubscribe();
    }

    /**
     * Get the protection rule for the current range
     */
    private _getProtectionRule(): Nullable<IRangeProtectionRule> {
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
        });
    }

    /**
     * Build Facade objects for all protection rules (async version with collaborator data)
     * @private
     */
    private async _buildProtectionRulesAsync(): Promise<FRangeProtectionRule[]> {
        const rules = this._rangeProtectionRuleModel.getSubunitRuleList(this._unitId, this._subUnitId);

        // Use Promise.all to fetch collaborators for all rules in parallel
        const rulesWithOptions = await Promise.all(
            rules.map(async (rule) => {
                const ranges = rule.ranges.map((range) =>
                    this._worksheet.getRange(
                        range.startRow,
                        range.startColumn,
                        range.endRow - range.startRow + 1,
                        range.endColumn - range.startColumn + 1
                    )
                );

                // Build options from rule state
                const options: IRangeProtectionOptions = {
                    name: rule.description || '',
                    allowViewByOthers: rule.viewState !== ViewStateEnum.NoOneElseCanView,
                };

                // Handle allowEdit based on editState
                if (rule.editState === EditStateEnum.DesignedUserCanEdit) {
                    try {
                        // Fetch collaborators for this rule
                        const collaborators = await this._authzIoService.listCollaborators({
                            objectID: rule.permissionId,
                            unitID: this._unitId,
                        });
                        // Extract collaborator IDs with Editor role
                        const editorIds = collaborators
                            .filter((c) => c.role === UnitRole.Editor)
                            .map((c) => c.subject?.userID || c.id);
                        options.allowEdit = editorIds.length > 0;
                    } catch (error) {
                        // If fetching collaborators fails, fall back to empty array
                        console.warn(`Failed to fetch collaborators for rule ${rule.id}:`, error);
                        options.allowEdit = false;
                    }
                } else {
                    options.allowEdit = false;
                }

                return {
                    rule,
                    ranges,
                    options,
                };
            })
        );

        // Create FRangeProtectionRule instances
        return rulesWithOptions.map(({ rule, ranges, options }) =>
            this._injector.createInstance(
                FRangeProtectionRule,
                this._unitId,
                this._subUnitId,
                rule.id,
                rule.permissionId,
                ranges,
                options
            )
        );
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

    /**
     * Clean up resources
     */
    dispose(): void {
        this._subscriptions.forEach((sub) => sub.unsubscribe());
        this._permissionSubject.complete();
    }
}
