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
import { LocaleService } from '@univerjs/core';
import { CFNumberOperator, CFRuleType, CFValueType, IIconSetType } from '@univerjs/sheets-conditional-formatting';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { IconSet } from '../IconSet';
import { beforeSubmit } from '../type';
import { createEditorTestBed, createRuleInterceptorManager, openDropdown, submitRule } from './rule-editor-test-utils';

describe('IconSet', () => {
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

    it('keeps the icon-set gallery grid RTL when the locale direction is RTL', async () => {
        currentTestBed = createEditorTestBed();
        currentTestBed.get(LocaleService).setDirection('rtl');
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        const interceptorManager = createRuleInterceptorManager();

        await act(async () => {
            root!.render(
                <RediContext.Provider value={{ injector: currentTestBed!.injector }}>
                    <IconSet interceptorManager={interceptorManager} onChange={() => undefined} />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        await openDropdown(0);

        expect(document.querySelector('[data-u-comp="cf-icon-set-group-grid"]')?.getAttribute('dir')).toBe('rtl');
        expect(document.querySelector('[data-u-comp="cf-icon-set-group-grid"] button > span')?.getAttribute('dir')).toBe('rtl');
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

    it('preserves an existing icon set rule with hidden cell values', async () => {
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
                        rule={{
                            type: CFRuleType.iconSet,
                            isShowValue: false,
                            config: [
                                {
                                    iconType: IIconSetType.threeTrafficLights1,
                                    iconId: '0',
                                    operator: CFNumberOperator.greaterThanOrEqual,
                                    value: { type: CFValueType.percent, value: 75 },
                                },
                                {
                                    iconType: IIconSetType.threeTrafficLights1,
                                    iconId: '1',
                                    operator: CFNumberOperator.greaterThan,
                                    value: { type: CFValueType.percent, value: 25 },
                                },
                                {
                                    iconType: IIconSetType.threeTrafficLights1,
                                    iconId: '2',
                                    operator: CFNumberOperator.lessThanOrEqual,
                                    value: { type: CFValueType.percent, value: Number.MAX_SAFE_INTEGER },
                                },
                            ],
                        }}
                        onChange={() => undefined}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        expect(interceptorManager.fetchThroughInterceptors(beforeSubmit)(true, null)).toBe(true);
        expect(submitRule(interceptorManager)).toMatchObject({
            type: CFRuleType.iconSet,
            isShowValue: false,
            config: [
                {
                    iconType: IIconSetType.threeTrafficLights1,
                    iconId: '0',
                    value: { type: CFValueType.percent, value: 75 },
                },
                {
                    iconType: IIconSetType.threeTrafficLights1,
                    iconId: '1',
                    value: { type: CFValueType.percent, value: 25 },
                },
                {
                    iconType: IIconSetType.threeTrafficLights1,
                    iconId: '2',
                    value: { type: CFValueType.percent, value: Number.MAX_SAFE_INTEGER },
                },
            ],
        });
    });

    it('blocks submitting an icon set whose thresholds are not ordered by their operators', async () => {
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
                        rule={{
                            type: CFRuleType.iconSet,
                            isShowValue: true,
                            config: [
                                {
                                    iconType: IIconSetType.threeArrows,
                                    iconId: '0',
                                    operator: CFNumberOperator.greaterThan,
                                    value: { type: CFValueType.num, value: 20 },
                                },
                                {
                                    iconType: IIconSetType.threeArrows,
                                    iconId: '1',
                                    operator: CFNumberOperator.greaterThan,
                                    value: { type: CFValueType.num, value: 30 },
                                },
                                {
                                    iconType: IIconSetType.threeArrows,
                                    iconId: '2',
                                    operator: CFNumberOperator.lessThanOrEqual,
                                    value: { type: CFValueType.num, value: Number.MAX_SAFE_INTEGER },
                                },
                            ],
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
