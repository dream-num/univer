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

import type { IRange } from '../../sheets/typedef';
import type { DataValidationErrorStyle } from '../enum/data-validation-error-style';
import type { DataValidationImeMode } from '../enum/data-validation-ime-mode';
import type { DataValidationOperator } from '../enum/data-validation-operator';
import type { DataValidationRenderMode } from '../enum/data-validation-render-mode';
import type { DataValidationType } from '../enum/data-validation-type';

// TODO@weird94: should be moved outside of the or package

export interface IDataValidationRuleBase {
    /**
     * data validation type
     */
    type: DataValidationType | string;
    allowBlank?: boolean;
    /**
     * data validation creteria
     */
    formula1?: string;
    formula2?: string;
    operator?: DataValidationOperator;
}

export interface IDataValidationRuleOptions {
    imeMode?: DataValidationImeMode;
    /**
     * for list&listMultiple, show dropdown or not
     */
    showDropDown?: boolean;
    /**
     * validator error
     */
    showErrorMessage?: boolean;
    /**
     * custom error tips
     */
    error?: string;
    /**
     * reaction when validator error
     */
    errorStyle?: DataValidationErrorStyle;
    errorTitle?: string;
    /**
     * input prompt, not for using now.
     */
    showInputMessage?: boolean;
    prompt?: string;
    promptTitle?: string;
    /**
     * cell render mode of data validation, support TEXT, ARROW, CUSTOM
     */
    renderMode?: DataValidationRenderMode;
    /**
     * custom biz info
     */
    bizInfo?: {
        /**
         * show time in date picker
         */
        showTime?: boolean;
    };
}

export interface IDataValidationRule extends IDataValidationRuleBase, IDataValidationRuleOptions {
    uid: string;
    /**
     * @debt should using specific type cover sheet、doc、slide range type
     */
    ranges: any;

}

export interface ISheetDataValidationRule extends IDataValidationRule {
    ranges: IRange[];
}

export interface IDataValidationRuleInfo {
    rule: IDataValidationRule;
    unitId: string;
    subUnitId: string;
}
