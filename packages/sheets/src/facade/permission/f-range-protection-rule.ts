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

import type { FRange } from '../f-range';
import type { IRangeProtectionOptions } from './permission-types';
import { ICommandService, Inject, Injector } from '@univerjs/core';
import { DeleteRangeProtectionMutation, RangeProtectionRuleModel, SetRangeProtectionMutation } from '@univerjs/sheets';

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
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @Inject(RangeProtectionRuleModel) private readonly _rangeProtectionRuleModel: RangeProtectionRuleModel
    ) {}

    /**
     * Get the rule ID.
     * @returns {string} The unique identifier of this protection rule.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     * const rules = await permission?.listRangeProtectionRules();
     * const ruleId = rules?.[0]?.id;
     * console.log(ruleId);
     * ```
     */
    get id(): string {
        return this._ruleId;
    }

    /**
     * Get the protected ranges.
     * @returns {FRange[]} Array of protected ranges.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     * const rules = await permission?.listRangeProtectionRules();
     * const ranges = rules?.[0]?.ranges;
     * console.log(ranges);
     * ```
     */
    get ranges(): FRange[] {
        return this._ranges;
    }

    /**
     * Get the protection options.
     * @returns {IRangeProtectionOptions} Copy of the protection options.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     * const rules = await permission?.listRangeProtectionRules();
     * const options = rules?.[0]?.options;
     * console.log(options);
     * ```
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
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     * const rules = await permission?.listRangeProtectionRules();
     * const rule = rules?.[0];
     * await rule?.updateRanges([worksheet.getRange('A1:C3')]);
     * ```
     */
    async updateRanges(ranges: FRange[]): Promise<void> {
        if (!ranges || ranges.length === 0) {
            throw new Error('Ranges cannot be empty');
        }

        const rule = this._rangeProtectionRuleModel.getRule(this._unitId, this._subUnitId, this._ruleId);
        if (!rule) {
            throw new Error(`Rule ${this._ruleId} not found`);
        }

        // Check for overlap with other rules
        const subunitRuleList = this._rangeProtectionRuleModel
            .getSubunitRuleList(this._unitId, this._subUnitId)
            .filter((r) => r.id !== this._ruleId);

        const hasOverlap = subunitRuleList.some((otherRule) =>
            otherRule.ranges.some((otherRange) =>
                ranges.some((newRange) => {
                    const newRangeData = newRange.getRange();
                    return this._rangesIntersect(newRangeData, otherRange);
                })
            )
        );

        if (hasOverlap) {
            throw new Error('Range protection cannot intersect with other protection rules');
        }

        // Execute update
        await this._commandService.executeCommand(SetRangeProtectionMutation.id, {
            unitId: this._unitId,
            subUnitId: this._subUnitId,
            ruleId: this._ruleId,
            rule: {
                ...rule,
                ranges: ranges.map((range) => range.getRange()),
            },
        });

        // Update local reference
        (this._ranges as FRange[]).length = 0;
        this._ranges.push(...ranges);
    }

    /**
     * Delete the current protection rule.
     * @returns {Promise<void>} A promise that resolves when the rule is removed.
     * @example
     * ```ts
     * const worksheet = univerAPI.getActiveWorkbook()?.getActiveSheet();
     * const permission = worksheet?.getWorksheetPermission();
     * const rules = await permission?.listRangeProtectionRules();
     * const rule = rules?.[0];
     * await rule?.remove();
     * ```
     */
    async remove(): Promise<void> {
        await this._commandService.executeCommand(DeleteRangeProtectionMutation.id, {
            unitId: this._unitId,
            subUnitId: this._subUnitId,
            ruleIds: [this._ruleId],
        });
    }

    /**
     * Check if two ranges intersect
     * @returns true if ranges intersect, false otherwise
     * @private
     */
    private _rangesIntersect(
        range1: { startRow: number; startColumn: number; endRow: number; endColumn: number },
        range2: { startRow: number; startColumn: number; endRow: number; endColumn: number }
    ): boolean {
        return !(
            range1.endRow < range2.startRow ||
            range1.startRow > range2.endRow ||
            range1.endColumn < range2.startColumn ||
            range1.startColumn > range2.endColumn
        );
    }
}
