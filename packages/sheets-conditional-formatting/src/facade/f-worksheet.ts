/**
 * Copyright 2023-present DreamNum Inc.
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
import { ConditionalFormattingBuilder } from './conditional-formatting-builder';

export interface IFWorksheetConditionalFormattingMixin {

    /**
     * Gets all the conditional formatting for the current sheet
     * @return {*}  {IConditionFormattingRule[]}
     * @memberof IFWorksheetConditionalFormattingMixin
     */
    getConditionalFormattingRules(): IConditionFormattingRule[];
    /**
     * Creates a constructor for conditional formatting
     * @return {*}  {ConditionalFormatRuleBuilder}
     * @memberof IFWorksheetConditionalFormattingMixin
     */

    createConditionalFormattingRule(): ConditionalFormattingBuilder;

    /**
     * Add a new conditional format
     * @param {IConditionFormattingRule} rule
     * @return {*}  {Promise<boolean>}
     * @memberof IFWorksheetConditionalFormattingMixin
     */
    addConditionalFormattingRule(rule: IConditionFormattingRule): Promise<boolean>;

    /**
     * Delete conditional format according to `cfId`
     *
     * @param {string} cfId
     * @return {*}  {Promise<boolean>}
     * @memberof IFWorksheetConditionalFormattingMixin
     */
    deleteConditionalFormattingRule(cfId: string): Promise<boolean>;

    /**
     * Modify the priority of the conditional format
     * @param {string} cfId Rules that need to be moved
     * @param {string} toCfId Target rule
     * @param {IAnchor['type']} [type] After the default move to the destination rule, if type = before moves to the front, the default value is after
     * @memberof FWorksheetConditionalFormattingMixin
     */
    moveConditionalFormattingRule(cfId: string, toCfId: string, type?: IAnchor['type']): Promise<boolean>;

    /**
     * Set the conditional format according to `cfId`
     * @param {string} cfId
     * @param {IConditionFormattingRule} rule
     * @return {*}  {Promise<boolean>}
     * @memberof IFWorksheetConditionalFormattingMixin
     */
    setConditionalFormattingRule(cfId: string, rule: IConditionFormattingRule): Promise<boolean>;
}

export class FWorksheetConditionalFormattingMixin extends FWorksheet implements IFWorksheetConditionalFormattingMixin {
    private _getConditionalFormattingRuleModel() {
        return this._injector.get(ConditionalFormattingRuleModel);
    }

    override getConditionalFormattingRules() {
        const rules = this._getConditionalFormattingRuleModel().getSubunitRules(this._workbook.getUnitId(), this._worksheet.getSheetId()) || [];
        return [...rules];
    }

    override createConditionalFormattingRule() {
        return new ConditionalFormattingBuilder();
    }

    override addConditionalFormattingRule(rule: IConditionFormattingRule) {
        const params: IAddConditionalRuleMutationParams = {
            rule, unitId: this._workbook.getUnitId(), subUnitId: this._worksheet.getSheetId(),
        };
        return this._commandService.executeCommand(AddConditionalRuleMutation.id, params);
    }

    override deleteConditionalFormattingRule(cfId: string) {
        const params: IDeleteConditionalRuleMutationParams = {
            unitId: this._workbook.getUnitId(), subUnitId: this._worksheet.getSheetId(),
            cfId,
        };
        return this._commandService.executeCommand(DeleteConditionalRuleMutation.id, params);
    }

    override moveConditionalFormattingRule(cfId: string, toCfId: string, type: IAnchor['type'] = 'after') {
        const params: IMoveConditionalRuleMutationParams = {
            unitId: this._workbook.getUnitId(), subUnitId: this._worksheet.getSheetId(),
            start: { id: cfId, type: 'self' }, end: { id: toCfId, type },
        };
        return this._commandService.executeCommand(MoveConditionalRuleMutation.id, params);
    }

    override setConditionalFormattingRule(cfId: string, rule: IConditionFormattingRule) {
        const params: ISetConditionalRuleMutationParams = {
            unitId: this._workbook.getUnitId(), subUnitId: this._worksheet.getSheetId(),
            rule,
            cfId,
        };
        return this._commandService.executeCommand(SetConditionalRuleMutation.id, params);
    }
}

FWorksheet.extend(FWorksheetConditionalFormattingMixin);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorksheetConditionalFormattingMixin { }
}
