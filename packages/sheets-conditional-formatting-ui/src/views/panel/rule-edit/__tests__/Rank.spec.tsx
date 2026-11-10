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
import { RankStyleEditor } from '../Rank';
import { createEditorTestBed, createRuleInterceptorManager, submitRule } from './rule-editor-test-utils';

describe('RankStyleEditor', () => {
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

    it('preserves an existing bottom percent rank rule when reopening the editor', async () => {
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
                        rule={{
                            type: CFRuleType.highlightCell,
                            subType: CFSubRuleType.rank,
                            isBottom: true,
                            isPercent: true,
                            value: 15,
                            style: {
                                cl: {
                                    rgb: '#c00000',
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
            subType: CFSubRuleType.rank,
            isBottom: true,
            isPercent: true,
            value: 15,
            style: {
                cl: {
                    rgb: '#c00000',
                },
            },
        });
    });
});
