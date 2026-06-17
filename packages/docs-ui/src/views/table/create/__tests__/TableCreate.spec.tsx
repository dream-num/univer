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
import { Injector, LocaleService, LocaleType } from '@univerjs/core';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { DocCreateTableConfirm } from '../TableCreate';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

interface ITableSize {
    rowCount: number;
    colCount: number;
}

function createTableTestBed() {
    const injector = new Injector();
    injector.add([LocaleService, { useClass: LocaleService }]);

    injector.get(LocaleService).load({
        [LocaleType.ZH_CN]: {
            'docs-ui': {
                toolbar: {
                    table: {
                        rowCount: 'Rows',
                        colCount: 'Columns',
                    },
                },
            },
        },
    });

    return { injector };
}

function renderTableCreate(
    tableCreateParams: ITableSize,
    handleRowColChange: (rowCount: number, colCount: number) => void
) {
    const { injector } = createTableTestBed();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    function render(params: ITableSize) {
        act(() => {
            root.render(
                <RediContext.Provider value={{ injector }}>
                    <DocCreateTableConfirm
                        tableCreateParams={params}
                        handleRowColChange={handleRowColChange}
                    />
                </RediContext.Provider>
            );
        });
    }

    render(tableCreateParams);

    return {
        container,
        root,
        rerender: render,
    };
}

function getTableSizeInputs(container: HTMLElement): [HTMLInputElement, HTMLInputElement] {
    const inputs = Array.from(container.querySelectorAll('input'));
    if (inputs.length !== 2) {
        throw new Error(`Expected row and column inputs, received ${inputs.length}`);
    }

    return inputs as [HTMLInputElement, HTMLInputElement];
}

function changeInput(input: HTMLInputElement, value: string) {
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(input),
        'value'
    )?.set;

    prototypeValueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('DocCreateTableConfirm', () => {
    let root: Root | undefined;
    let container: HTMLElement | undefined;

    afterEach(() => {
        if (root) {
            act(() => root!.unmount());
        }
        container?.remove();
        root = undefined;
        container = undefined;
    });

    it('emits the current table size when row and column inputs change', () => {
        const emittedSizes: ITableSize[] = [];
        const rendered = renderTableCreate({ rowCount: 2, colCount: 4 }, (rowCount, colCount) => {
            emittedSizes.push({ rowCount, colCount });
        });
        root = rendered.root;
        container = rendered.container;

        let [rowInput, colInput] = getTableSizeInputs(container);

        act(() => changeInput(rowInput, '7'));
        [rowInput, colInput] = getTableSizeInputs(container);
        act(() => changeInput(colInput, '9'));

        expect(emittedSizes).toEqual([
            { rowCount: 7, colCount: 4 },
            { rowCount: 7, colCount: 9 },
        ]);
        expect([rowInput.value, colInput.value]).toEqual(['7', '9']);
    });

    it('syncs input values when table size props change', () => {
        const emittedSizes: ITableSize[] = [];
        const rendered = renderTableCreate({ rowCount: 3, colCount: 5 }, (rowCount, colCount) => {
            emittedSizes.push({ rowCount, colCount });
        });
        root = rendered.root;
        container = rendered.container;

        rendered.rerender({ rowCount: 12, colCount: 8 });

        const [rowInput, colInput] = getTableSizeInputs(container);
        expect([rowInput.value, colInput.value]).toEqual(['12', '8']);
        expect(emittedSizes).toEqual([]);
    });
});
