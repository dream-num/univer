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

import type { IDataValidationRuleOptions } from '@univerjs/core';
import {
    DataValidationErrorStyle,
    DataValidationRenderMode,
    LocaleService,
    LocaleType,
    Univer,
} from '@univerjs/core';
import { ComponentManager, RediContext } from '@univerjs/ui';
import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { DataValidationOptions } from '../DataValidationOptions';
import { ListRenderModeInput } from '../ListRenderModeInput';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function createOptionsTestBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    injector.add([ComponentManager]);

    injector.get(LocaleService).load({
        [LocaleType.EN_US]: {
            'sheets-data-validation-ui': {
                panel: {
                    invalid: 'Invalid data',
                    messageInfo: 'Message',
                    options: 'Options',
                    rejectInput: 'Reject input',
                    showInfo: 'Show message',
                    showWarning: 'Show warning',
                },
                renderMode: {
                    arrow: 'Arrow',
                    chip: 'Chip',
                    label: 'Display style',
                    text: 'Text',
                },
            },
        },
    });

    return {
        injector,
        univer,
    };
}

function OptionsHarness(props: {
    initialValue: IDataValidationRuleOptions;
    changes: IDataValidationRuleOptions[];
    extraComponent?: string;
}) {
    const [value, setValue] = useState(props.initialValue);

    return (
        <DataValidationOptions
            value={value}
            onChange={(nextValue) => {
                props.changes.push(nextValue);
                setValue(nextValue);
            }}
            extraComponent={props.extraComponent}
        />
    );
}

async function clickElement(element: HTMLElement) {
    await act(async () => {
        element.click();
        await Promise.resolve();
    });
}

async function changeInputValue(input: HTMLInputElement, value: string) {
    await act(async () => {
        const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        valueSetter?.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await Promise.resolve();
    });
}

describe('DataValidationOptions', () => {
    let root: ReturnType<typeof createRoot> | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createOptionsTestBed> | undefined;

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

    it('saves invalid-data handling and custom error message options through change parameters', async () => {
        currentTestBed = createOptionsTestBed();
        const changes: IDataValidationRuleOptions[] = [];
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <OptionsHarness
                        initialValue={{
                            errorStyle: DataValidationErrorStyle.WARNING,
                            showErrorMessage: false,
                            error: 'old message',
                        }}
                        changes={changes}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await clickElement(container.firstElementChild as HTMLElement);
        await clickElement(container.querySelectorAll<HTMLInputElement>('[data-u-comp="radio"] input')[1]);

        expect(changes.at(-1)).toEqual({
            errorStyle: DataValidationErrorStyle.STOP,
            showErrorMessage: false,
            error: 'old message',
        });

        await clickElement(container.querySelector<HTMLInputElement>('[data-u-comp="checkbox"] input')!);

        expect(changes.at(-1)).toEqual({
            errorStyle: DataValidationErrorStyle.STOP,
            showErrorMessage: true,
            error: 'old message',
        });

        await changeInputValue(container.querySelector<HTMLInputElement>('[data-u-comp="input"] input')!, 'Only choose approved values');

        expect(changes.at(-1)).toEqual({
            errorStyle: DataValidationErrorStyle.STOP,
            showErrorMessage: true,
            error: 'Only choose approved values',
        });
    });

    it('keeps a custom error message while message display is toggled off and back on', async () => {
        currentTestBed = createOptionsTestBed();
        const changes: IDataValidationRuleOptions[] = [];
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <OptionsHarness
                        initialValue={{
                            errorStyle: DataValidationErrorStyle.STOP,
                            showErrorMessage: true,
                            error: 'Keep this instruction',
                        }}
                        changes={changes}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await clickElement(container.firstElementChild as HTMLElement);
        const showMessageCheckbox = container.querySelector<HTMLInputElement>('[data-u-comp="checkbox"] input')!;

        await clickElement(showMessageCheckbox);

        expect(changes.at(-1)).toEqual({
            errorStyle: DataValidationErrorStyle.STOP,
            showErrorMessage: false,
            error: 'Keep this instruction',
        });

        await clickElement(showMessageCheckbox);

        expect(changes.at(-1)).toEqual({
            errorStyle: DataValidationErrorStyle.STOP,
            showErrorMessage: true,
            error: 'Keep this instruction',
        });
        expect(container.querySelector<HTMLInputElement>('[data-u-comp="input"] input')?.value).toBe('Keep this instruction');
    });

    it('keeps edited invalid-data options after the options section is collapsed and reopened', async () => {
        currentTestBed = createOptionsTestBed();
        const changes: IDataValidationRuleOptions[] = [];
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <OptionsHarness
                        initialValue={{
                            errorStyle: DataValidationErrorStyle.STOP,
                            showErrorMessage: true,
                            error: 'Initial instruction',
                        }}
                        changes={changes}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        const optionsToggle = container.firstElementChild as HTMLElement;
        await clickElement(optionsToggle);

        await changeInputValue(container.querySelector<HTMLInputElement>('[data-u-comp="input"] input')!, 'Updated instruction');
        expect(changes.at(-1)).toEqual({
            errorStyle: DataValidationErrorStyle.STOP,
            showErrorMessage: true,
            error: 'Updated instruction',
        });

        await clickElement(optionsToggle);
        expect(container.querySelector<HTMLInputElement>('[data-u-comp="input"] input')).toBeNull();

        await clickElement(optionsToggle);

        expect(container.querySelector<HTMLInputElement>('[data-u-comp="input"] input')?.value).toBe('Updated instruction');
    });

    it('saves list render mode changes from the registered extra options component', async () => {
        currentTestBed = createOptionsTestBed();
        currentTestBed.injector
            .get(ComponentManager)
            .register(ListRenderModeInput.componentKey, ListRenderModeInput);
        const changes: IDataValidationRuleOptions[] = [];
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <OptionsHarness
                        initialValue={{
                            errorStyle: DataValidationErrorStyle.WARNING,
                            renderMode: DataValidationRenderMode.CUSTOM,
                            showErrorMessage: false,
                        }}
                        changes={changes}
                        extraComponent={ListRenderModeInput.componentKey}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await clickElement(container.firstElementChild as HTMLElement);
        await clickElement(container.querySelectorAll<HTMLInputElement>('[data-u-comp="radio"] input')[1]);

        expect(changes.at(-1)).toEqual({
            errorStyle: DataValidationErrorStyle.WARNING,
            renderMode: DataValidationRenderMode.ARROW,
            showErrorMessage: false,
        });
    });
});
