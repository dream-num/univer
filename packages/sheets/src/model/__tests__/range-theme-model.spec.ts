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

import type { Injector, IRange, Univer, Workbook } from '@univerjs/core';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestBase, TEST_WORKBOOK_DATA_DEMO } from '../../services/__tests__/util';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { SheetRangeThemeModel } from '../range-theme-model';
import { RangeThemeStyle } from '../range-theme-util';

describe('SheetRangeThemeModel', () => {
    let univer: Univer;
    let get: Injector['get'];
    let model: SheetRangeThemeModel;
    let unitId: string;
    let subUnitId: string;

    beforeEach(() => {
        const testBed = createTestBase(TEST_WORKBOOK_DATA_DEMO, [
            [SheetInterceptorService],
            [SheetRangeThemeModel],
        ]);

        univer = testBed.univer;
        get = testBed.get;
        model = get(SheetRangeThemeModel);

        const workbook = get(IUniverInstanceService).getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        unitId = workbook.getUnitId();
        subUnitId = workbook.getActiveSheet()!.getSheetId();
    });

    afterEach(() => {
        univer.dispose();
    });

    it('should initialize default themes and support default theme unregister/register', () => {
        const defaultThemes = model.getRegisteredRangeThemes();
        expect(defaultThemes.length).toBeGreaterThan(0);
        expect(model.getDefaultRangeThemeStyle(defaultThemes[0])).toBeDefined();

        model.unRegisterDefaultRangeTheme(defaultThemes[0]);
        expect(model.getRegisteredRangeThemes().includes(defaultThemes[0])).toBe(false);

        model.registerDefaultRangeTheme(new RangeThemeStyle(defaultThemes[0]));
        expect(model.getRegisteredRangeThemes().includes(defaultThemes[0])).toBe(true);
    });

    it('should register custom theme style and notify changes', () => {
        const events: Array<{ type: 'add' | 'remove'; styleName: string }> = [];
        const sub = model.rangeThemeMapChange$.subscribe((event) => {
            events.push(event);
        });

        const customTheme = new RangeThemeStyle('custom-theme', {
            wholeStyle: { bg: { rgb: '#ffeeee' } as any },
            firstRowStyle: { bg: { rgb: '#aaffaa' } as any },
        });

        model.registerRangeThemeStyle(unitId, customTheme);
        expect(model.getCustomRangeThemeStyle(unitId, 'custom-theme')?.getName()).toBe('custom-theme');
        expect(model.getALLRegisteredTheme(unitId)).toContain('custom-theme');

        model.unregisterRangeThemeStyle(unitId, 'custom-theme');
        expect(model.getCustomRangeThemeStyle(unitId, 'custom-theme')).toBeUndefined();
        expect(events.some((event) => event.type === 'add' && event.styleName === 'custom-theme')).toBe(true);
        expect(events.some((event) => event.type === 'remove' && event.styleName === 'custom-theme')).toBe(true);
        sub.unsubscribe();
    });

    it('should register range theme rule and return style from cell query', () => {
        const customTheme = new RangeThemeStyle('rule-theme', {
            wholeStyle: { bg: { rgb: '#ccccff' } as any },
        });
        model.registerRangeThemeStyle(unitId, customTheme);

        const range: IRange = { startRow: 0, endRow: 2, startColumn: 0, endColumn: 2 };
        model.registerRangeThemeRule('rule-theme', {
            unitId,
            subUnitId,
            range,
        });

        expect(model.getRegisteredRangeThemeStyle({ unitId, subUnitId, range })).toBe('rule-theme');
        expect(model.getCellStyle(unitId, subUnitId, 1, 1)).toBeDefined();

        model.removeRangeThemeRule('rule-theme', {
            unitId,
            subUnitId,
            range,
        });
        expect(model.getRegisteredRangeThemeStyle({ unitId, subUnitId, range })).toBeUndefined();
    });

    it('should refresh zebra crossing caches and clear stale entries', () => {
        const customTheme = new RangeThemeStyle('zebra-theme', {
            wholeStyle: { bg: { rgb: '#f5f5f5' } as any },
        });
        model.registerRangeThemeStyle(unitId, customTheme);

        const range: IRange = { startRow: 0, endRow: 3, startColumn: 0, endColumn: 1 };
        model.registerRangeThemeRule('zebra-theme', { unitId, subUnitId, range });
        expect((model as any)._zebraCrossingCacheMap.get(unitId)?.get(subUnitId)?.size).toBe(1);

        model.removeRangeThemeRule('zebra-theme', { unitId, subUnitId, range });
        model.refreshZebraCrossingCacheBySheet(unitId, subUnitId);
        expect((model as any)._zebraCrossingCacheMap.get(unitId)?.get(subUnitId)?.size).toBe(0);
    });

    it('should serialize/deserialize and remove unit resources', () => {
        const customTheme = new RangeThemeStyle('json-theme', {
            wholeStyle: { bg: { rgb: '#ddddee' } as any },
        });
        model.registerRangeThemeStyle(unitId, customTheme);

        const range: IRange = { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 };
        model.registerRangeThemeRule('json-theme', { unitId, subUnitId, range });

        const jsonText = model.toJson(unitId);
        const json = JSON.parse(jsonText);
        expect(json.rangeThemeStyleRuleMap).toBeDefined();
        expect(json.rangeThemeStyleMapJson).toBeDefined();

        model.deleteUnitId(unitId);
        expect(model.getALLRegisteredTheme(unitId)).toEqual([]);

        model.fromJSON(unitId, json);
        expect(model.getALLRegisteredTheme(unitId)).toContain('json-theme');
    });
});
