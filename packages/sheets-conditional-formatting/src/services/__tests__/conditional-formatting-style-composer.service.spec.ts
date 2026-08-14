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

import { Injector } from '@univerjs/core';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CFRuleType } from '../../base/const';
import { ConditionalFormattingRuleModel } from '../../models/conditional-formatting-rule-model';
import { ConditionalFormattingViewModel } from '../../models/conditional-formatting-view-model';
import { ConditionalFormattingStyleComposer } from '../conditional-formatting-style-composer.service';

describe('ConditionalFormattingStyleComposer', () => {
    let service: ConditionalFormattingStyleComposer;
    const rules = new Map<string, unknown>();
    let cellCfs: Array<{ cfId: string; result: unknown; priority: number }>;
    let ruleChange$: Subject<void>;
    let markDirty$: Subject<void>;
    let cacheClear$: Subject<void>;
    const getCellCfs = vi.fn(() => cellCfs);

    class TestConditionalFormattingRuleModel {
        $ruleChange = ruleChange$;

        getRule(_unitId: string, _subUnitId: string, cfId: string) {
            return rules.get(cfId);
        }
    }

    class TestConditionalFormattingViewModel {
        markDirty$ = markDirty$;
        cacheClear$ = cacheClear$;

        getCellCfs = getCellCfs;
    }

    beforeEach(() => {
        rules.clear();
        cellCfs = [];
        ruleChange$ = new Subject();
        markDirty$ = new Subject();
        cacheClear$ = new Subject();
        getCellCfs.mockClear();
        const injector = new Injector();
        injector.add([ConditionalFormattingRuleModel, { useClass: TestConditionalFormattingRuleModel as never }]);
        injector.add([ConditionalFormattingViewModel, { useClass: TestConditionalFormattingViewModel as never }]);
        injector.add([ConditionalFormattingStyleComposer]);
        service = injector.get(ConditionalFormattingStyleComposer);
    });

    it('merges matched conditional styles in rule priority order', () => {
        rules.set('color-scale', { stopIfTrue: false, rule: { type: CFRuleType.colorScale } });
        rules.set('highlight', { stopIfTrue: false, rule: { type: CFRuleType.highlightCell } });
        cellCfs = [
            { cfId: 'color-scale', result: '#ffeeaa', priority: 1 },
            { cfId: 'highlight', result: { cl: { rgb: '#333333' } }, priority: 2 },
        ];

        expect(service.composeStyle('book-1', 'sheet-1', 1, 1)).toEqual({
            style: { cl: { rgb: '#333333' }, bg: { rgb: '#ffeeaa' } },
        });
    });

    it('composes highlight, data bar, and icon set rules on the same cell', () => {
        const dataBar = {
            color: '#38bdf8',
            isGradient: false,
            isShowValue: true,
            startPoint: 0,
            value: 50,
        };
        const iconSet = {
            iconId: '0',
            iconType: '3Arrows',
            isShowValue: true,
        };
        rules.set('highlight', { stopIfTrue: false, rule: { type: CFRuleType.highlightCell } });
        rules.set('data-bar', { stopIfTrue: false, rule: { type: CFRuleType.dataBar } });
        rules.set('icon-set', { stopIfTrue: false, rule: { type: CFRuleType.iconSet } });
        cellCfs = [
            { cfId: 'icon-set', result: iconSet, priority: 1 },
            { cfId: 'data-bar', result: dataBar, priority: 2 },
            { cfId: 'highlight', result: { bg: { rgb: '#fff7cc' } }, priority: 3 },
        ];

        expect(service.composeStyle('book-1', 'sheet-1', 1, 1)).toEqual({
            style: { bg: { rgb: '#fff7cc' } },
            dataBar,
            iconSet,
            isShowValue: true,
        });
    });

    it('stops evaluating lower-priority rules after a matched stop-if-true rule', () => {
        rules.set('stop', { stopIfTrue: true, rule: { type: CFRuleType.highlightCell } });
        rules.set('ignored', { stopIfTrue: false, rule: { type: CFRuleType.colorScale } });
        cellCfs = [
            { cfId: 'stop', result: { bg: { rgb: '#ff0000' } }, priority: 1 },
            { cfId: 'ignored', result: '#00ff00', priority: 2 },
        ];

        expect(service.composeStyle('book-1', 'sheet-1', 1, 1)).toEqual({
            style: { bg: { rgb: '#ff0000' } },
        });
    });

    it('reuses the composed result until conditional formatting changes', () => {
        rules.set('highlight', { stopIfTrue: false, rule: { type: CFRuleType.highlightCell } });
        cellCfs = [{ cfId: 'highlight', result: { cl: { rgb: '#333333' } }, priority: 1 }];
        const first = service.composeStyle('book-1', 'sheet-1', 1, 1);
        const second = service.composeStyle('book-1', 'sheet-1', 1, 1);

        expect(second).toBe(first);
        expect(getCellCfs).toHaveBeenCalledOnce();

        markDirty$.next();
        service.composeStyle('book-1', 'sheet-1', 1, 1);
        expect(getCellCfs).toHaveBeenCalledTimes(2);

        ruleChange$.next();
        service.composeStyle('book-1', 'sheet-1', 1, 1);
        expect(getCellCfs).toHaveBeenCalledTimes(3);

        cacheClear$.next();
        service.composeStyle('book-1', 'sheet-1', 1, 1);
        expect(getCellCfs).toHaveBeenCalledTimes(4);
    });
});
