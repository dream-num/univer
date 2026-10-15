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

import type { Root } from 'react-dom/client';
import type { IConditionInfo } from '../type';
import { LocaleService, LocaleType, Univer } from '@univerjs/core';
import { TableConditionTypeEnum, TableNumberCompareTypeEnum } from '@univerjs/sheets-table';
import { RediContext } from '@univerjs/ui';
import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { MobileSheetTableConditionPanel } from '../MobileSheetTableConditionPanel';

function Harness({ condition, onChange }: { condition: IConditionInfo; onChange: (next: IConditionInfo) => void }) {
    const [value, setValue] = useState(condition);
    return (
        <MobileSheetTableConditionPanel
            unitId="unit"
            subUnitId="sheet"
            tableId="table"
            columnIndex={0}
            tableFilter={undefined}
            conditionInfo={value}
            onChange={(next) => {
                setValue(next);
                onChange(next);
            }}
        />
    );
}

let univer: Univer;
let root: Root;
let container: HTMLDivElement;
beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    univer = new Univer({ locale: LocaleType.EN_US, locales: { [LocaleType.EN_US]: enUS } });
    univer.__getInjector().get(LocaleService).setDirection('ltr');
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
});
afterEach(async () => {
    await act(async () => root.unmount());
    univer.dispose();
    container.remove();
    vi.unstubAllGlobals();
});

it.each([
    [TableNumberCompareTypeEnum.Equal, 0, '1e3', { number: 1000 }],
    [TableNumberCompareTypeEnum.Between, 0, '1e-3', { numberRange: [0.001, 10] }],
    [TableNumberCompareTypeEnum.Between, 1, '1e3', { numberRange: [5, 1000] }],
] as const)('parses scientific values for %s operand %s', async (compare, index, draft, expected) => {
    const onChange = vi.fn();
    const condition: IConditionInfo = { type: TableConditionTypeEnum.Number, compare, info: { number: 5, numberRange: [5, 10] } };
    await act(async () => root.render(
        <RediContext.Provider value={{ injector: univer.__getInjector() }}><Harness condition={condition} onChange={onChange} /></RediContext.Provider>
    ));
    const input = container.querySelectorAll<HTMLInputElement>('input[inputmode="decimal"]')[index];
    for (const next of ['1e', draft]) {
        await act(async () => {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, next);
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        if (next === '1e') {
            expect(input.value).toBe(next);
            expect(onChange).not.toHaveBeenCalled();
        }
    }
    expect(onChange).toHaveBeenLastCalledWith({ type: TableConditionTypeEnum.Number, compare, info: expected });
});
