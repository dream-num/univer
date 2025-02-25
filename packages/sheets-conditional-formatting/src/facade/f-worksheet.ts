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
    IConditionFormattingRule,
    IDeleteConditionalRuleMutationParams,
    IMoveConditionalRuleMutationParams,
    ISetConditionalRuleMutationParams,
} from '@univerjs/sheets-conditional-formatting';
import {
    AddConditionalRuleMutation,
    ConditionalFormattingRuleModel,
    DeleteConditionalRuleMutation,
    MoveConditionalRuleMutation,
    SetConditionalRuleMutation,
} from '@univerjs/sheets-conditional-formatting';
import { FWorksheet } from '@univerjs/sheets/facade';
import { FConditionalFormattingBuilder } from './conditional-formatting-builder';

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
     * @example
     * ```ts
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('A1:T100');
     * const rule = fWorksheet.createConditionalFormattingRule()
     *   .whenCellNotEmpty()
     *   .setRanges([fRange.getRange()])
     *   .setItalic(true)
     *   .setBackground('red')
     *   .setFontColor('green')
     *   .build();
     * fWorksheet.addConditionalFormattingRule(rule);
     * ```
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
     * const rules = fWorksheet.getConditionalFormattingRules();
     * const newRuleRange = fWorksheet.getRange('A1:D10');
     * fWorksheet.setConditionalFormattingRule(rules[0]?.cfId, { ...rules[0], ranges: [newRuleRange.getRange()] });
     * ```
     */
    setConditionalFormattingRule(cfId: string, rule: IConditionFormattingRule): FWorksheet;
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
        const params: IAddConditionalRuleMutationParams = {
            rule, unitId: this._workbook.getUnitId(), subUnitId: this._worksheet.getSheetId(),
        };
        this._commandService.syncExecuteCommand(AddConditionalRuleMutation.id, params);
        return this;
    }

    override deleteConditionalFormattingRule(cfId: string): FWorksheet {
        const params: IDeleteConditionalRuleMutationParams = {
            unitId: this._workbook.getUnitId(), subUnitId: this._worksheet.getSheetId(),
            cfId,
        };
        this._commandService.syncExecuteCommand(DeleteConditionalRuleMutation.id, params);
        return this;
    }

    override moveConditionalFormattingRule(cfId: string, toCfId: string, type: IAnchor['type'] = 'after'): FWorksheet {
        const params: IMoveConditionalRuleMutationParams = {
            unitId: this._workbook.getUnitId(), subUnitId: this._worksheet.getSheetId(),
            start: { id: cfId, type: 'self' }, end: { id: toCfId, type },
        };
        this._commandService.syncExecuteCommand(MoveConditionalRuleMutation.id, params);
        return this;
    }

    override setConditionalFormattingRule(cfId: string, rule: IConditionFormattingRule): FWorksheet {
        const params: ISetConditionalRuleMutationParams = {
            unitId: this._workbook.getUnitId(), subUnitId: this._worksheet.getSheetId(),
            rule,
            cfId,
        };
        this._commandService.syncExecuteCommand(SetConditionalRuleMutation.id, params);
        return this;
    }
}

FWorksheet.extend(FWorksheetConditionalFormattingMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorksheetConditionalFormattingMixin { }
}
