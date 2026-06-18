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

import { CellValueType, Direction } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import AutoFillRules from '../rules';
import { AUTO_FILL_APPLY_TYPE, AUTO_FILL_DATA_TYPE } from '../type';

const { dateRule, numberRule, extendNumberRule, chnNumberRule, chnWeek2Rule, chnWeek3Rule, loopSeriesRule, otherRule } = AutoFillRules;

describe('auto-fill rules', () => {
    it('date rule should match object-style date and reject formula cells', () => {
        expect(
            dateRule.match(
                {
                    v: 45292,
                    t: CellValueType.NUMBER,
                    s: { n: { pattern: 'yyyy-mm-dd' } },
                },
                {} as any
            )
        ).toBe(true);

        expect(
            dateRule.match(
                {
                    f: '=A1',
                    v: 1,
                    s: { n: { pattern: 'yyyy-mm-dd' } },
                },
                {} as any
            )
        ).toBe(false);

        const rightResult = dateRule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.SERIES]?.(
            { data: [{ v: 1 }, { v: 2 }], index: [0, 1] },
            3,
            Direction.DOWN,
            {} as any
        );
        const leftResult = dateRule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.SERIES]?.(
            { data: [{ v: 1 }, { v: 2 }], index: [0, 1] },
            3,
            Direction.LEFT,
            {} as any
        );

        expect(rightResult?.map((c) => c?.v)).toEqual([3, 4, 5]);
        expect(leftResult?.map((c) => c?.v)).toEqual([-2, -1, 0]);
        expect(dateRule.isContinue({ type: AUTO_FILL_DATA_TYPE.DATE, cellData: { v: 1 } }, { v: 2 })).toBe(true);
        expect(dateRule.isContinue({ type: AUTO_FILL_DATA_TYPE.NUMBER, cellData: { v: 1 } }, { v: 2 })).toBe(false);

        expect(dateRule.match({ v: 45292, s: 'date-style' }, {
            get: () => ({
                getCurrentUnitOfType: () => ({
                    getStyles: () => ({ get: () => ({ n: { pattern: 'yyyy-mm-dd' } }) }),
                }),
            }),
        } as any)).toBe(true);
        expect(dateRule.match({ v: 45292, s: 'date-style' }, { get: () => ({ getCurrentUnitOfType: () => null }) } as any)).toBe(false);
    });

    it('number rule should match numeric cells and generate series', () => {
        expect(numberRule.match({ v: 10 }, {} as any)).toBe(true);
        expect(numberRule.match({ t: CellValueType.NUMBER }, {} as any)).toBe(true);
        expect(numberRule.match({ v: '10' }, {} as any)).toBe(false);
        expect(numberRule.isContinue({ type: AUTO_FILL_DATA_TYPE.NUMBER, cellData: { v: 1 } }, { v: 2 })).toBe(true);

        const result = numberRule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.SERIES]?.(
            { data: [{ v: 2 }, { v: 4 }], index: [0, 1] },
            3,
            Direction.DOWN,
            {} as any
        );
        expect(result?.map((cell) => cell?.v)).toEqual([6, 8, 10]);

        const reverse = numberRule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.SERIES]?.(
            { data: [{ v: 10 }, { v: 12 }], index: [0, 1] },
            2,
            Direction.UP,
            {} as any
        );
        expect(reverse?.map((cell) => cell?.v)).toEqual([6, 8]);
        expect(numberRule.isContinue({ type: AUTO_FILL_DATA_TYPE.OTHER, cellData: { v: 1 } }, { v: 2 })).toBe(false);
    });

    it('extend-number rule should support continue and copy fallback', () => {
        expect(extendNumberRule.match({ v: 'item-001' }, {} as any)).toBe(true);
        expect(extendNumberRule.match({ v: 'plain-text' }, {} as any)).toBe(false);
        expect(
            extendNumberRule.isContinue(
                { type: AUTO_FILL_DATA_TYPE.EXTEND_NUMBER, cellData: { v: 'A-001-Z' } },
                { v: 'A-002-Z' }
            )
        ).toBe(true);

        const oneCell = extendNumberRule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.SERIES]?.(
            { data: [{ v: 'A-001' }], index: [0] },
            2,
            Direction.DOWN,
            {} as any
        );
        expect(oneCell?.map((c) => `${c?.v}`)).toEqual(['A-002', 'A-003']);

        const fallbackCopy = extendNumberRule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.SERIES]?.(
            { data: [{ v: 'A-001' }, { v: 'A-003' }, { v: 'A-010' }], index: [0, 1, 2] },
            4,
            Direction.DOWN,
            {} as any
        );
        expect(fallbackCopy?.length).toBe(4);
        expect(`${fallbackCopy?.[0]?.v}`).toBe('A-001');

        const oneCellWithPadStart0 = extendNumberRule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.SERIES]?.(
            { data: [{ v: 'A2B3C009D' }], index: [0] },
            4,
            Direction.DOWN,
            {} as any
        );
        expect(oneCellWithPadStart0?.map((c) => `${c?.v}`)).toEqual(['A2B3C010D', 'A2B3C011D', 'A2B3C012D', 'A2B3C013D']);

        const multipleCellsWithPadStart0 = extendNumberRule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.SERIES]?.(
            { data: [{ v: 'A2B3C003D' }, { v: 'A2B3C002D' }, { v: 'A2B3C001D' }, { v: 'A2B3C000D' }, { v: 'A2B3C001D' }, { v: 'A2B3C002D' }], index: [0, 1, 2, 3, 4, 5] },
            4,
            Direction.DOWN,
            {} as any
        );
        expect(multipleCellsWithPadStart0?.map((c) => `${c?.v}`)).toEqual(['A2B3C003D', 'A2B3C004D', 'A2B3C005D', 'A2B3C006D']);
        expect(extendNumberRule.isContinue({ type: AUTO_FILL_DATA_TYPE.EXTEND_NUMBER, cellData: { v: 'A-001-Z' } }, { v: 'B-002-Z' })).toBe(false);

        const reverse = extendNumberRule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.SERIES]?.(
            { data: [{ v: 'A-003' }, { v: 'A-004' }], index: [0, 1] },
            2,
            Direction.LEFT,
            {} as any
        );
        expect(reverse?.map((c) => `${c?.v}`)).toEqual(['A-001', 'A-002']);
    });

    it('chinese-number rule should handle normal numbers and week cycle', () => {
        expect(chnNumberRule.match({ v: '三' }, {} as any)).toBe(true);
        expect(chnNumberRule.match({ v: 'abc' }, {} as any)).toBe(false);
        expect(chnNumberRule.isContinue({ type: AUTO_FILL_DATA_TYPE.CHN_NUMBER, cellData: { v: '一' } }, { v: '二' })).toBe(true);

        const normal = chnNumberRule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.SERIES]?.(
            { data: [{ v: '三' }], index: [0] },
            2,
            Direction.DOWN,
            {} as any
        );
        expect(normal?.map((c) => c?.v)).toEqual(['四', '五']);

        const week = chnNumberRule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.SERIES]?.(
            { data: [{ v: '六' }, { v: '日' }], index: [0, 1] },
            3,
            Direction.DOWN,
            {} as any
        );
        expect(week?.map((c) => c?.v)).toEqual(['一', '二', '三']);

        const reverseNormal = chnNumberRule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.SERIES]?.(
            { data: [{ v: '三' }, { v: '四' }], index: [0, 1] },
            2,
            Direction.LEFT,
            {} as any
        );
        expect(reverseNormal?.map((c) => c?.v)).toEqual(['一', '二']);

        const copyFallback = chnNumberRule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.SERIES]?.(
            { data: [{ v: '一' }, { v: '三' }, { v: '四' }], index: [0, 1, 2] },
            2,
            Direction.DOWN,
            {} as any
        );
        expect(copyFallback?.map((c) => c?.v)).toEqual(['一', '三']);
    });

    it('chinese week rules should produce weekday sequence', () => {
        expect(chnWeek2Rule.match({ v: '周一' }, {} as any)).toBe(true);
        expect(chnWeek3Rule.match({ v: '星期一' }, {} as any)).toBe(true);
        expect(chnWeek2Rule.isContinue({ type: AUTO_FILL_DATA_TYPE.CHN_WEEK2, cellData: { v: '周一' } }, { v: '周二' })).toBe(true);
        expect(chnWeek3Rule.isContinue({ type: AUTO_FILL_DATA_TYPE.CHN_WEEK3, cellData: { v: '星期一' } }, { v: '星期二' })).toBe(true);

        const week2 = chnWeek2Rule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.SERIES]?.(
            { data: [{ v: '周六' }, { v: '周日' }], index: [0, 1] },
            2,
            Direction.DOWN,
            {} as any
        );
        expect(week2?.map((c) => c?.v)).toEqual(['周一', '周二']);

        const week2OneReverse = chnWeek2Rule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.SERIES]?.(
            { data: [{ v: '周一' }], index: [0] },
            2,
            Direction.UP,
            {} as any
        );
        expect(week2OneReverse?.map((c) => c?.v)).toEqual(['周六', '周日']);

        const week2Fallback = chnWeek2Rule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.SERIES]?.(
            { data: [{ v: '周一' }, { v: '周三' }, { v: '周四' }], index: [0, 1, 2] },
            2,
            Direction.DOWN,
            {} as any
        );
        expect(week2Fallback?.map((c) => c?.v)).toEqual(['周一', '周三']);

        const week3 = chnWeek3Rule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.SERIES]?.(
            { data: [{ v: '星期六' }], index: [0] },
            2,
            Direction.DOWN,
            {} as any
        );
        expect(week3?.map((c) => c?.v)).toEqual(['星期日', '星期一']);

        const week3Multi = chnWeek3Rule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.SERIES]?.(
            { data: [{ v: '星期六' }, { v: '星期日' }], index: [0, 1] },
            2,
            Direction.DOWN,
            {} as any
        );
        expect(week3Multi?.map((c) => c?.v)).toEqual(['星期一', '星期二']);

        const week3Fallback = chnWeek3Rule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.SERIES]?.(
            { data: [{ v: '星期一' }, { v: '星期三' }, { v: '星期四' }], index: [0, 1, 2] },
            2,
            Direction.DOWN,
            {} as any
        );
        expect(week3Fallback?.map((c) => c?.v)).toEqual(['星期一', '星期三']);
    });

    it('loop-series rule should match and fill cyclic values', () => {
        expect(loopSeriesRule.match({ v: 'Jan' }, {} as any)).toBe(true);
        expect(loopSeriesRule.match({ v: 'custom' }, {} as any)).toBe(false);
        expect(
            loopSeriesRule.isContinue(
                { type: AUTO_FILL_DATA_TYPE.LOOP_SERIES, cellData: { v: 'Mon' } },
                { v: 'Tue' }
            )
        ).toBe(true);

        const oneValue = loopSeriesRule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.SERIES]?.(
            { data: [{ v: 'Dec' }], index: [0] },
            2,
            Direction.DOWN,
            {} as any
        );
        expect(oneValue?.map((c) => c?.v)).toEqual(['Jan', 'Feb']);

        const reversed = loopSeriesRule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.SERIES]?.(
            { data: [{ v: 'Mar' }, { v: 'Apr' }], index: [0, 1] },
            2,
            Direction.LEFT,
            {} as any
        );
        expect(reversed?.length).toBe(2);
        expect(loopSeriesRule.isContinue({ type: AUTO_FILL_DATA_TYPE.NUMBER, cellData: { v: 'Mon' } }, { v: 'Tue' })).toBe(false);

        const fallback = loopSeriesRule.applyFunctions?.[AUTO_FILL_APPLY_TYPE.SERIES]?.(
            { data: [{ v: 'Mon' }, { v: 'Wed' }, { v: 'Thu' }], index: [0, 1, 2] },
            2,
            Direction.DOWN,
            {} as any
        );
        expect(fallback?.map((c) => c?.v)).toEqual(['Mon', 'Wed']);
    });

    it('other rule should always match and continue only from OTHER', () => {
        expect(otherRule.match(undefined, {} as any)).toBe(true);
        expect(otherRule.isContinue({ type: AUTO_FILL_DATA_TYPE.OTHER, cellData: { v: 'x' } }, { v: 'y' })).toBe(true);
        expect(otherRule.isContinue({ type: AUTO_FILL_DATA_TYPE.NUMBER, cellData: { v: 1 } }, { v: 2 })).toBe(false);
    });
});
