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
    IAddCfCommandParams,
    IAnchor,
    IClearWorksheetCfParams,
    IConditionFormattingRule,
    IDeleteCfCommandParams,
    IMoveCfCommandParams,
    ISetCfCommandParams,
} from '@univerjs/sheets-conditional-formatting';
import {
    AddCfCommand,
    ClearWorksheetCfCommand,
    ConditionalFormattingRuleModel,
    DeleteCfCommand,
    MoveCfCommand,
    SetCfCommand,
} from '@univerjs/sheets-conditional-formatting';
import { FWorksheet } from '@univerjs/sheets/facade';
import { FConditionalFormattingBuilder } from './f-conditional-formatting-builder';

/**
 * @ignore
 */
export interface IFWorksheetConditionalFormattingMixin {
    /**
     * Gets all the conditional formatting for the current sheet
     * @returns {IConditionFormattingRule[]} conditional formatting rules for the current sheet
     * @memberof IFWorksheetConditionalFormattingMixin
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const rules = fWorksheet.getConditionalFormattingRules();
     * console.log(rules);
     * ```
     */
    getConditionalFormattingRules(): IConditionFormattingRule[];

    /**
     * @deprecated use `newConditionalFormattingRule` instead.
     * Creates a constructor for conditional formatting
     * @returns {FConditionalFormattingBuilder} The conditional formatting builder
     * @memberof IFWorksheetConditionalFormattingMixin
     */
    createConditionalFormattingRule(): FConditionalFormattingBuilder;

    /**
     * Creates a constructor for conditional formatting
     * @returns {FConditionalFormattingBuilder} The conditional formatting builder
     * @memberof IFWorksheetConditionalFormattingMixin
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
     * ```
     */
    newConditionalFormattingRule(): FConditionalFormattingBuilder;

    /**
     * Add a new conditional format
     * @param {IConditionFormattingRule} rule - The conditional formatting rule to add
     * @returns {FWorksheet} Returns the current worksheet instance for method chaining
     * @memberof IFWorksheetConditionalFormattingMixin
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
     * ```
     */
    addConditionalFormattingRule(rule: IConditionFormattingRule): FWorksheet;

    /**
     * Delete conditional format according to `cfId`
     * @param {string} cfId - The conditional formatting rule id to delete
     * @returns {FWorksheet} Returns the current worksheet instance for method chaining
     * @memberof IFWorksheetConditionalFormattingMixin
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const rules = fWorksheet.getConditionalFormattingRules();
     *
     * // Delete the first rule
     * fWorksheet.deleteConditionalFormattingRule(rules[0]?.cfId);
     * ```
     */
    deleteConditionalFormattingRule(cfId: string): FWorksheet;

    /**
     * Modify the priority of the conditional format
     * @param {string} cfId - The conditional formatting rule id to move
     * @param {string} toCfId Target rule
     * @param {IAnchor['type']} [type] After the default move to the destination rule, if type = before moves to the front, the default value is after
     * @returns {FWorksheet} Returns the current worksheet instance for method chaining
     * @memberof FWorksheetConditionalFormattingMixin
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const rules = fWorksheet.getConditionalFormattingRules();
     *
     * // Move the third rule before the first rule
     * const rule = rules[2];
     * const targetRule = rules[0];
     * fWorksheet.moveConditionalFormattingRule(rule?.cfId, targetRule?.cfId, 'before');
     * ```
     */
    moveConditionalFormattingRule(cfId: string, toCfId: string, type?: IAnchor['type']): FWorksheet;

    /**
     * Set the conditional format according to `cfId`
     * @param {string} cfId - The conditional formatting rule id to set
     * @param {IConditionFormattingRule} rule - The conditional formatting rule to set
     * @returns {FWorksheet} Returns the current worksheet instance for method chaining
     * @memberof IFWorksheetConditionalFormattingMixin
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
     * // Modify the first rule to apply to a new range
     * const rules = fWorksheet.getConditionalFormattingRules();
     * const newRuleRange = fWorksheet.getRange('A1:D10');
     * fWorksheet.setConditionalFormattingRule(rules[0]?.cfId, { ...rules[0], ranges: [newRuleRange.getRange()] });
     * ```
     */
    setConditionalFormattingRule(cfId: string, rule: IConditionFormattingRule): FWorksheet;

    /**
     * Removes all conditional format rules from the sheet.
     * @returns {FWorksheet} Returns the current worksheet instance for method chaining
     * @memberof IFWorksheetConditionalFormattingMixin
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * fWorksheet.clearConditionalFormatRules();
     * console.log(fWorksheet.getConditionalFormattingRules()); // []
     * ```
     */
    clearConditionalFormatRules(): FWorksheet;
}

export class FWorksheetConditionalFormattingMixin extends FWorksheet implements IFWorksheetConditionalFormattingMixin {
    private _getConditionalFormattingRuleModel(): ConditionalFormattingRuleModel {
        return this._injector.get(ConditionalFormattingRuleModel);
    }

    override getConditionalFormattingRules(): IConditionFormattingRule[] {
        const rules = this._getConditionalFormattingRuleModel().getSubunitRules(this._workbook.getUnitId(), this._worksheet.getSheetId()) || [];
        return [...rules];
    }

    override createConditionalFormattingRule(): FConditionalFormattingBuilder {
        return new FConditionalFormattingBuilder();
    }

    override newConditionalFormattingRule(): FConditionalFormattingBuilder {
        return new FConditionalFormattingBuilder();
    }

    override addConditionalFormattingRule(rule: IConditionFormattingRule): FWorksheet {
        const params: IAddCfCommandParams = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            rule,
        };
        this._commandService.syncExecuteCommand(AddCfCommand.id, params);
        return this;
    }

    override deleteConditionalFormattingRule(cfId: string): FWorksheet {
        const params: IDeleteCfCommandParams = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            cfId,
        };
        this._commandService.syncExecuteCommand(DeleteCfCommand.id, params);
        return this;
    }

    override moveConditionalFormattingRule(cfId: string, toCfId: string, type: IAnchor['type'] = 'after'): FWorksheet {
        const params: IMoveCfCommandParams = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            start: { id: cfId, type: 'self' },
            end: { id: toCfId, type },
        };
        this._commandService.syncExecuteCommand(MoveCfCommand.id, params);
        return this;
    }

    override setConditionalFormattingRule(cfId: string, rule: IConditionFormattingRule): FWorksheet {
        const params: ISetCfCommandParams = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
            cfId,
            rule,
        };
        this._commandService.syncExecuteCommand(SetCfCommand.id, params);
        return this;
    }

    override clearConditionalFormatRules(): FWorksheet {
        const params: IClearWorksheetCfParams = {
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
        };
        this._commandService.syncExecuteCommand(ClearWorksheetCfCommand.id, params);
        return this;
    }
}

FWorksheet.extend(FWorksheetConditionalFormattingMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorksheetConditionalFormattingMixin { }
}
