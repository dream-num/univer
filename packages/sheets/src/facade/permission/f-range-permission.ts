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
import type { IAddRangeProtectionMutationParams } from '@univerjs/sheets';
import type { FRange } from '../f-range';
import type { FWorksheet } from '../f-worksheet';
import type { IRangeProtectionOptions } from './permission-types';
import { generateRandomId, IAuthzIoService, ICommandService, Inject, Injector, Rectangle } from '@univerjs/core';
import { FBase } from '@univerjs/core/facade';
import { UnitObject, UnitRole } from '@univerjs/protocol';
import { AddRangeProtectionMutation, EditStateEnum, RangeProtectionRuleModel } from '@univerjs/sheets';
import { FRangeProtectionRule } from './f-range-protection-rule';
import { determineEditState, determineScope, determineViewState, getListRangeProtectionRules } from './util';

/**
 * Implementation class for RangePermission
 * Manages range-level permissions
 *
 * @hideconstructor
 */
export class FRangePermission extends FBase {
    constructor(
        private readonly _unitId: string,
        private readonly _subUnitId: string,
        private readonly _range: FRange,
        private readonly _worksheet: FWorksheet,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(IAuthzIoService) private readonly _authzIoService: IAuthzIoService,
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @Inject(RangeProtectionRuleModel) private readonly _rangeProtectionRuleModel: RangeProtectionRuleModel
    ) {
        super();
    }

    /**
     * Check if the current range is protected.
     * @returns {boolean} True if the range is protected, false otherwise.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const fRange = fWorksheet.getRange('A1:B2');
     * // Check if the A1:B2 range is protected
     * const isProtected = fRange.getRangePermission().isProtected();
     * console.log(isProtected);
     * ```
     */
    isProtected(): boolean {
        const rules = this._rangeProtectionRuleModel.getSubunitRuleList(this._unitId, this._subUnitId);

        // Filter rules that intersect with the current range
        const matchingRules = rules.filter((rule) =>
            rule.ranges.some((ruleRange) => Rectangle.intersects(ruleRange, this._range.getRange()))
        );

        return matchingRules.length > 0;
    }

    /**
     * Protect the current range.
     * @param {IRangeProtectionOptions} options Protection options.
     * @returns {Promise<FRangeProtectionRule>} The created protection rule.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const fRange = fWorksheet.getRange('A1:B2');
     * const rule = await fRange.getRangePermission().protect({
     *   name: 'My protected range',
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

        const result = this._commandService.syncExecuteCommand<IAddRangeProtectionMutationParams>(AddRangeProtectionMutation.id, {
            unitId: this._unitId,
            subUnitId: this._subUnitId,
            rules: [{
                ranges: [this._range.getRange()],
                permissionId,
                id: ruleId,
                description: options?.name,
                unitType: UnitObject.SelectRange,
                unitId: this._unitId,
                subUnitId: this._subUnitId,
                viewState,
                editState,
            }],
        });

        if (!result) {
            throw new Error('Failed to add range protection');
        }

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

        return rule;
    }

    /**
     * Cancel all protection rules that intersect with the current range.
     * @returns {Promise<boolean>} True if all rules were successfully removed, false otherwise.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const fRange = fWorksheet.getRange('A1:B2');
     * const result = await fRange.getRangePermission().unprotect();
     * console.log(result);
     * ```
     */
    async unprotect(): Promise<boolean> {
        const rules = await this.listRules({ ignoreCollaborators: true });
        if (rules.length === 0) return true;

        const results = await Promise.all(rules.map((rule) => rule.remove()));

        for (const result of results) {
            if (!result) {
                console.error('Failed to remove some range protection rules');
                return false;
            }
        }

        return true;
    }

    /**
     * List all protection rules that intersect with the current range.
     * @param {object} [options] Options for listing protection rules.
     * @param {boolean} [options.ignoreCollaborators] Whether to skip fetching collaborators for performance.
     * @returns {Promise<FRangeProtectionRule[]>} Array of protection rules.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getSheetByName('Sheet1');
     * if (!fWorksheet) return;
     * const fRange = fWorksheet.getRange('A1:B2');
     * const rules = await fRange.getRangePermission().listRules();
     * console.log(rules);
     * ```
     */
    async listRules(
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
                specificRange: this._range,
                ignoreCollaborators: options?.ignoreCollaborators,
            }
        );
    }
}
