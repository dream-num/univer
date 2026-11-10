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
import { CFRuleType, CFSubRuleType } from '@univerjs/sheets-conditional-formatting';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import type { createEditorTestBed } from './rule-editor-test-utils';
import { FormulaStyleEditor } from '../Formula';
import { beforeSubmit } from '../type';
import { createFormulaEditorTestBed, createRuleInterceptorManager, submitRule } from './rule-editor-test-utils';

describe('FormulaStyleEditor', () => {
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

    it('preserves an existing formula highlight rule and validates it through beforeSubmit', async () => {
        currentTestBed = createFormulaEditorTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const interceptorManager = createRuleInterceptorManager();

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <FormulaStyleEditor
                        interceptorManager={interceptorManager}
                        rule={{
                            type: CFRuleType.highlightCell,
                            subType: CFSubRuleType.formula,
                            value: '=MOD(ROW(),2)=0',
                            style: {
                                bg: {
                                    rgb: '#ddebf7',
                                },
                                cl: {
                                    rgb: '#1f4e79',
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
            subType: CFSubRuleType.formula,
            value: '=MOD(ROW(),2)=0',
            style: {
                bg: {
                    rgb: '#ddebf7',
                },
                cl: {
                    rgb: '#1f4e79',
                },
            },
        });
    });

    it('blocks submitting a reopened formula highlight rule with an invalid formula', async () => {
        currentTestBed = createFormulaEditorTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const interceptorManager = createRuleInterceptorManager();

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <FormulaStyleEditor
                        interceptorManager={interceptorManager}
                        rule={{
                            type: CFRuleType.highlightCell,
                            subType: CFSubRuleType.formula,
                            value: '=SUM(',
                            style: {
                                bg: {
                                    rgb: '#fce4d6',
                                },
                            },
                        }}
                        onChange={() => undefined}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        expect(interceptorManager.fetchThroughInterceptors(beforeSubmit)(true, null)).toBe(false);
    });
});
