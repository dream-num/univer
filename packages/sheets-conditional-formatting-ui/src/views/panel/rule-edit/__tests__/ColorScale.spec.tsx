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
import { CFRuleType, CFValueType } from '@univerjs/sheets-conditional-formatting';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { ColorScaleStyleEditor } from '../ColorScale';
import { createEditorTestBed, createRuleInterceptorManager, submitRule } from './rule-editor-test-utils';

describe('ColorScaleStyleEditor', () => {
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

    it('preserves an existing three-point color scale rule when reopening the editor', async () => {
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
                        rule={{
                            type: CFRuleType.colorScale,
                            config: [
                                {
                                    index: 0,
                                    color: '#63be7b',
                                    value: { type: CFValueType.min },
                                },
                                {
                                    index: 1,
                                    color: '#ffeb84',
                                    value: { type: CFValueType.percentile, value: 50 },
                                },
                                {
                                    index: 2,
                                    color: '#f8696b',
                                    value: { type: CFValueType.max },
                                },
                            ],
                        }}
                        onChange={() => undefined}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        expect(submitRule(interceptorManager)).toMatchObject({
            type: CFRuleType.colorScale,
            config: [
                {
                    index: 0,
                    color: '#63be7b',
                    value: { type: CFValueType.min },
                },
                {
                    index: 1,
                    color: '#ffeb84',
                    value: { type: CFValueType.percentile, value: 50 },
                },
                {
                    index: 2,
                    color: '#f8696b',
                    value: { type: CFValueType.max },
                },
            ],
        });
    });
});
