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

import { type CellValue, type DataValidationOperator, DataValidationType, type IDataValidationRule, type IDataValidationRuleBase, isFormulaString } from '@univerjs/core';
import { BaseDataValidator } from '@univerjs/data-validation/validators/base-data-validator.js';

export class CustomFormulaValidator extends BaseDataValidator {
    override id: string = DataValidationType.CUSTOM;
    override title: string;
    override operators: DataValidationOperator[];
    override scopes: string | string[];
    override formulaInput: string;

    override validatorFormula(rule: IDataValidationRuleBase): boolean {
        return isFormulaString(rule.formula1);
    }

    override isValidType(cellValue: CellValue, rule: IDataValidationRule): boolean {
        throw new Error('Method not implemented.');
    }

    override transform(cellValue: CellValue, rule: IDataValidationRule): CellValue {
        throw new Error('Method not implemented.');
    }

    override async validatorIsEqual(_cellValue: CellValue, _rule: IDataValidationRule): Promise<boolean> {
        return true;
    }

    override async validatorIsNotEqual(_cellValue: CellValue, _rule: IDataValidationRule): Promise<boolean> {
        return true;
    }

    override async validatorIsBetween(_cellValue: CellValue, _rule: IDataValidationRule): Promise<boolean> {
        return true;
    }

    override async validatorIsNotBetween(_cellValue: CellValue, _rule: IDataValidationRule): Promise<boolean> {
        return true;
    }

    override async validatorIsGreaterThan(_cellValue: CellValue, _rule: IDataValidationRule): Promise<boolean> {
        return true;
    }

    override async validatorIsGreaterThanOrEqual(_cellValue: CellValue, _rule: IDataValidationRule): Promise<boolean> {
        return true;
    }

    override async validatorIsLessThan(_cellValue: CellValue, _rule: IDataValidationRule): Promise<boolean> {
        return true;
    }

    override async validatorIsLessThanOrEqual(_cellValue: CellValue, _rule: IDataValidationRule): Promise<boolean> {
        return true;
    }
}
