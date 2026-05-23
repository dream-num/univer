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

import type { IDataValidationRuleBase } from '@univerjs/core';
import type { ISheetLocationBase } from '@univerjs/sheets';
import { BaseDataValidator } from '@univerjs/data-validation';
import { OperatorErrorTitleMap, OperatorTextMap, OperatorTitleMap } from '../types/const/operator-text-map';

export const FORMULA1 = '{FORMULA1}';
export const FORMULA2 = '{FORMULA2}';
export const TYPE = '{TYPE}';

export abstract class BaseSheetValidator extends BaseDataValidator {
    override get operatorNames() {
        return this.operators.map((operator) => this.localeService.t(OperatorTextMap[operator]));
    }

    override generateRuleName(rule: IDataValidationRuleBase): string {
        if (!rule.operator) {
            return this.localeService.t(OperatorTitleMap.NONE).replace(TYPE, this.titleStr);
        }

        const ruleName = this.localeService.t(OperatorTitleMap[rule.operator]).replace(FORMULA1, rule.formula1 ?? '').replace(FORMULA2, rule.formula2 ?? '');
        return `${this.titleStr} ${ruleName}`;
    }

    override generateRuleErrorMessage(rule: IDataValidationRuleBase, _position: ISheetLocationBase) {
        if (!rule.operator) {
            return this.localeService.t(OperatorErrorTitleMap.NONE).replace(TYPE, this.titleStr);
        }

        const errorMsg = this.localeService.t(OperatorErrorTitleMap[rule.operator]).replace(FORMULA1, rule.formula1 ?? '').replace(FORMULA2, rule.formula2 ?? '');
        return `${errorMsg}`;
    }
}
