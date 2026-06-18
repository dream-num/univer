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

import type { IFormulaValue } from '@univerjs/data-validation';
import type { FormulaInputType } from '../interface';
import { LocaleService, LocaleType, Univer } from '@univerjs/core';
import { RediContext } from '@univerjs/ui';
import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { BaseFormulaInput } from '../BaseFormulaInput';
import { CheckboxFormulaInput } from '../CheckboxFormulaInput';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function createFormulaInputTestBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();

    injector.get(LocaleService).load({
        [LocaleType.EN_US]: {
            'sheets-data-validation-ui': {
                checkbox: {
                    checked: 'Checked',
                    tips: 'Use custom cell values',
                    unchecked: 'Unchecked',
                },
                panel: {
                    formulaAnd: 'and',
                    formulaPlaceholder: 'Enter a formula',
                    valuePlaceholder: 'Enter a value',
                },
            },
        },
    });

    return {
        injector,
        univer,
    };
}

function FormulaInputHarness(props: {
    Component: FormulaInputType;
    changes: IFormulaValue[];
    initialValue: IFormulaValue;
    isTwoFormula?: boolean;
}) {
    const [value, setValue] = useState(props.initialValue);

    return (
        <props.Component
            isTwoFormula={props.isTwoFormula}
            value={value}
            onChange={(nextValue) => {
                if (!nextValue) {
                    return;
                }

                props.changes.push(nextValue);
                setValue(nextValue);
            }}
            ruleId="rule-formula"
            subUnitId="sheet-1"
            unitId="unit-1"
        />
    );
}

async function changeInputValue(input: HTMLInputElement, value: string) {
    await act(async () => {
        const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        valueSetter?.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await Promise.resolve();
    });
}

async function clickElement(element: HTMLElement) {
    await act(async () => {
        element.click();
        await Promise.resolve();
    });
}

describe('formula input behaviors', () => {
    let root: ReturnType<typeof createRoot> | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createFormulaInputTestBed> | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        currentTestBed?.univer.dispose();
        root = undefined;
        container = undefined;
        currentTestBed = undefined;
    });

    it('keeps the other bound when editing a two-bound formula rule', async () => {
        currentTestBed = createFormulaInputTestBed();
        const changes: IFormulaValue[] = [];
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <FormulaInputHarness
                        Component={BaseFormulaInput}
                        changes={changes}
                        initialValue={{ formula1: '10', formula2: '20' }}
                        isTwoFormula
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const inputs = container.querySelectorAll<HTMLInputElement>('[data-u-comp="input"] input');

        await changeInputValue(inputs[0], '15');
        expect(changes.at(-1)).toEqual({ formula1: '15', formula2: '20' });

        await changeInputValue(inputs[1], '25');
        expect(changes.at(-1)).toEqual({ formula1: '15', formula2: '25' });
    });

    it('clears custom checkbox values when default boolean cell values are restored', async () => {
        currentTestBed = createFormulaInputTestBed();
        const changes: IFormulaValue[] = [];
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <FormulaInputHarness
                        Component={CheckboxFormulaInput}
                        changes={changes}
                        initialValue={{ formula1: 'DONE', formula2: 'TODO' }}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await clickElement(container.querySelector<HTMLInputElement>('[data-u-comp="checkbox"] input')!);

        expect(changes.at(-1)).toEqual({ formula1: undefined, formula2: undefined });
        expect(container.querySelectorAll<HTMLInputElement>('[data-u-comp="input"] input')).toHaveLength(0);
    });

    it('keeps the paired checkbox value when editing one custom checkbox value', async () => {
        currentTestBed = createFormulaInputTestBed();
        const changes: IFormulaValue[] = [];
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <FormulaInputHarness
                        Component={CheckboxFormulaInput}
                        changes={changes}
                        initialValue={{ formula1: 'DONE', formula2: 'TODO' }}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const inputs = container.querySelectorAll<HTMLInputElement>('[data-u-comp="input"] input');

        await changeInputValue(inputs[0], 'YES');
        expect(changes.at(-1)).toEqual({ formula1: 'YES', formula2: 'TODO' });

        await changeInputValue(inputs[1], 'NO');
        expect(changes.at(-1)).toEqual({ formula1: 'YES', formula2: 'NO' });
    });
});
