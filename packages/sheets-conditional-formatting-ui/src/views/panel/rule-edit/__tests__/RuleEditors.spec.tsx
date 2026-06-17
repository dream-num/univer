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

import type { IConditionalFormattingRuleConfig } from '@univerjs/sheets-conditional-formatting';
import type { Root } from 'react-dom/client';
import { InterceptorManager, LocaleService, LocaleType } from '@univerjs/core';
import { CFRuleType, CFSubRuleType, CFValueType } from '@univerjs/sheets-conditional-formatting';
import { ILayoutService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { createCfUiTestBed } from '../../../../__tests__/create-cf-ui-test-bed';
import { ColorScaleStyleEditor } from '../ColorScale';
import { DataBarStyleEditor } from '../DataBar';
import { HighlightCellStyleEditor } from '../HighlightCell';
import { IconSet } from '../IconSet';
import { RankStyleEditor } from '../Rank';
import { beforeSubmit, submit } from '../type';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

class TestLayoutService {
    readonly rootContainerElement = document.body;
}

function createEditorTestBed() {
    const testBed = createCfUiTestBed();
    testBed.injector.add([ILayoutService, { useClass: TestLayoutService as never }]);
    testBed.get(LocaleService).load({ [LocaleType.ZH_CN]: {} });

    return testBed;
}

function createRuleInterceptorManager() {
    return new InterceptorManager({ beforeSubmit, submit });
}

function submitRule(interceptorManager: ReturnType<typeof createRuleInterceptorManager>) {
    return interceptorManager.fetchThroughInterceptors(submit)(null, null) as IConditionalFormattingRuleConfig | null;
}

function inputText(input: HTMLInputElement, value: string) {
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    valueSetter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('conditional formatting rule editors', () => {
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

    it('submits the configured rank rule instead of a generic highlight rule', async () => {
        currentTestBed = createEditorTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const interceptorManager = createRuleInterceptorManager();

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <RankStyleEditor
                        interceptorManager={interceptorManager}
                        onChange={() => undefined}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        expect(submitRule(interceptorManager)).toMatchObject({
            type: CFRuleType.highlightCell,
            subType: CFSubRuleType.rank,
            isBottom: false,
            isPercent: false,
            value: 10,
        });
    });

    it('submits data bar rule configuration with min/max value types and visibility', async () => {
        currentTestBed = createEditorTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const interceptorManager = createRuleInterceptorManager();

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <DataBarStyleEditor
                        interceptorManager={interceptorManager}
                        onChange={() => undefined}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        expect(submitRule(interceptorManager)).toMatchObject({
            type: CFRuleType.dataBar,
            isShowValue: true,
            config: {
                min: { type: CFValueType.min },
                max: { type: CFValueType.max },
                isGradient: false,
            },
        });
    });

    it('submits a two-point color scale when the median value type is disabled', async () => {
        currentTestBed = createEditorTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const interceptorManager = createRuleInterceptorManager();

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <ColorScaleStyleEditor
                        interceptorManager={interceptorManager}
                        onChange={() => undefined}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        expect(submitRule(interceptorManager)).toMatchObject({
            type: CFRuleType.colorScale,
            config: [
                { index: 0, value: { type: CFValueType.min } },
                { index: 1, value: { type: CFValueType.max } },
            ],
        });
    });

    it('submits a valid default icon set rule with visible cell values', async () => {
        currentTestBed = createEditorTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const interceptorManager = createRuleInterceptorManager();

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <IconSet
                        interceptorManager={interceptorManager}
                        onChange={() => undefined}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        expect(interceptorManager.fetchThroughInterceptors(beforeSubmit)(true, null)).toBe(true);
        expect(submitRule(interceptorManager)).toMatchObject({
            type: CFRuleType.iconSet,
            isShowValue: true,
            config: [
                {
                    iconType: '3Arrows',
                    iconId: '0',
                    value: { type: CFValueType.num, value: 20 },
                },
                {
                    iconType: '3Arrows',
                    iconId: '1',
                    value: { type: CFValueType.num, value: 10 },
                },
                {
                    iconType: '3Arrows',
                    iconId: '2',
                    value: { type: CFValueType.num, value: Number.MAX_SAFE_INTEGER },
                },
            ],
        });
    });
});
