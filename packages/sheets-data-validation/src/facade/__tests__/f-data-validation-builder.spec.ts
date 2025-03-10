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

import type { FUniver } from '@univerjs/core/facade';
import { DataValidationOperator, DataValidationType } from '@univerjs/core';
import { FDataValidationBuilder } from '@univerjs/sheets-data-validation/facade/f-data-validation-builder.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from './create-test-bed';

describe('Test FDataValidationBuilder', () => {
    let univerAPI: FUniver;

    beforeEach(() => {
        const testBed = createFacadeTestBed();

        univerAPI = testBed.univerAPI;
    });

    it('should build checkbox', () => {
        const builder = new FDataValidationBuilder();
        builder.requireCheckbox('1', '2');
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.CHECKBOX);
        expect(builder.getCriteriaValues()).toEqual([undefined, '1', '2']);
    });

    it('should build number equal', () => {
        const builder = new FDataValidationBuilder();
        builder.requireNumberEqualTo(1);
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.DECIMAL);
        expect(builder.getCriteriaValues()).toEqual([DataValidationOperator.EQUAL, '1', undefined]);
    });

    it('should build number greater than', () => {
        const builder = new FDataValidationBuilder();
        builder.requireNumberGreaterThan(1);
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.DECIMAL);
        expect(builder.getCriteriaValues()).toEqual([DataValidationOperator.GREATER_THAN, '1', undefined]);
    });

    it('should build number greater than or equal', () => {
        const builder = new FDataValidationBuilder();
        builder.requireNumberGreaterThanOrEqualTo(1);
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.DECIMAL);
        expect(builder.getCriteriaValues()).toEqual([DataValidationOperator.GREATER_THAN_OR_EQUAL, '1', undefined]);
    });

    it('should build number less than', () => {
        const builder = new FDataValidationBuilder();
        builder.requireNumberLessThan(1);
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.DECIMAL);
        expect(builder.getCriteriaValues()).toEqual([DataValidationOperator.LESS_THAN, '1', undefined]);
    });

    it('should build number less than or equal to', () => {
        const builder = new FDataValidationBuilder();
        builder.requireNumberLessThanOrEqualTo(1);
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.DECIMAL);
        expect(builder.getCriteriaValues()).toEqual([DataValidationOperator.LESS_THAN_OR_EQUAL, '1', undefined]);
    });

    it('should build number between', () => {
        const builder = new FDataValidationBuilder();
        builder.requireNumberBetween(1, 2);
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.DECIMAL);
        expect(builder.getCriteriaValues()).toEqual([DataValidationOperator.BETWEEN, '1', '2']);
    });

    it('should build number not between', () => {
        const builder = new FDataValidationBuilder();
        builder.requireNumberNotBetween(1, 2);
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.DECIMAL);
        expect(builder.getCriteriaValues()).toEqual([DataValidationOperator.NOT_BETWEEN, '1', '2']);
    });

    it('should build int equal', () => {
        const builder = new FDataValidationBuilder();
        builder.requireNumberEqualTo(1, true);
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.WHOLE);
        expect(builder.getCriteriaValues()).toEqual([DataValidationOperator.EQUAL, '1', undefined]);
    });

    it('should build int greater than', () => {
        const builder = new FDataValidationBuilder();
        builder.requireNumberGreaterThan(1, true);
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.WHOLE);
        expect(builder.getCriteriaValues()).toEqual([DataValidationOperator.GREATER_THAN, '1', undefined]);
    });

    it('should build int greater than or equal', () => {
        const builder = new FDataValidationBuilder();
        builder.requireNumberGreaterThanOrEqualTo(1, true);
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.WHOLE);
        expect(builder.getCriteriaValues()).toEqual([DataValidationOperator.GREATER_THAN_OR_EQUAL, '1', undefined]);
    });

    it('should build int less than', () => {
        const builder = new FDataValidationBuilder();
        builder.requireNumberLessThan(1, true);
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.WHOLE);
        expect(builder.getCriteriaValues()).toEqual([DataValidationOperator.LESS_THAN, '1', undefined]);
    });

    it('should build int less than or equal to', () => {
        const builder = new FDataValidationBuilder();
        builder.requireNumberLessThanOrEqualTo(1, true);
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.WHOLE);
        expect(builder.getCriteriaValues()).toEqual([DataValidationOperator.LESS_THAN_OR_EQUAL, '1', undefined]);
    });

    it('should build int between', () => {
        const builder = new FDataValidationBuilder();
        builder.requireNumberBetween(1, 2, true);
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.WHOLE);
        expect(builder.getCriteriaValues()).toEqual([DataValidationOperator.BETWEEN, '1', '2']);
    });

    it('should build int not between', () => {
        const builder = new FDataValidationBuilder();
        builder.requireNumberNotBetween(1, 2, true);
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.WHOLE);
        expect(builder.getCriteriaValues()).toEqual([DataValidationOperator.NOT_BETWEEN, '1', '2']);
    });

    it('should build date equal', () => {
        const builder = new FDataValidationBuilder();
        builder.requireDateEqualTo(new Date('2020-01-01'));
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.DATE);
        expect(builder.getCriteriaValues()).toEqual([DataValidationOperator.EQUAL, new Date('2020-01-01').toLocaleDateString(), undefined]);
    });

    it('should build date after', () => {
        const builder = new FDataValidationBuilder();
        builder.requireDateAfter(new Date('2020-01-01'));
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.DATE);
        expect(builder.getCriteriaValues()).toEqual([DataValidationOperator.GREATER_THAN, new Date('2020-01-01').toLocaleDateString(), undefined]);
    });

    it('should build date before', () => {
        const builder = new FDataValidationBuilder();
        builder.requireDateBefore(new Date('2020-01-01'));
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.DATE);
        expect(builder.getCriteriaValues()).toEqual([DataValidationOperator.LESS_THAN, new Date('2020-01-01').toLocaleDateString(), undefined]);
    });

    it('should build date on or after', () => {
        const builder = new FDataValidationBuilder();
        builder.requireDateOnOrAfter(new Date('2020-01-01'));
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.DATE);
        expect(builder.getCriteriaValues()).toEqual([DataValidationOperator.GREATER_THAN_OR_EQUAL, new Date('2020-01-01').toLocaleDateString(), undefined]);
    });

    it('should build date on or before', () => {
        const builder = new FDataValidationBuilder();
        builder.requireDateOnOrBefore(new Date('2020-01-01'));
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.DATE);
        expect(builder.getCriteriaValues()).toEqual([DataValidationOperator.LESS_THAN_OR_EQUAL, new Date('2020-01-01').toLocaleDateString(), undefined]);
    });

    it('should build date between', () => {
        const builder = new FDataValidationBuilder();
        builder.requireDateBetween(new Date('2020-01-01'), new Date('2020-01-02'));
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.DATE);
        expect(builder.getCriteriaValues()).toEqual([DataValidationOperator.BETWEEN, new Date('2020-01-01').toLocaleDateString(), new Date('2020-01-02').toLocaleDateString()]);
    });

    it('should build date not between', () => {
        const builder = new FDataValidationBuilder();
        builder.requireDateNotBetween(new Date('2020-01-01'), new Date('2020-01-02'));
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.DATE);
        expect(builder.getCriteriaValues()).toEqual([DataValidationOperator.NOT_BETWEEN, new Date('2020-01-01').toLocaleDateString(), new Date('2020-01-02').toLocaleDateString()]);
    });

    it('should build value in list', () => {
        const builder = new FDataValidationBuilder();
        builder.requireValueInList(['1', '2', '3']);
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.LIST);
        expect(builder.getCriteriaValues()).toEqual([undefined, '1,2,3', undefined]);
    });

    it('should build value in list-multiple', () => {
        const builder = new FDataValidationBuilder();
        builder.requireValueInList(['1', '2', '3'], true);
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.LIST_MULTIPLE);
        expect(builder.getCriteriaValues()).toEqual([undefined, '1,2,3', undefined]);
    });

    it('should build value in range', () => {
        const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();

        // // A1 sets the number
        const range1 = activeSheet!.getRange(0, 0, 1, 1)!;

        const builder = new FDataValidationBuilder();
        builder.requireValueInRange(range1);
        expect(builder.build().getCriteriaType()).toEqual(DataValidationType.LIST);
        expect(builder.getCriteriaValues()).toEqual([undefined, '=[test]sheet1!A1', undefined]);
    });
});
