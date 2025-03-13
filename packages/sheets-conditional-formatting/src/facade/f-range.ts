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

import type {
    IAddConditionalRuleMutationParams,
    IAnchor,
    IClearRangeCfParams,
    IConditionFormattingRule,
    IDeleteConditionalRuleMutationParams,
    IMoveConditionalRuleMutationParams,
    ISetConditionalRuleMutationParams,
} from '@univerjs/sheets-conditional-formatting';
import { Rectangle } from '@univerjs/core';
import {
    AddCfCommand,
    ClearRangeCfCommand,
    ConditionalFormattingRuleModel,
    DeleteCfCommand,
    MoveCfCommand,
    SetCfCommand,
} from '@univerjs/sheets-conditional-formatting';

import { FRange } from '@univerjs/sheets/facade';
import { FConditionalFormattingBuilder } from './f-conditional-formatting-builder';

/**
 * @ignore
 */
export interface IFRangeConditionalFormattingMixin {
    /**
     * Gets all the conditional formatting for the current range.
     * @returns {IConditionFormattingRule[]} conditional formatting rules for the current range.
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that sets the cell format to italic, red background, and green font color when the cell is not empty.
     * const fRange = fWorksheet.getRange('A1:T100');
     * const rule = fWorksheet.newConditionalFormattingRule()
     *   .whenCellNotEmpty()
     *   .setRanges([fRange.getRange()])
     *   .setItalic(true)
     *   .setBackground('red')
     *   .setFontColor('green')
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     *
     * // Get all the conditional formatting rules for the range F6:H8.
     * const targetRange = fWorksheet.getRange('F6:H8');
     * const rules = targetRange.getConditionalFormattingRules();
     * console.log(rules);
     * ```
     */
    getConditionalFormattingRules(): IConditionFormattingRule[];

    /**
     * Creates a constructor for conditional formatting
     * @returns {FConditionalFormattingBuilder} The conditional formatting builder
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     *
     * // Create a conditional formatting rule that sets the cell format to italic, red background, and green font color when the cell is not empty.
     * const fRange = fWorksheet.getRange('A1:T100');
     * const rule = fRange.createConditionalFormattingRule()
     *   .whenCellNotEmpty()
     *   .setItalic(true)
     *   .setBackground('red')
     *   .setFontColor('green')
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * console.log(fRange.getConditionalFormattingRules());
     * ```
     */
    createConditionalFormattingRule(): FConditionalFormattingBuilder;

    /**
     * Add a new conditional format
     * @deprecated use same API in FWorkSheet.
     * @param {IConditionFormattingRule} rule
     * @returns {FRange} Returns the current range instance for method chaining
     * @memberof IFRangeConditionalFormattingMixin
     */
    addConditionalFormattingRule(rule: IConditionFormattingRule): FRange;

    /**
     * Delete conditional format according to `cfId`
     * @deprecated use same API in FWorkSheet.
     * @param {string} cfId
     * @returns {FRange} Returns the current range instance for method chaining
     * @memberof IFRangeConditionalFormattingMixin
     */
    deleteConditionalFormattingRule(cfId: string): FRange;

    /**
     * Modify the priority of the conditional format
     * @deprecated use same API in FWorkSheet.
     * @param {string} cfId Rules that need to be moved
     * @param {string} toCfId Target rule
     * @param {IAnchor['type']} [type] After the default move to the destination rule, if type = before moves to the front, the default value is after
     * @returns {FRange} Returns the current range instance for method chaining
     * @memberof FRangeConditionalFormattingMixin
     */
    moveConditionalFormattingRule(cfId: string, toCfId: string, type?: IAnchor['type']): FRange;

    /**
     * Set the conditional format according to `cfId`
     * @deprecated use same API in FWorkSheet.
     * @param {string} cfId
     * @param {IConditionFormattingRule} rule
     * @returns {FRange} Returns the current range instance for method chaining
     * @memberof IFRangeConditionalFormattingMixin
     */
    setConditionalFormattingRule(cfId: string, rule: IConditionFormattingRule): FRange;

    /**
     * Clear the conditional rules for the range.
     * @returns {FRange} Returns the current range instance for method chaining
     * @memberof IFRangeConditionalFormattingMixin
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:T100');
     *
     * // Clear all conditional format rules for the range
     * fRange.clearConditionalFormatRules();
     * console.log(fRange.getConditionalFormattingRules()); // []
     * ```
     */
    clearConditionalFormatRules(): FRange;
}

export class FRangeConditionalFormattingMixin extends FRange implements IFRangeConditionalFormattingMixin {
    private _getConditionalFormattingRuleModel(): ConditionalFormattingRuleModel {
        return this._injector.get(ConditionalFormattingRuleModel);
    }

    override getConditionalFormattingRules(): IConditionFormattingRule[] {
        const rules = this._getConditionalFormattingRuleModel().getSubunitRules(this._workbook.getUnitId(), this._worksheet.getSheetId()) || [];
        return [...rules].filter((rule) => rule.ranges.some((range) => Rectangle.intersects(range, this._range)));
    }

    override createConditionalFormattingRule(): FConditionalFormattingBuilder {
        return new FConditionalFormattingBuilder({ ranges: [this._range] });
    }

    override addConditionalFormattingRule(rule: IConditionFormattingRule): FRange {
        const params: IAddConditionalRuleMutationParams = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            rule,
        };
        this._commandService.syncExecuteCommand(AddCfCommand.id, params);
        return this;
    }

    override deleteConditionalFormattingRule(cfId: string): FRange {
        const params: IDeleteConditionalRuleMutationParams = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            cfId,
        };
        this._commandService.syncExecuteCommand(DeleteCfCommand.id, params);
        return this;
    }

    override moveConditionalFormattingRule(cfId: string, toCfId: string, type: IAnchor['type'] = 'after'): FRange {
        const params: IMoveConditionalRuleMutationParams = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            start: { id: cfId, type: 'self' },
            end: { id: toCfId, type },
        };
        this._commandService.syncExecuteCommand(MoveCfCommand.id, params);
        return this;
    }

    override setConditionalFormattingRule(cfId: string, rule: IConditionFormattingRule): FRange {
        const params: ISetConditionalRuleMutationParams = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            rule,
            cfId,
        };
        this._commandService.syncExecuteCommand(SetCfCommand.id, params);
        return this;
    }

    override clearConditionalFormatRules(): FRange {
        const params: IClearRangeCfParams = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            ranges: [this._range],
        };
        this._commandService.syncExecuteCommand(ClearRangeCfCommand.id, params);
        return this;
    }
}

FRange.extend(FRangeConditionalFormattingMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FRange extends IFRangeConditionalFormattingMixin { }
}
