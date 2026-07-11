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
import { createIdentifier, InterceptorManager, LocaleService, LocaleType } from '@univerjs/core';
import { LexerTreeBuilder } from '@univerjs/engine-formula';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IRefSelectionsService } from '@univerjs/sheets';
import {
    CFNumberOperator,
    CFRuleType,
    CFSubRuleType,
    CFTextOperator,
    CFTimePeriodOperator,
    CFValueType,
    IIconSetType,
} from '@univerjs/sheets-conditional-formatting';
import { IContextMenuService, ILayoutService, IShortcutService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { createCfUiTestBed } from '../../../../__tests__/create-cf-ui-test-bed';
import enUS from '../../../../locale/en-US';
import { ColorScaleStyleEditor } from '../ColorScale';
import { DataBarStyleEditor } from '../DataBar';
import { FormulaStyleEditor } from '../Formula';
import { HighlightCellStyleEditor } from '../HighlightCell';
import { IconSet } from '../IconSet';
import { RankStyleEditor } from '../Rank';
import { beforeSubmit, submit } from '../type';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const IEditorService = createIdentifier<TestEditorService>('univer.editor.service');
const IDescriptionService = createIdentifier<TestDescriptionService>('formula.description-service');

class TestLayoutService {
    readonly rootContainerElement = document.body;
}

class TestEditorService {
    register() {
        return { dispose() {} };
    }

    getEditor() {
        return undefined;
    }

    getFocusId() {
        return undefined;
    }

    focus(): void {}

    blur(): void {}
}

class TestRenderManagerService {
    getRenderById() {
        return undefined;
    }
}

class TestDocSelectionManagerService {
    readonly textSelection$ = new Subject();
}

class TestDescriptionService {
    hasDefinedNameDescription() {
        return false;
    }
}

class TestRefSelectionsService {
    setSelections(): void {}

    clear(): void {}
}

class TestShortcutService {
    registerShortcut() {
        return { dispose() {} };
    }
}

class TestContextMenuService {
    disable(): void {}

    enable(): void {}
}

function createEditorTestBed() {
    const testBed = createCfUiTestBed();
    testBed.injector.add([ILayoutService, { useClass: TestLayoutService as never }]);
    testBed.injector.add([IEditorService, { useClass: TestEditorService as never }]);
    testBed.injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    testBed.injector.add([IDescriptionService, { useClass: TestDescriptionService as never }]);
    testBed.injector.add([IRefSelectionsService, { useClass: TestRefSelectionsService as never }]);
    testBed.injector.add([IShortcutService, { useClass: TestShortcutService as never }]);
    testBed.injector.add([IContextMenuService, { useClass: TestContextMenuService as never }]);
    testBed.injector.add([LexerTreeBuilder]);
    testBed.get(LocaleService).load({ [LocaleType.EN_US]: enUS, [LocaleType.ZH_CN]: {} });

    return testBed;
}

async function createFormulaEditorTestBed() {
    const testBed = createEditorTestBed();
    const docsSelectionServiceUrl = new URL('../docs/src/services/doc-selection-manager.service.ts', `file://${process.cwd()}/`).href;
    const { DocSelectionManagerService } = await import(/* @vite-ignore */ docsSelectionServiceUrl);
    testBed.injector.add([DocSelectionManagerService, { useClass: TestDocSelectionManagerService as never }]);

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

async function selectOption(selectIndex: number, optionText: string) {
    const select = Array.from(document.querySelectorAll<HTMLElement>('[data-u-comp="select"]'))[selectIndex];
    select.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
    select.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();

    const option = Array.from(document.querySelectorAll<HTMLElement>('[data-slot="dropdown-menu-radio-item"], [role="menuitemradio"]'))
        .find((item) => item.textContent?.includes(optionText));

    if (!option) {
        throw new Error(`Rule editor option ${optionText} was not rendered`);
    }

    option.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

async function openDropdown(dropdownIndex: number) {
    const dropdown = Array.from(document.querySelectorAll<HTMLElement>('[data-slot="popover-trigger"]'))[dropdownIndex];
    if (!dropdown) {
        throw new Error(`Dropdown ${dropdownIndex} was not rendered`);
    }

    dropdown.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
    dropdown.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();
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

    it('preserves custom colors, gradient fill, thresholds, and hidden cell values when reopening a data bar rule', async () => {
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
                        rule={{
                            type: CFRuleType.dataBar,
                            isShowValue: false,
                            config: {
                                min: { type: CFValueType.percent, value: 15 },
                                max: { type: CFValueType.percentile, value: 85 },
                                isGradient: true,
                                positiveColor: '#63be7b',
                                nativeColor: '#f8696b',
                            },
                        }}
                        onChange={() => undefined}
                    />
                </RediContext.Provider>
            );
            await Promise.resolve();
        });

        expect(submitRule(interceptorManager)).toMatchObject({
            type: CFRuleType.dataBar,
            isShowValue: false,
            config: {
                min: { type: CFValueType.percent, value: 15 },
                max: { type: CFValueType.percentile, value: 85 },
                isGradient: true,
                positiveColor: '#63be7b',
                nativeColor: '#f8696b',
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

    it('preserves an existing formula highlight rule and validates it through beforeSubmit', async () => {
        currentTestBed = await createFormulaEditorTestBed();
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
        currentTestBed = await createFormulaEditorTestBed();
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
