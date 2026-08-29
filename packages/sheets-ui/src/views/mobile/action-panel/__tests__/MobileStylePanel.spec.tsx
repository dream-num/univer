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

import type { IDisplayMenuItem, IMenuItem, IMenuSchema } from '@univerjs/ui';
import type { ComponentProps } from 'react';
import type { Root } from 'react-dom/client';
import type { MobileNumberFormatItem } from '../MobileStylePanel';
import {
    BorderStyleTypes,
    BorderType,
    ConfigService,
    DesktopLogService,
    HorizontalAlign,
    IConfigService,
    ILogService,
    Injector,
    LocaleService,
    LocaleType,
    ThemeService,
    VerticalAlign,
} from '@univerjs/core';
import {
    AddWorksheetMergeAllCommand,
    AddWorksheetMergeCommand,
    AddWorksheetMergeHorizontalCommand,
    AddWorksheetMergeVerticalCommand,
    RemoveWorksheetMergeCommand,
    ResetBackgroundColorCommand,
    SetBackgroundColorCommand,
    SetBorderBasicCommand,
    SetHorizontalTextAlignCommand,
    SetShrinkToFitCommand,
    SetTextRotationCommand,
    SetTextWrapCommand,
    SetVerticalTextAlignCommand,
} from '@univerjs/sheets';
import { FontService, IconManager, IFontService, MenuItemType, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    ResetRangeTextColorCommand,
    SetRangeBoldCommand,
    SetRangeFontFamilyCommand,
    SetRangeItalicCommand,
    SetRangeStrickThroughCommand,
    SetRangeTextColorCommand,
    SetRangeUnderlineCommand,
} from '../../../../commands/commands/inline-format.command';
import { BORDER_LINE_CHILDREN, BORDER_SIZE_CHILDREN } from '../../../border-panel/interface';
import { MobileStylePanel } from '../MobileStylePanel';

function renderStylePanel(props: Partial<ComponentProps<typeof MobileStylePanel>> = {}) {
    const injector = new Injector();
    injector.add([LocaleService]);
    injector.add([ThemeService]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IconManager]);
    injector.add([IFontService, { useClass: FontService }]);
    injector.get(LocaleService).load({ [LocaleType.ZH_CN]: {} });
    const resolvedProps: ComponentProps<typeof MobileStylePanel> = {
        groups: [],
        currentView: null,
        recentColors: [],
        onOpenView: vi.fn(),
        onBack: vi.fn(),
        onExecute: vi.fn(),
        onUseColor: vi.fn(),
        ...props,
    };
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                <MobileStylePanel {...resolvedProps} />
            </RediContext.Provider>
        );
    });

    return {
        container,
        injector,
        root,
        props: resolvedProps,
    };
}

function getButton(container: HTMLElement, name: string): HTMLButtonElement {
    const button = Array.from(container.querySelectorAll('button')).find((element) =>
        element.getAttribute('aria-label') === name || element.textContent?.trim() === name);
    if (!button) throw new Error(`Button "${name}" was not rendered.`);
    return button;
}

