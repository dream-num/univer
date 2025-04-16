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

import type { IColorScale } from '../../type';
import { CellValueType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { CFRuleType, CFValueType } from '../../../base/const';
import { ColorScaleCalculateUnit } from '../color-scale-calculate-unit';

describe('test-color-scale', () => {
    it('test-sync-computing', () => {
        const colorScaleUnit = new ColorScaleCalculateUnit({
            unitId: '',
            subUnitId: '',
            workbook: null as any,
            worksheet: null as any,
            rule: {
                cfId: '123',
                ranges: [],
                stopIfTrue: false,
                rule: {
                    type: CFRuleType.colorScale,
                    config: [{ index: 0, value: { type: CFValueType.num, value: 10 }, color: 'red' }, { index: 1, value: { type: CFValueType.num, value: 20 }, color: 'white' }, { index: 2, value: { type: CFValueType.num, value: 30 }, color: 'green' }],
                } as IColorScale,
            },
            limit: 1000,
            accessor: null as any,
            getCellValue: (row, col) => ({ v: row + col, t: CellValueType.NUMBER }),
        });
        const count = vi.spyOn(colorScaleUnit, 'getCellResult' as any);

        const color1 = colorScaleUnit.getCell(1, 1);
        const color2 = colorScaleUnit.getCell(2, 12);
        const color3 = colorScaleUnit.getCell(5, 20);
        const color4 = colorScaleUnit.getCell(11, 20);
        expect(color1).toBe('rgb(255,0,0)');
        expect(color2).toBe('rgb(255,102,102)');
        expect(color3).toBe('rgb(128,192,128)');
        expect(color4).toBe('rgb(0,128,0)');
        // 测试缓存
        colorScaleUnit.getCell(1, 1);
        // 之前已经 colorScaleUnit.getCell(1, 1) 后,会缓存,而跳过执行一次计算.
        expect(count.mock.calls.length).toBe(4);
        colorScaleUnit.clearCache();
        colorScaleUnit.getCell(1, 1);
        // 清除缓存后,会重新计算一次。
        expect(count.mock.calls.length).toBe(5);
    });
});
