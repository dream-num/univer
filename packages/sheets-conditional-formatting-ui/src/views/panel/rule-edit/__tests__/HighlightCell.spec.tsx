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
import { CFNumberOperator, CFRuleType, CFSubRuleType, CFTextOperator, CFTimePeriodOperator } from '@univerjs/sheets-conditional-formatting';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { HighlightCellStyleEditor } from '../HighlightCell';
import { beforeSubmit } from '../type';
import { createEditorTestBed, createRuleInterceptorManager, inputText, selectOption, submitRule } from './rule-editor-test-utils';

describe('HighlightCellStyleEditor', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentTestBed: ReturnType<typeof createEditorTestBed> | undefined;

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

    it('blocks submitting an empty text condition and submits the entered text condition rule', async () => {
        currentTestBed = createEditorTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const interceptorManager = createRuleInterceptorManager();
        let lastRule: unknown;

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <HighlightCellStyleEditor
                        interceptorManager={interceptorManager}
                        onChange={(rule) => {
                            lastRule = rule;
                        }}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        let canSubmit: unknown;

        await act(async () => {
            canSubmit = interceptorManager.fetchThroughInterceptors(beforeSubmit)(true, null);
            await Promise.resolve();
        });

        expect(canSubmit).toBe(false);

        const textInput = container.querySelector('input[type="text"]') as HTMLInputElement;

        await act(async () => {
            inputText(textInput, 'overdue');
            await Promise.resolve();
        });

        await act(async () => {
            canSubmit = interceptorManager.fetchThroughInterceptors(beforeSubmit)(true, null);
            await Promise.resolve();
        });

        expect(canSubmit).toBe(true);
        expect(submitRule(interceptorManager)).toMatchObject({
            type: CFRuleType.highlightCell,
            subType: CFSubRuleType.text,
            value: 'overdue',
        });
        expect(lastRule).toMatchObject({
            type: CFRuleType.highlightCell,
            subType: CFSubRuleType.text,
            value: 'overdue',
        });
    });

    it('preserves an existing number highlight rule when reopening the editor', async () => {
        currentTestBed = createEditorTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const interceptorManager = createRuleInterceptorManager();

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <HighlightCellStyleEditor
                        interceptorManager={interceptorManager}
                        rule={{
                            type: CFRuleType.highlightCell,
                            subType: CFSubRuleType.number,
                            operator: CFNumberOperator.between,
                            value: [5, 12],
                            style: {
                                bg: {
                                    rgb: '#ffeecc',
                                },
                            },
                        }}
                        onChange={() => undefined}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        expect(submitRule(interceptorManager)).toMatchObject({
            type: CFRuleType.highlightCell,
            subType: CFSubRuleType.number,
            operator: CFNumberOperator.between,
            value: [5, 12],
            style: {
                bg: {
                    rgb: '#ffeecc',
                },
            },
        });
    });

    it('preserves an existing text highlight rule and validates it through beforeSubmit', async () => {
        currentTestBed = createEditorTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const interceptorManager = createRuleInterceptorManager();

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <HighlightCellStyleEditor
                        interceptorManager={interceptorManager}
                        rule={{
                            type: CFRuleType.highlightCell,
                            subType: CFSubRuleType.text,
                            operator: CFTextOperator.endsWith,
                            value: '.com',
                            style: {
                                cl: {
                                    rgb: '#0070c0',
                                },
                            },
                        }}
                        onChange={() => undefined}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        expect(interceptorManager.fetchThroughInterceptors(beforeSubmit)(true, null)).toBe(true);
        expect(submitRule(interceptorManager)).toMatchObject({
            type: CFRuleType.highlightCell,
            subType: CFSubRuleType.text,
            operator: CFTextOperator.endsWith,
            value: '.com',
            style: {
                cl: {
                    rgb: '#0070c0',
                },
            },
        });
    });

    it('preserves an existing time period highlight rule without requiring an input value', async () => {
        currentTestBed = createEditorTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const interceptorManager = createRuleInterceptorManager();

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <HighlightCellStyleEditor
                        interceptorManager={interceptorManager}
                        rule={{
                            type: CFRuleType.highlightCell,
                            subType: CFSubRuleType.timePeriod,
                            operator: CFTimePeriodOperator.last7Days,
                            style: {
                                bg: {
                                    rgb: '#fff2cc',
                                },
                            },
                        }}
                        onChange={() => undefined}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        expect(interceptorManager.fetchThroughInterceptors(beforeSubmit)(true, null)).toBe(true);
        expect(submitRule(interceptorManager)).toMatchObject({
            type: CFRuleType.highlightCell,
            subType: CFSubRuleType.timePeriod,
            operator: CFTimePeriodOperator.last7Days,
            style: {
                bg: {
                    rgb: '#fff2cc',
                },
            },
        });
    });

    it('submits a duplicate-values highlight rule after switching the condition type', async () => {
        currentTestBed = createEditorTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const interceptorManager = createRuleInterceptorManager();
        let lastRule: unknown;

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <HighlightCellStyleEditor
                        interceptorManager={interceptorManager}
                        onChange={(rule) => {
                            lastRule = rule;
                        }}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await act(async () => {
            await selectOption(0, 'duplicateValues');
            await Promise.resolve();
        });

        expect(interceptorManager.fetchThroughInterceptors(beforeSubmit)(true, null)).toBe(true);
        const submittedRule = submitRule(interceptorManager);
        expect(submittedRule).toMatchObject({
            type: CFRuleType.highlightCell,
            subType: CFSubRuleType.duplicateValues,
        });
        expect(submittedRule).not.toHaveProperty('operator');
        expect(lastRule).toMatchObject({
            type: CFRuleType.highlightCell,
            subType: CFSubRuleType.duplicateValues,
        });
        expect(lastRule).not.toHaveProperty('operator');
    });
});
