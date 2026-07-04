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
    IAddRangeProtectionMutationParams,
    IAddWorksheetProtectionParams,
    IDeleteWorksheetProtectionParams,
    IRangeProtectionRule,
} from '@univerjs/sheets';
import type { FRange } from '../f-range';
import type { FWorksheet } from '../f-worksheet';
import type {
    IRangeProtectionOptions,
    IWorksheetPermissionConfig,
    IWorksheetProtectionOptions,
    WorksheetMode,
    WorksheetPermissionSnapshot,
} from './permission-types';
import {
    cellToRange,
    generateRandomId,
    IAuthzIoService,
    ICommandService,
    Inject,
    Injector,
    IPermissionService,
    Rectangle,
} from '@univerjs/core';
import { FBase } from '@univerjs/core/facade';
import { UnitAction, UnitObject, UnitRole } from '@univerjs/protocol';
import {
    AddRangeProtectionMutation,
    AddWorksheetProtectionMutation,
    DeleteRangeProtectionMutation,
    DeleteWorksheetProtectionMutation,
    EditStateEnum,
    getAllWorksheetPermissionPoint,
    getAllWorksheetPermissionPointByPointPanel,
    RangeProtectionPermissionEditPoint,
    RangeProtectionPermissionViewPoint,
    RangeProtectionRuleModel,
    ViewStateEnum,
    WorksheetProtectionPointModel,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import { FRangeProtectionRule } from './f-range-protection-rule';
import { WORKSHEET_PERMISSION_POINT_MAP } from './permission-point-map';
import { WorksheetPermissionPoint } from './permission-types';
import {
    determineEditState,
    determineScope,
    determineViewState,
    getListRangeProtectionRules,
    handleWorksheetRangePermissionIsEmpty,
} from './util';

/**
 * Implementation class for WorksheetPermission
 * Provides worksheet-level permission control
 *
 * @hideconstructor
 */
export class FWorksheetPermission extends FBase {
    private readonly _unitId: string;
    private readonly _subUnitId: string;

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
        super();

        // Get unitId and subUnitId from worksheet
        this._unitId = this._worksheet.getWorkbook().getUnitId();
        this._subUnitId = this._worksheet.getSheetId();
    }

    /**
     * Check if worksheet is currently protected.
     * @returns {boolean} true if protected, false otherwise.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * if (fWorksheet.getWorksheetPermission().isProtected()) {
     *   console.log('Worksheet is protected');
     * }
     * ```
     */
    isProtected(): boolean {
        const rule = this._worksheetProtectionRuleModel.getRule(this._unitId, this._subUnitId);
        return !!rule;
    }

    /**
     * Create worksheet protection with collaborators support.
     * This must be called before setting permission points for collaboration to work.
     * @param {IWorksheetProtectionOptions} options Protection options including allowed users.
     * @returns {Promise<string>} The permissionId for the created protection.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const permission = fWorksheet.getWorksheetPermission();
     *
     * // Create worksheet protection with collaborators
     * const permissionId = await permission.protect({
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

        const editState = determineEditState(options?.allowedUsers);
        const viewState = determineViewState(options?.allowViewByOthers);
        const scope = determineScope(editState, viewState);

        // Fetch existing collaborators if allowedUsers is provided
        const collaborators: ICollaborator[] = [];
        if (editState === EditStateEnum.DesignedUserCanEdit) {
            const existingCollaborators = await this._authzIoService.listCollaborators({
                objectID: this._unitId,
                unitID: this._unitId,
            });

            options!.allowedUsers!.forEach((userId) => {
                const existingCollaborator = existingCollaborators.find((c) => c.subject?.userID === userId || c.id === userId);
                if (!existingCollaborator) {
                    console.error(`User ${userId} not found in existing collaborators`);
                    return;
                }

                collaborators.push({
                    id: existingCollaborator.id,
                    role: UnitRole.Editor,
                    subject: existingCollaborator.subject,
                });
            });
        }

        const permissionId = await this._authzIoService.create({
            objectType: UnitObject.Worksheet,
            worksheetObject: {
                collaborators,
                unitID: this._unitId,
                strategies: [
                    { role: UnitRole.Editor, action: UnitAction.Edit },
                    { role: UnitRole.Reader, action: UnitAction.View },
                ],
                name: options?.name || '',
                scope,
            },
        });

        const result = this._commandService.syncExecuteCommand<IAddWorksheetProtectionParams>(AddWorksheetProtectionMutation.id, {
            unitId: this._unitId,
            subUnitId: this._subUnitId,
            rule: {
                permissionId,
                description: options?.name,
                unitType: UnitObject.Worksheet,
                unitId: this._unitId,
                subUnitId: this._subUnitId,
                viewState,
                editState,
            },
        });

        if (!result) {
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
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * await fWorksheet.getWorksheetPermission().unprotect();
     * ```
     */
    async unprotect(): Promise<boolean> {
        if (!this.isProtected()) {
            return true; // Already unprotected
        }

        const result = this._commandService.syncExecuteCommand<IDeleteWorksheetProtectionParams>(DeleteWorksheetProtectionMutation.id, {
            unitId: this._unitId,
            subUnitId: this._subUnitId,
        });

        [...getAllWorksheetPermissionPoint(), ...getAllWorksheetPermissionPointByPointPanel()].forEach((F) => {
            const instance = new F(this._unitId, this._subUnitId);
            this._permissionService.updatePermissionPoint(instance.id, true);
        });
        this._worksheetProtectionPointModel.deleteRule(this._unitId, this._subUnitId);

        return result;
    }

    /**
     * Set permission mode for the worksheet.
     * Automatically creates worksheet protection if not already protected.
     * @param {WorksheetMode} mode The permission mode to set ('editable' | 'readOnly' | 'filterOnly' | 'commentOnly').
     * @returns {Promise<void>} A promise that resolves when the mode is set.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * await fWorksheet.getWorksheetPermission().setMode('readOnly');
     * ```
     */
    async setMode(mode: WorksheetMode): Promise<void> {
        // Ensure worksheet protection exists before setting permission points

        const pointsToSet = this._getModePermissions(mode);

        await Promise.all(
            Object.entries(pointsToSet).map(([point, value]) => this.setPoint(point as WorksheetPermissionPoint, value))
        );
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
                break;
            case 'filterOnly':
                // Can only filter/sort
                pointsToSet[WorksheetPermissionPoint.View] = true;
                pointsToSet[WorksheetPermissionPoint.Sort] = true;
                pointsToSet[WorksheetPermissionPoint.Filter] = true;
                break;
        }

        return pointsToSet;
    }

    /**
     * Set the worksheet to read-only mode.
     * @returns {Promise<void>} A promise that resolves when the mode is set.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * await fWorksheet.getWorksheetPermission().setReadOnly();
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
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * await fWorksheet.getWorksheetPermission().setEditable();
     * ```
     */
    async setEditable(): Promise<void> {
        await this.setMode('editable');
    }

    /**
     * Set a specific permission point for the worksheet.
     * Automatically creates worksheet protection if not already protected.
     * @param {WorksheetPermissionPoint} point The permission point to set.
     * @param {boolean} value The value to set (true = allowed, false = denied).
     * @returns {Promise<void>} A promise that resolves when the point is set.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const permission = fWorksheet.getWorksheetPermission();
     * await permission.setPoint(univerAPI.Enum.WorksheetPermissionPoint.InsertRow, false);
     * ```
     */
    async setPoint(point: WorksheetPermissionPoint, value: boolean): Promise<void> {
        const PermissionPointClass = WORKSHEET_PERMISSION_POINT_MAP[point];
        if (!PermissionPointClass) {
            throw new Error(`Unknown worksheet permission point: ${point}`);
        }

        // Set worksheet permission points require worksheet protection to exist first
        const worksheetProtectionRule = this._worksheetProtectionRuleModel.getRule(this._unitId, this._subUnitId);
        if (!worksheetProtectionRule) {
            throw new Error(`Cannot set ${point} permission point because worksheet protection does not exist. Call protect() first.`);
        }

        const instance = new PermissionPointClass(this._unitId, this._subUnitId);
        const permissionPoint = this._permissionService.getPermissionPoint(instance.id);
        if (permissionPoint && permissionPoint.value === value) {
            return; // Value unchanged, no update needed
        }

        if (!permissionPoint) {
            this._permissionService.addPermissionPoint(instance);
        }

        await this._authzIoService.update({
            objectType: UnitObject.Worksheet,
            objectID: worksheetProtectionRule.permissionId,
            unitID: this._unitId,
            share: undefined,
            name: worksheetProtectionRule.description || '',
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
     * Check if the worksheet is editable.
     * @returns {boolean} true if the worksheet can be edited, false otherwise.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * if (fWorksheet.getWorksheetPermission().canEdit()) {
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
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * // Check if cell C3 can be edited
     * const fRange = fWorksheet.getRange('C3');
     * const canEdit = fWorksheet.getWorksheetPermission().canEditCell(fRange.getRow(), fRange.getColumn());
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
                    const permissionPoint = new RangeProtectionPermissionEditPoint(
                        this._unitId,
                        this._subUnitId,
                        rule.permissionId
                    );
                    const permission = this._permissionService.getPermissionPoint(permissionPoint.id);
                    return permission?.value ?? false;
                }
            }
        }

        return true;
    }

    /**
     * Check if the worksheet is viewable.
     * @returns {boolean} true if the worksheet can be viewed, false otherwise.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * if (fWorksheet.getWorksheetPermission().canView()) {
     *   console.log('Worksheet is viewable');
     * }
     */
    canView(): boolean {
        return this.getPoint(WorksheetPermissionPoint.View);
    }

    /**
     * Check if a specific cell can be viewed.
     * @param {number} row Row index.
     * @param {number} col Column index.
     * @returns {boolean} true if the cell can be viewed, false otherwise.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * // Check if cell C3 can be viewed
     * const fRange = fWorksheet.getRange('C3');
     * const canView = fWorksheet.getWorksheetPermission().canViewCell(fRange.getRow(), fRange.getColumn());
     * console.log(canView);
     * ```
     */
    canViewCell(row: number, col: number): boolean {
        // First check worksheet-level view permission
        if (!this.canView()) {
            return false;
        }

        // Check if there are range protection rules covering this cell that deny view permission
        const rules = this._rangeProtectionRuleModel.getSubunitRuleList(this._unitId, this._subUnitId);
        for (const rule of rules) {
            for (const range of rule.ranges) {
                if (
                    row >= range.startRow &&
                    row <= range.endRow &&
                    col >= range.startColumn &&
                    col <= range.endColumn
                ) {
                    // Cell is within protected range, check the rule's view permission
                    const permissionPoint = new RangeProtectionPermissionViewPoint(
                        this._unitId,
                        this._subUnitId,
                        rule.permissionId
                    );
                    const permission = this._permissionService.getPermissionPoint(permissionPoint.id);
                    return permission?.value ?? false;
                }
            }
        }

        return true;
    }

    /**
     * Get the value of a specific permission point.
     * @param {WorksheetPermissionPoint} point The permission point to query.
     * @returns {boolean} true if allowed, false if denied.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const permission = fWorksheet.getWorksheetPermission();
     * const canInsertRow = permission.getPoint(univerAPI.Enum.WorksheetPermissionPoint.InsertRow);
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
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const snapshot = fWorksheet.getWorksheetPermission().getSnapshot();
     * console.log(snapshot);
     * ```
     */
    getSnapshot(): WorksheetPermissionSnapshot {
        const snapshot = {} as WorksheetPermissionSnapshot;
        for (const point in WorksheetPermissionPoint) {
            const pointKey = WorksheetPermissionPoint[point as keyof typeof WorksheetPermissionPoint];
            snapshot[pointKey] = this.getPoint(pointKey);
        }
        return snapshot;
    }

    /**
     * Apply a permission configuration to the worksheet.
     * @param {IWorksheetPermissionConfig} config The configuration to apply.
     * @returns {Promise<void>} A promise that resolves when the configuration is applied.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getSheetByName('Sheet1');
     * if (!worksheet) return;
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
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const rules = await fWorksheet.getWorksheetPermission().protectRanges([
     *   {
     *     ranges: [fWorksheet.getRange('A1:B2')],
     *     options: { name: 'Protected Area 1', allowedUsers: ['user1', 'user2'], allowViewByOthers: true }
     *   },
     *   {
     *     ranges: [fWorksheet.getRange('C3:D4')],
     *     options: { name: 'Protected Area 2', allowViewByOthers: false }
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

        const rules = this._rangeProtectionRuleModel.getSubunitRuleList(this._unitId, this._subUnitId);

        // Fetch existing collaborators once if any config has allowedUsers
        let existingCollaborators: ICollaborator[] = [];
        let fetchCollaborators = false;

        const addRules: IRangeProtectionRule[] = [];

        for (let i = 0; i < configs.length; i++) {
            const { ranges, options } = configs[i];

            if (
                ranges.some((range) =>
                    rules.some((rule) =>
                        rule.ranges.some((ruleRange) => Rectangle.intersects(ruleRange, range.getRange()))
                    )
                )
            ) {
                throw new Error(`The specified ranges overlap with existing protected ranges: ${ranges.map((r) => r.getA1Notation()).join(', ')}`);
            }

            const editState = determineEditState(options?.allowedUsers);
            const viewState = determineViewState(options?.allowViewByOthers);
            const scope = determineScope(editState, viewState);

            const collaborators: ICollaborator[] = [];
            if (editState === EditStateEnum.DesignedUserCanEdit) {
                if (!fetchCollaborators) {
                    existingCollaborators = await this._authzIoService.listCollaborators({
                        objectID: this._unitId,
                        unitID: this._unitId,
                    });
                    fetchCollaborators = true;
                }

                options!.allowedUsers!.forEach((userId) => {
                    const existingCollaborator = existingCollaborators.find((c) => c.subject?.userID === userId || c.id === userId);
                    if (!existingCollaborator) {
                        console.error(`User ${userId} not found in existing collaborators`);
                        return;
                    }

                    collaborators.push({
                        id: existingCollaborator.id,
                        role: UnitRole.Editor,
                        subject: existingCollaborator.subject,
                    });
                });
            }

            // Create permission ID with collaborators support
            const permissionId = await this._authzIoService.create({
                objectType: UnitObject.SelectRange,
                selectRangeObject: {
                    collaborators,
                    unitID: this._unitId,
                    name: options?.name || '',
                    scope,
                },
            });
            const ruleId = `ruleId_${generateRandomId(6)}`;

            addRules.push({
                ranges: ranges.map((r) => r.getRange()),
                permissionId,
                id: ruleId,
                description: options?.name,
                unitType: UnitObject.SelectRange,
                unitId: this._unitId,
                subUnitId: this._subUnitId,
                viewState,
                editState,
            });
        }

        const result = this._commandService.syncExecuteCommand<IAddRangeProtectionMutationParams>(AddRangeProtectionMutation.id, {
            unitId: this._unitId,
            subUnitId: this._subUnitId,
            rules: addRules,
        });

        if (!result) {
            throw new Error('Failed to create range protection rules');
        }

        const rangeProtectionRules = addRules.map((item, i) => {
            const rule = this._injector.createInstance(
                FRangeProtectionRule,
                this._unitId,
                this._subUnitId,
                item.id,
                item.permissionId,
                configs[i].ranges,
                configs[i].options || {}
            );

            // Set permission points based on options (for local runtime control)
            // rule.setPoint(RangePermissionPoint.Edit, configs[i].options?.allowEdit ?? false);
            // rule.setPoint(RangePermissionPoint.View, configs[i].options?.allowViewByOthers ?? true);

            return rule;
        });

        return rangeProtectionRules;
    }

    /**
     * Remove multiple protection rules at once.
     * @param {string[]} ruleIds Array of rule IDs to remove.
     * @returns {Promise<void>} A promise that resolves when the rules are removed.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const worksheetPermission = fWorksheet.getWorksheetPermission();
     * const rules = await worksheetPermission.listRangeProtectionRules();
     * // Unprotect the first rule as an example
     * if (rules.length > 0) {
     *   const result = await worksheetPermission.unprotectRules([rules[0].id]);
     *   console.log(result);
     * }
     * ```
     */
    async unprotectRules(ruleIds: string[]): Promise<boolean> {
        if (!ruleIds || ruleIds.length === 0) {
            return true;
        }

        const result = await this._commandService.executeCommand(DeleteRangeProtectionMutation.id, {
            unitId: this._unitId,
            subUnitId: this._subUnitId,
            ruleIds,
        });

        if (result) {
            handleWorksheetRangePermissionIsEmpty(this._injector, this._unitId, this._subUnitId);
        }

        return result;
    }

    /**
     * List all range protection rules for the worksheet.
     * @param {object} [options] Options for listing range protection rules.
     * @param {boolean} [options.ignoreCollaborators] Whether to skip fetching collaborators for performance.
     * @returns {Promise<FRangeProtectionRule[]>} Array of protection rules.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const rules = await fWorksheet.getWorksheetPermission().listRangeProtectionRules();
     * console.log(rules);
     * ```
     */
    async listRangeProtectionRules(
        options?: {
            ignoreCollaborators?: boolean; // Option to ignore fetching collaborators for performance
        }
    ): Promise<FRangeProtectionRule[]> {
        return getListRangeProtectionRules(
            this._injector,
            this._unitId,
            this._subUnitId,
            {
                worksheet: this._worksheet,
                ignoreCollaborators: options?.ignoreCollaborators,
            }
        );
    }

    /**
     * Debug cell permission information.
     * @param {number} row Row index.
     * @param {number} col Column index.
     * @returns {FRangeProtectionRule | undefined} Debug information about which rules affect this cell, or null if no rules apply.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * // Get debug info for cell C3
     * const fRange = fWorksheet.getRange('C3');
     * const debugInfo = await fWorksheet.getWorksheetPermission().debugCellPermission(fRange.getRow(), fRange.getColumn());
     * console.log(debugInfo);
     * ```
     */
    async debugCellPermission(row: number, col: number): Promise<FRangeProtectionRule | undefined> {
        const rules = this._rangeProtectionRuleModel.getSubunitRuleList(this._unitId, this._subUnitId);
        const cellRange = cellToRange(row, col);
        const rule = rules.find((rule) =>
            rule.ranges.some((range) => Rectangle.intersects(cellRange, range))
        );

        if (!rule) {
            return;
        }

        const ranges = rule.ranges.map((range) => this._worksheet.getRange(range));
        const options: IRangeProtectionOptions = {
            name: rule.description || '',
            allowViewByOthers: rule.viewState !== ViewStateEnum.NoOneElseCanView,
        };

        if (rule.editState === EditStateEnum.DesignedUserCanEdit) {
            options.allowedUsers = [];

            try {
                // Fetch collaborators for this rule
                const collaborators = await this._authzIoService.listCollaborators({
                    objectID: rule.permissionId,
                    unitID: this._unitId,
                });
                options.allowedUsers = collaborators.map((c) => c.subject?.userID || c.id);
            } catch (error) {
                console.error(`Failed to fetch collaborators for rule ${rule.id}:`, error);
            }
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
}