function clickButton(container: HTMLElement, name: string): HTMLButtonElement {
    const button = getButton(container, name);
    act(() => button.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    return button;
}

let root: Root | undefined;
let container: HTMLDivElement | undefined;

afterEach(() => {
    act(() => root?.unmount());
    container?.remove();
    root = undefined;
    container = undefined;
});

describe('MobileStylePanel', () => {
    it('keeps BIUS controls independently selected and clickable', () => {
        const commandIds = [
            SetRangeBoldCommand.id,
            SetRangeItalicCommand.id,
            SetRangeUnderlineCommand.id,
            SetRangeStrickThroughCommand.id,
        ];
        const groups: IMenuSchema[] = [{
            key: 'text-style',
            order: 0,
            children: commandIds.map((id) => ({
                key: id,
                order: 0,
                item: {
                    id,
                    type: MenuItemType.BUTTON,
                    title: id,
                    activated$: new BehaviorSubject(true),
                },
            })),
        }];
        const onExecute = vi.fn();
        const rendered = renderStylePanel({ groups, onExecute });
        root = rendered.root;
        container = rendered.container;

        commandIds.forEach((id) => {
            const button = getButton(rendered.container, id);
            expect(button.getAttribute('aria-pressed')).toBe('true');
            clickButton(rendered.container, id);
        });
        expect(onExecute.mock.calls.map(([command]) => command.id)).toEqual(commandIds);
    });

    it('renders the font list and applies the selected family', () => {
        const onExecute = vi.fn();
        const rendered = renderStylePanel({
            currentView: {
                kind: 'options',
                title: 'Font',
                item: {
                    id: SetRangeFontFamilyCommand.id,
                    type: MenuItemType.SELECTOR,
                    selections: [],
                    selectionsCommandId: SetRangeFontFamilyCommand.id,
                    value$: new BehaviorSubject('Arial'),
                },
            },
            onExecute,
        });
        root = rendered.root;
        container = rendered.container;

        expect(getButton(rendered.container, 'Arial').getAttribute('aria-pressed')).toBe('true');
        clickButton(rendered.container, 'Times New Roman');
        expect(onExecute).toHaveBeenCalledWith({
            id: SetRangeFontFamilyCommand.id,
            value: 'Times New Roman',
        });
    });

    it('shows the current font family and size on the style root', () => {
        const onOpenView = vi.fn();
        const groups: IMenuSchema[] = [{
            key: 'font',
            order: 0,
            children: [
                {
                    key: SetRangeFontFamilyCommand.id,
                    order: 0,
                    item: {
                        id: SetRangeFontFamilyCommand.id,
                        type: MenuItemType.SELECTOR,
                        tooltip: 'Font family',
                        selections: [],
                        value$: new BehaviorSubject('Arial'),
                    },
                },
                {
                    key: 'font-size',
                    order: 1,
                    item: {
                        id: 'font-size',
                        type: MenuItemType.SELECTOR,
                        tooltip: 'Font size',
                        selections: [],
                        value$: new BehaviorSubject(10),
                    },
                },
            ],
        }];
        const rendered = renderStylePanel({ groups, onOpenView });
        root = rendered.root;
        container = rendered.container;

        expect(getButton(rendered.container, 'Font family').textContent).toContain('Arial');
        expect(getButton(rendered.container, 'Font size').textContent).toContain('10');
        clickButton(rendered.container, 'Font family');
        expect(onOpenView).toHaveBeenCalledWith(expect.objectContaining({ kind: 'options', title: 'Font family' }));
    });

    it('shows effective alignment defaults and follows value changes', () => {
        const horizontalValue$ = new BehaviorSubject(HorizontalAlign.UNSPECIFIED);
        const verticalValue$ = new BehaviorSubject(VerticalAlign.UNSPECIFIED);
        const groups: IMenuSchema[] = [{
            key: 'alignment',
            order: 0,
            children: [
                {
                    key: 'horizontal',
                    order: 0,
                    item: {
                        id: SetHorizontalTextAlignCommand.id,
                        type: MenuItemType.SELECTOR,
                        selections: [
                            { label: 'Left', value: HorizontalAlign.LEFT },
                            { label: 'Center', value: HorizontalAlign.CENTER },
                            { label: 'Right', value: HorizontalAlign.RIGHT },
                        ],
                        value$: horizontalValue$,
                    },
                },
                {
                    key: 'vertical',
                    order: 1,
                    item: {
                        id: SetVerticalTextAlignCommand.id,
                        type: MenuItemType.SELECTOR,
                        selections: [
                            { label: 'Top', value: VerticalAlign.TOP },
                            { label: 'Middle', value: VerticalAlign.MIDDLE },
                            { label: 'Bottom', value: VerticalAlign.BOTTOM },
                        ],
                        value$: verticalValue$,
                    },
                },
            ],
        }];
        const onExecute = vi.fn();
        groups[0].children!.push({
            key: 'wrap',
            order: 2,
            item: {
                id: SetTextWrapCommand.id,
                type: MenuItemType.SELECTOR,
                selections: [
                    { label: 'Wrap', value: 'wrap' },
                    { label: 'Overflow', value: 'overflow' },
                    { label: 'Clip', value: 'clip' },
                ],
                value$: new BehaviorSubject('wrap'),
            },
        });
        const rendered = renderStylePanel({ groups, onExecute });
        root = rendered.root;
        container = rendered.container;

        expect(getButton(rendered.container, 'Left').getAttribute('aria-pressed')).toBe('true');
        expect(getButton(rendered.container, 'Bottom').getAttribute('aria-pressed')).toBe('true');

        act(() => {
            horizontalValue$.next(HorizontalAlign.CENTER);
            verticalValue$.next(VerticalAlign.MIDDLE);
        });

        expect(getButton(rendered.container, 'Left').getAttribute('aria-pressed')).toBe('false');
        expect(getButton(rendered.container, 'Center').getAttribute('aria-pressed')).toBe('true');
        expect(getButton(rendered.container, 'Bottom').getAttribute('aria-pressed')).toBe('false');
        expect(getButton(rendered.container, 'Middle').getAttribute('aria-pressed')).toBe('true');

        const commands = [
            ['Left', SetHorizontalTextAlignCommand.id, HorizontalAlign.LEFT],
            ['Center', SetHorizontalTextAlignCommand.id, HorizontalAlign.CENTER],
            ['Right', SetHorizontalTextAlignCommand.id, HorizontalAlign.RIGHT],
            ['Top', SetVerticalTextAlignCommand.id, VerticalAlign.TOP],
            ['Middle', SetVerticalTextAlignCommand.id, VerticalAlign.MIDDLE],
            ['Bottom', SetVerticalTextAlignCommand.id, VerticalAlign.BOTTOM],
            ['Wrap', SetTextWrapCommand.id, 'wrap'],
            ['Overflow', SetTextWrapCommand.id, 'overflow'],
            ['Clip', SetTextWrapCommand.id, 'clip'],
        ] as const;
        commands.forEach(([label]) => clickButton(rendered.container, label));
        expect(onExecute.mock.calls.map(([command]) => command)).toEqual(commands.map(([, id, value]) => ({ id, value })));
    });

    it('supports reset, preset selection, and custom-color navigation', () => {
        const onExecute = vi.fn();
        const onOpenView = vi.fn();
        const onUseColor = vi.fn();
        const rendered = renderStylePanel({
            currentView: {
                kind: 'color',
                target: 'text',
                title: 'Text color',
                item: {
                    id: SetRangeTextColorCommand.id,
                    type: MenuItemType.BUTTON,
                    value$: new BehaviorSubject('#000000'),
                },
            },
            onExecute,
            onOpenView,
            onUseColor,
        });
        root = rendered.root;
        container = rendered.container;

        clickButton(rendered.container, 'sheets-ui.toolbar.resetColor');
        expect(onExecute).toHaveBeenCalledWith({ id: ResetRangeTextColorCommand.id });

        clickButton(rendered.container, '#3F83F8');
        expect(onExecute).toHaveBeenCalledWith({ id: SetRangeTextColorCommand.id, value: '#3F83F8' });
        expect(onUseColor).toHaveBeenCalledWith('#3F83F8');

        clickButton(rendered.container, 'sheets-ui.mobile.customColor');
        expect(onOpenView).toHaveBeenCalledWith(expect.objectContaining({
            kind: 'custom-color',
            target: 'text',
            value: '#3F83F8',
        }));
    });

    it('lays out rotation, merge, and number-format controls for mobile', () => {
        const onExecute = vi.fn();
        const onOpenView = vi.fn();
        const numfmtConfig = {
            kind: 'number-format' as const,
            title: 'Number format',
            commandId: 'set-pattern',
            detailTitle: 'More formats',
            customTitle: 'Custom format',
            quickOptions: [
                { label: 'Percent', commandId: 'percent' },
                { label: 'Currency', commandId: 'currency' },
                { label: 'Date', commandId: 'set-pattern', value: 'yyyy-mm-dd' },
                { label: 'Text', commandId: 'set-pattern', value: '@' },
            ],
            decimalOptions: [
                { label: 'Decrease decimal', commandId: 'subtract-decimal' },
                { label: 'Increase decimal', commandId: 'add-decimal' },
            ],
            detailOptions: [{ label: 'General', value: null }, { label: 'Custom format', custom: true }],
            customPatterns: ['0.00'],
        };
        const mergeChildren: Array<[string, string]> = [
            [AddWorksheetMergeAllCommand.id, 'Merge all'],
            [AddWorksheetMergeVerticalCommand.id, 'Merge vertical'],
            [AddWorksheetMergeHorizontalCommand.id, 'Merge horizontal'],
            [RemoveWorksheetMergeCommand.id, 'Unmerge'],
        ];
        const numberFormatItem: MobileNumberFormatItem = {
            id: 'more-format',
            type: MenuItemType.SELECTOR,
            selections: [],
            value$: new BehaviorSubject('General'),
            mobileStyle: numfmtConfig,
        };
        const groups: IMenuSchema[] = [{
            key: 'layout',
            order: 0,
            children: [
                {
                    key: SetShrinkToFitCommand.id,
                    order: 0,
                    item: { id: SetShrinkToFitCommand.id, type: MenuItemType.BUTTON, title: 'Shrink to fit' },
                },
                {
                    key: SetTextRotationCommand.id,
                    order: 1,
                    item: {
                        id: SetTextRotationCommand.id,
                        type: MenuItemType.SELECTOR,
                        title: 'Text rotation',
                        tooltip: 'Text rotation',
                        selections: [{ label: 'No rotation', value: 0 }],
                        value$: new BehaviorSubject(0),
                    },
                },
                {
                    key: AddWorksheetMergeCommand.id,
                    order: 2,
                    item: { id: AddWorksheetMergeCommand.id, type: MenuItemType.SUBITEMS, tooltip: 'Merge cells' },
                    children: mergeChildren.map(([id, title]) => ({
                        key: id,
                        order: 0,
                        item: { id, type: MenuItemType.BUTTON, title },
                    })),
                },
            ],
        }, {
            key: 'number',
            order: 1,
            children: [
                {
                    key: 'more-format',
                    order: 0,
                    item: numberFormatItem,
                },
                ...['percent', 'currency', 'subtract-decimal', 'add-decimal'].map((id) => ({
                    key: id,
                    order: 1,
                    item: { id, type: MenuItemType.BUTTON, title: id },
                })),
            ],
        }];
        const rendered = renderStylePanel({ groups, onExecute, onOpenView });
        root = rendered.root;
        container = rendered.container;

        expect(rendered.container.textContent).not.toContain('Shrink to fit');
        expect(getButton(rendered.container, 'Text rotation').textContent).toContain('No rotation');
        mergeChildren.forEach(([, title]) => expect(getButton(rendered.container, title)).toBeTruthy());
        ['Percent', 'Currency', 'Date', 'Text', 'Decrease decimal', 'Increase decimal', 'More formats']
            .forEach((title) => expect(getButton(rendered.container, title)).toBeTruthy());

        const expectedCommands: Array<[string, { id: string; value?: string }]> = [
            ['Percent', { id: 'percent' }],
            ['Currency', { id: 'currency' }],
            ['Date', { id: 'set-pattern', value: 'yyyy-mm-dd' }],
            ['Text', { id: 'set-pattern', value: '@' }],
            ['Decrease decimal', { id: 'subtract-decimal' }],
            ['Increase decimal', { id: 'add-decimal' }],
            ...mergeChildren.map(([id, title]): [string, { id: string }] => [title, { id }]),
        ];
        expectedCommands.forEach(([label]) => clickButton(rendered.container, label));
        expect(onExecute.mock.calls.map(([command]) => command)).toEqual(expectedCommands.map(([, command]) => command));
        clickButton(rendered.container, 'More formats');
        expect(onOpenView).toHaveBeenCalledWith(expect.objectContaining({ kind: 'number-format' }));
    });

    it('executes every border placement, border style, and border color control', () => {
        const onExecute = vi.fn();
        const onOpenView = vi.fn();
        const onUseColor = vi.fn();
        const item: IDisplayMenuItem<IMenuItem> = {
            id: SetBorderBasicCommand.id,
            type: MenuItemType.BUTTON,
        };
        let rendered = renderStylePanel({
            currentView: { kind: 'border', title: 'Border', item },
            onExecute,
            onOpenView,
        });
        root = rendered.root;
        container = rendered.container;
        const borderValue = {
            type: BorderType.ALL,
            color: rendered.injector.get(ThemeService).getColorFromTheme('gray.900'),
            style: BorderStyleTypes.THIN,
            activeBorderType: false,
        };

        BORDER_LINE_CHILDREN.forEach((option) => clickButton(rendered.container, option.label));
        expect(onExecute.mock.calls.map(([command]) => command)).toEqual(BORDER_LINE_CHILDREN.map((option) => ({
            id: SetBorderBasicCommand.id,
            value: { ...borderValue, type: option.value },
        })));
        clickButton(rendered.container, 'sheets-ui.mobile.borderColor');
        clickButton(rendered.container, 'sheets-ui.mobile.borderStyle');
        expect(onOpenView).toHaveBeenCalledWith(expect.objectContaining({ kind: 'border-color' }));
        expect(onOpenView).toHaveBeenCalledWith(expect.objectContaining({ kind: 'border-style' }));

        act(() => root?.unmount());
        rendered.container.remove();
        onExecute.mockClear();
        rendered = renderStylePanel({ currentView: { kind: 'border-style', title: 'Border style', item }, onExecute });
        root = rendered.root;
        container = rendered.container;
        BORDER_SIZE_CHILDREN.forEach((option) => clickButton(rendered.container, String(option.value)));
        expect(onExecute.mock.calls.map(([command]) => command)).toEqual(BORDER_SIZE_CHILDREN.map((option) => ({
            id: SetBorderBasicCommand.id,
            value: { ...borderValue, style: option.value },
        })));

        act(() => root?.unmount());
        rendered.container.remove();
        onExecute.mockClear();
        rendered = renderStylePanel({
            currentView: { kind: 'border-color', title: 'Border color', item },
            onExecute,
            onOpenView,
            onUseColor,
        });
        root = rendered.root;
        container = rendered.container;
        clickButton(rendered.container, 'sheets-ui.toolbar.resetColor');
        clickButton(rendered.container, '#3F83F8');
        clickButton(rendered.container, 'sheets-ui.mobile.customColor');
        expect(onExecute).toHaveBeenNthCalledWith(1, {
            id: SetBorderBasicCommand.id,
            value: borderValue,
        });
        expect(onExecute).toHaveBeenNthCalledWith(2, {
            id: SetBorderBasicCommand.id,
            value: { ...borderValue, color: '#3F83F8' },
        });
        expect(onUseColor).toHaveBeenCalledWith('#3F83F8');
        expect(onOpenView).toHaveBeenCalledWith(expect.objectContaining({ kind: 'custom-color', target: 'border' }));
    });

    it('executes background color reset and preset controls', () => {
        const onExecute = vi.fn();
        const rendered = renderStylePanel({
            currentView: {
                kind: 'color',
                target: 'background',
                title: 'Background color',
                item: {
                    id: SetBackgroundColorCommand.id,
                    type: MenuItemType.BUTTON,
                    value$: new BehaviorSubject('#FFFFFF'),
                },
            },
            onExecute,
        });
        root = rendered.root;
        container = rendered.container;

        clickButton(rendered.container, 'sheets-ui.toolbar.resetColor');
        clickButton(rendered.container, '#3F83F8');
        expect(onExecute.mock.calls.map(([command]) => command)).toEqual([
            { id: ResetBackgroundColorCommand.id },
            { id: SetBackgroundColorCommand.id, value: '#3F83F8' },
        ]);
    });

    it('renders detailed number formats and keeps custom format in a third-level view', () => {
        const onExecute = vi.fn();
        const onOpenView = vi.fn();
        const config = {
            kind: 'number-format' as const,
            title: 'Number format',
            commandId: 'set-pattern',
            detailTitle: 'More formats',
            customTitle: 'Custom format',
            quickOptions: [],
            decimalOptions: [],
            detailOptions: [
                { label: 'General', value: null },
                { divider: true },
                { label: 'Date', value: 'yyyy-mm-dd' },
                { label: 'Custom format', custom: true },
            ],
            customPatterns: ['0.00', 'yyyy-mm-dd'],
        };
        const item: MobileNumberFormatItem = {
            id: 'more-format',
            type: MenuItemType.SELECTOR,
            selections: [],
            value$: new BehaviorSubject('Date'),
            mobileStyle: config,
        };
        const rendered = renderStylePanel({
            currentView: { kind: 'number-format', title: 'More formats', item, config },
            onExecute,
            onOpenView,
        });
        root = rendered.root;
        container = rendered.container;

        expect(getButton(rendered.container, 'Date').getAttribute('aria-pressed')).toBe('true');
        clickButton(rendered.container, 'General');
        expect(onExecute).toHaveBeenCalledWith({ id: 'set-pattern', value: null });
        clickButton(rendered.container, 'Custom format');
        expect(onOpenView).toHaveBeenCalledWith(expect.objectContaining({ kind: 'custom-number-format' }));
    });

    it('applies a custom number format from the third-level view', () => {
        const onExecute = vi.fn();
        const onBack = vi.fn();
        const config = {
            kind: 'number-format' as const,
            title: 'Number format',
            commandId: 'set-pattern',
            detailTitle: 'More formats',
            customTitle: 'Custom format',
            quickOptions: [],
            decimalOptions: [],
            detailOptions: [],
            customPatterns: ['0.00', 'yyyy-mm-dd'],
        };
        const item: MobileNumberFormatItem = { id: 'more-format', type: MenuItemType.SELECTOR, selections: [] };
        const rendered = renderStylePanel({
            currentView: { kind: 'custom-number-format', title: 'Custom format', item, config },
            onExecute,
            onBack,
        });
        root = rendered.root;
        container = rendered.container;

        clickButton(rendered.container, '0.00');
        clickButton(rendered.container, 'sheets-ui.mobile.confirm');
        expect(onExecute).toHaveBeenCalledWith({ id: 'set-pattern', value: '0.00' });
        expect(onBack).toHaveBeenCalledOnce();
    });
});
