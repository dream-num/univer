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

import type { Workbook } from '@univerjs/core';
import type { IConditionFormattingRule, ITimePeriodHighlightCell } from '../../type';
import { BooleanNumber, CellValueType, excelDateTimeSerial } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CFRuleType, CFSubRuleType, CFTimePeriodOperator } from '../../../base/const';
import { AddConditionalRuleMutation } from '../../../commands/mutations/add-conditional-rule.mutation';
import { createTestBed } from './test.util';

describe('HighlightCellCalculateUnit time periods', () => {
    let testBed: ReturnType<typeof createTestBed> | undefined;

    afterEach(() => {
        testBed?.univer.dispose();
        testBed = undefined;
        vi.useRealTimers();
    });

    it.each([
        {
            operator: CFTimePeriodOperator.last7Days,
            anchor: new Date(2026, 9, 16, 12),
            start: Date.UTC(2026, 9, 10),
            end: Date.UTC(2026, 9, 17),
        },
        {
            operator: CFTimePeriodOperator.last7Days,
            anchor: new Date(2026, 9, 16),
            start: Date.UTC(2026, 9, 10),
            end: Date.UTC(2026, 9, 17),
        },
        {
            operator: CFTimePeriodOperator.last7Days,
            anchor: new Date(2026, 9, 16, 23, 59, 59, 999),
            start: Date.UTC(2026, 9, 10),
            end: Date.UTC(2026, 9, 17),
        },
        {
            operator: CFTimePeriodOperator.last7Days,
            anchor: new Date(2026, 0, 3, 12),
            start: Date.UTC(2025, 11, 28),
            end: Date.UTC(2026, 0, 4),
        },
        {
            operator: CFTimePeriodOperator.last7Days,
            anchor: new Date(2024, 2, 3, 12),
            start: Date.UTC(2024, 1, 26),
            end: Date.UTC(2024, 2, 4),
        },
        {
            operator: CFTimePeriodOperator.last7Days,
            anchor: new Date(2026, 2, 9, 12),
            start: Date.UTC(2026, 2, 3),
            end: Date.UTC(2026, 2, 10),
        },
        {
            operator: CFTimePeriodOperator.last7Days,
            anchor: new Date(2026, 10, 2, 12),
            start: Date.UTC(2026, 9, 27),
            end: Date.UTC(2026, 10, 3),
        },
        {
            operator: CFTimePeriodOperator.nextMonth,
            anchor: new Date(2026, 1, 15, 12),
            start: Date.UTC(2026, 2, 1),
            end: Date.UTC(2026, 3, 1),
        },
        {
            operator: CFTimePeriodOperator.lastMonth,
            anchor: new Date(2026, 1, 15, 12),
            start: Date.UTC(2026, 0, 1),
            end: Date.UTC(2026, 1, 1),
        },
        {
            operator: CFTimePeriodOperator.lastMonth,
            anchor: new Date(2026, 8, 15, 12),
            start: Date.UTC(2026, 7, 1),
            end: Date.UTC(2026, 8, 1),
        },
        {
            operator: CFTimePeriodOperator.nextMonth,
            anchor: new Date(2026, 3, 30, 12),
            start: Date.UTC(2026, 4, 1),
            end: Date.UTC(2026, 5, 1),
        },
        {
            operator: CFTimePeriodOperator.lastMonth,
            anchor: new Date(2024, 2, 31, 12),
            start: Date.UTC(2024, 1, 1),
            end: Date.UTC(2024, 2, 1),
        },
        {
            operator: CFTimePeriodOperator.nextMonth,
            anchor: new Date(2024, 0, 31, 12),
            start: Date.UTC(2024, 1, 1),
            end: Date.UTC(2024, 2, 1),
        },
        {
            operator: CFTimePeriodOperator.lastMonth,
            anchor: new Date(2026, 2, 31, 12),
            start: Date.UTC(2026, 1, 1),
            end: Date.UTC(2026, 2, 1),
        },
        {
            operator: CFTimePeriodOperator.nextMonth,
            anchor: new Date(2026, 0, 31, 12),
            start: Date.UTC(2026, 1, 1),
            end: Date.UTC(2026, 2, 1),
        },
        {
            operator: CFTimePeriodOperator.lastMonth,
            anchor: new Date(2026, 0, 31, 12),
            start: Date.UTC(2025, 11, 1),
            end: Date.UTC(2026, 0, 1),
        },
        {
            operator: CFTimePeriodOperator.nextMonth,
            anchor: new Date(2026, 11, 31, 12),
            start: Date.UTC(2027, 0, 1),
            end: Date.UTC(2027, 1, 1),
        },
    ])('highlights the complete $operator for $anchor', ({ operator, anchor, start, end }) => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(anchor);
        testBed = createTestBed();
        testBed.getConditionalFormattingViewModel();
        const { unitId, subUnitId } = testBed;

        const worksheet = (testBed.workbook as Workbook).getSheetBySheetId(subUnitId)!;
        const lastDay = new Date(end);
        lastDay.setUTCDate(lastDay.getUTCDate() - 1);
        const dates = [start - 1, start, lastDay.getTime(), end - 1, end];
        for (const [row, timestamp] of dates.entries()) {
            worksheet.getCellMatrix().setValue(row, 0, {
                v: excelDateTimeSerial(new Date(timestamp)),
                t: CellValueType.NUMBER,
            });
        }

        const rule: IConditionFormattingRule<ITimePeriodHighlightCell> = {
            cfId: 'relative-time-period',
            ranges: [{ startRow: 0, endRow: dates.length - 1, startColumn: 0, endColumn: 0 }],
            stopIfTrue: false,
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.timePeriod,
                operator,
                style: { bl: BooleanNumber.TRUE },
            },
        };
        testBed.commandService.syncExecuteCommand(AddConditionalRuleMutation.id, {
            unitId,
            subUnitId,
            rule,
        });

        const service = testBed.getConditionalFormattingService();
        const results = dates.map((_, row) => service.composeStyle(unitId, subUnitId, row, 0));
        expect(results).toEqual([
            { style: {} },
            { style: { bl: BooleanNumber.TRUE } },
            { style: { bl: BooleanNumber.TRUE } },
            { style: { bl: BooleanNumber.TRUE } },
            { style: {} },
        ]);
    });
});
