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

import type { IBorderInfo } from '@univerjs/sheets';
import type { IDisplayMenuItem, IFontConfig, IMenuItem, IMenuSchema, IMenuSelectorItem, IValueOption, MenuItemDefaultValueType } from '@univerjs/ui';
import type { ReactNode } from 'react';
import type { LocaleKey } from '../../../locale/types';
import { BorderStyleTypes, BorderType, LocaleService, ThemeService } from '@univerjs/core';
import { borderBottomClassName, clsx, ColorPickerPanel, ColorPresets, resetButtonClassName } from '@univerjs/design';
import { CheckMarkIcon, MoreRightIcon, NoColorDoubleIcon } from '@univerjs/icons';
import {
    AddWorksheetMergeCommand,
    ResetBackgroundColorCommand,
    SetBackgroundColorCommand,
    SetBorderBasicCommand,
    SetHorizontalTextAlignCommand,
    SetShrinkToFitCommand,
    SetTextRotationCommand,
    SetTextWrapCommand,
    SetVerticalTextAlignCommand,
} from '@univerjs/sheets';
import {
    IconManager,
    IFontService,
    MenuItemType,
    ToolbarItem,
    useDependency,
    useObservable,
    useToolbarItemStatus,
} from '@univerjs/ui';
import { useMemo, useState } from 'react';
import { isObservable } from 'rxjs';
import {
    ResetRangeTextColorCommand,
    SetRangeBoldCommand,
    SetRangeFontFamilyCommand,
    SetRangeItalicCommand,
    SetRangeStrickThroughCommand,
    SetRangeTextColorCommand,
    SetRangeUnderlineCommand,
} from '../../../commands/commands/inline-format.command';
import { BorderLine } from '../../border-panel/border-line/BorderLine';
import { BORDER_LINE_CHILDREN, BORDER_SIZE_CHILDREN } from '../../border-panel/interface';

type ColorTarget = 'text' | 'background' | 'border';

const TEXT_STYLE_COMMANDS = new Set([
    SetRangeBoldCommand.id,
    SetRangeItalicCommand.id,
    SetRangeUnderlineCommand.id,
    SetRangeStrickThroughCommand.id,
]);
const INLINE_SELECTOR_COMMANDS = new Set([
    SetHorizontalTextAlignCommand.id,
    SetVerticalTextAlignCommand.id,
    SetTextWrapCommand.id,
]);
const NAVIGATION_STYLE_COMMANDS = new Set([
    SetBorderBasicCommand.id,
    SetRangeTextColorCommand.id,
    SetBackgroundColorCommand.id,
]);
const SPECIAL_MOBILE_STYLE_COMMANDS = new Set([
    SetShrinkToFitCommand.id,
    SetTextRotationCommand.id,
    AddWorksheetMergeCommand.id,
]);
const BORDER_TYPES = new Set<unknown>(Object.values(BorderType));

interface IMobileNumberFormatOption {
    label?: string;
    commandId?: string;
    value?: string | null;
    divider?: boolean;
    custom?: boolean;
}

interface IMobileNumberFormatMenuConfig {
    kind: 'number-format';
    title: string;
    commandId: string;
    detailTitle: string;
    customTitle: string;
    quickOptions: IMobileNumberFormatOption[];
    decimalOptions: IMobileNumberFormatOption[];
    detailOptions: IMobileNumberFormatOption[];
    customPatterns: string[];
}

export type MobileNumberFormatItem = IDisplayMenuItem<IMenuSelectorItem<string, MenuItemDefaultValueType, unknown>> & {
    mobileStyle?: IMobileNumberFormatMenuConfig;
};

type ConfiguredMobileNumberFormatItem = MobileNumberFormatItem & {
    mobileStyle: IMobileNumberFormatMenuConfig;
};

type MenuSchemaWithItem = IMenuSchema & {
    item: IMenuItem;
};

type SelectorMenuSchema = IMenuSchema & {
    item: IDisplayMenuItem<IMenuSelectorItem<string, MenuItemDefaultValueType, unknown>>;
};

export interface IMobileStyleCommand {
    id: string;
    value?: unknown;
}

export type MobileStyleView =
    | {
        kind: 'options';
        title: string;
        item: IDisplayMenuItem<IMenuSelectorItem<string, MenuItemDefaultValueType, unknown>>;
    }
    | {
        kind: 'color';
        target: Exclude<ColorTarget, 'border'>;
        title: string;
        item: IDisplayMenuItem<IMenuItem>;
    }
    | {
        kind: 'custom-color';
        target: ColorTarget;
        title: string;
        value?: string;
        borderValue?: IBorderInfo;
        item: IDisplayMenuItem<IMenuItem>;
    }
    | {
        kind: 'border';
        title: string;
        item: IDisplayMenuItem<IMenuItem>;
    }
    | {
        kind: 'border-color';
        title: string;
        item: IDisplayMenuItem<IMenuItem>;
    }
    | {
        kind: 'border-style';
        title: string;
        item: IDisplayMenuItem<IMenuItem>;
    }
    | {
        kind: 'number-format';
        title: string;
        item: MobileNumberFormatItem;
        config: IMobileNumberFormatMenuConfig;
    }
    | {
        kind: 'custom-number-format';
        title: string;
        item: MobileNumberFormatItem;
        config: IMobileNumberFormatMenuConfig;
    };

export function MobileStylePanel(props: {
    groups: IMenuSchema[];
    currentView: MobileStyleView | null;
    recentColors: string[];
    onOpenView: (view: MobileStyleView) => void;
    onBack: () => void;
    onExecute: (params: IMobileStyleCommand) => void;
    onUseColor: (color: string) => void;
}) {
    const { groups, currentView, recentColors, onOpenView, onBack, onExecute, onUseColor } = props;
    const localeService = useDependency(LocaleService);
    const themeService = useDependency(ThemeService);
    const borderView = currentView?.kind === 'border' || currentView?.kind === 'border-color' || currentView?.kind === 'border-style'
        ? currentView
        : null;
    const currentValue = useObservable<unknown>(borderView?.item.value$, undefined);
    const currentBorderInfo = isBorderInfo(currentValue) ? currentValue : undefined;
    const customColorTitle = localeService.t<LocaleKey>('sheets-ui.mobile.customColor');

    if (!currentView) {
        return <MobileStyleRoot groups={groups} onOpenView={onOpenView} onExecute={onExecute} />;
    }

    if (currentView.kind === 'custom-color') {
        return (
            <ColorPickerPanel
                value={currentView.value}
                confirmText={localeService.t<LocaleKey>('sheets-ui.mobile.applyColor')}
                onConfirm={(color) => {
                    executeColor(currentView.target, color, onExecute, currentView.borderValue);
                    onUseColor(color);
                    onBack();
                }}
            />
        );
    }

    if (currentView.kind === 'color') {
        return (
            <MobileColorView
                target={currentView.target}
                item={currentView.item}
                recentColors={recentColors}
                customColorTitle={customColorTitle}
                onOpenView={onOpenView}
                onExecute={onExecute}
                onUseColor={onUseColor}
            />
        );
    }

    if (currentView.kind === 'options') {
        return <MobileStyleOptionsView item={currentView.item} onExecute={onExecute} />;
    }

    if (currentView.kind === 'number-format') {
        return (
            <MobileNumberFormatDetails
                item={currentView.item}
                config={currentView.config}
                onOpenView={onOpenView}
                onExecute={onExecute}
            />
        );
    }

    if (currentView.kind === 'custom-number-format') {
        return <MobileCustomNumberFormat config={currentView.config} onBack={onBack} onExecute={onExecute} />;
    }

    const value: IBorderInfo = currentBorderInfo ?? {
        type: BorderType.ALL,
        color: themeService.getColorFromTheme('gray.900'),
        style: BorderStyleTypes.THIN,
        activeBorderType: false,
    };

    if (currentView.kind === 'border-color') {
        return (
            <MobileBorderColorView
                item={currentView.item}
                value={value}
                recentColors={recentColors}
                defaultColor={themeService.getColorFromTheme('gray.900')}
                customColorTitle={customColorTitle}
                onOpenView={onOpenView}
                onExecute={onExecute}
                onUseColor={onUseColor}
            />
        );
    }

    if (currentView.kind === 'border-style') {
        return <MobileBorderStyleView value={value} onExecute={onExecute} />;
    }

    return (
        <MobileBorderView
            item={currentView.item}
            value={value}
            borderColorTitle={localeService.t<LocaleKey>('sheets-ui.mobile.borderColor')}
            borderStyleTitle={localeService.t<LocaleKey>('sheets-ui.mobile.borderStyle')}
            onOpenView={onOpenView}
            onExecute={onExecute}
        />
    );
}

function MobileStyleRoot(props: {
    groups: IMenuSchema[];
    onOpenView: (view: MobileStyleView) => void;
    onExecute: (params: IMobileStyleCommand) => void;
}) {
    const { groups, onOpenView, onExecute } = props;
    const localeService = useDependency(LocaleService);

    return (
        <div className="univer-grid univer-gap-3">
            {groups.map((group) => {
                const items = group.children?.filter(hasMenuItem) ?? [];
                if (items.length === 0) return null;
                const textStyleItems = items.filter((schema) => TEXT_STYLE_COMMANDS.has(schema.item.id));
                const inlineSelectorItems = items
                    .filter(isMobileSelectorSchema)
                    .filter((schema) => INLINE_SELECTOR_COMMANDS.has(schema.item.id));
                const navigationItems = items.filter((schema) => NAVIGATION_STYLE_COMMANDS.has(schema.item.id));
                const rotationSchema = items.find((schema): schema is SelectorMenuSchema =>
                    schema.item.id === SetTextRotationCommand.id && isMobileSelectorItem(schema.item));
                const mergeSchema = items.find((schema) => schema.item.id === AddWorksheetMergeCommand.id);
                const numberFormatSchema = items.find(isMobileNumberFormatSchema);
                const numberFormatConfig = numberFormatSchema?.item.mobileStyle;
                const numberFormatCommandIds = new Set([
                    ...(numberFormatConfig?.quickOptions ?? []),
                    ...(numberFormatConfig?.decimalOptions ?? []),
                ].map((option) => option.commandId));
                const gridItems = items.filter((schema) =>
                    !TEXT_STYLE_COMMANDS.has(schema.item.id) &&
                    !INLINE_SELECTOR_COMMANDS.has(schema.item.id) &&
                    !NAVIGATION_STYLE_COMMANDS.has(schema.item.id) &&
                    !SPECIAL_MOBILE_STYLE_COMMANDS.has(schema.item.id) &&
                    !numberFormatCommandIds.has(schema.item.id) &&
                    schema !== numberFormatSchema
                );

                return (
                    <section key={group.key} className="univer-grid univer-gap-2">
                        {group.title && (
                            <div
                                className="
                                  univer-px-1 univer-text-xs univer-font-medium univer-text-gray-500
                                  dark:!univer-text-gray-400
                                "
                            >
                                {localeService.t(group.title)}
                            </div>
                        )}
                        {textStyleItems.length > 0 && (
                            <div
                                className="
                                  univer-grid univer-grid-cols-4 univer-divide-x univer-divide-gray-100
                                  univer-overflow-hidden univer-rounded-xl univer-bg-gray-0
                                  dark:univer-divide-gray-700 dark:!univer-bg-gray-800
                                "
                            >
                                {textStyleItems.map((schema) => (
                                    <MobileTextStyleItem key={schema.key} schema={schema} onExecute={onExecute} />
                                ))}
                            </div>
                        )}
                        {inlineSelectorItems.map((schema) => (
                            <MobileInlineSelector key={schema.key} schema={schema} onExecute={onExecute} />
                        ))}
                        {rotationSchema && (
                            <MobileRotationNavigation schema={rotationSchema} onOpenView={onOpenView} />
                        )}
                        {mergeSchema && (
                            <MobileMergeGroup schema={mergeSchema} onExecute={onExecute} />
                        )}
                        {numberFormatSchema && (
                            <MobileNumberFormatGroup
                                schemas={items}
                                schema={numberFormatSchema}
                                onOpenView={onOpenView}
                                onExecute={onExecute}
                            />
                        )}
                        {gridItems.length > 0 && (
                            <div
                                className="
                                  univer-grid univer-grid-cols-4 univer-gap-1.5 univer-overflow-hidden univer-rounded-xl
                                  univer-bg-gray-0 univer-p-2
                                  dark:!univer-bg-gray-800
                                "
                            >
                                {gridItems.map((schema) => (
                                    <MobileStyleRootItem key={schema.key} schema={schema} onOpenView={onOpenView} />
                                ))}
                            </div>
                        )}
                        {navigationItems.length > 0 && (
                            <div
                                className="
                                  univer-overflow-hidden univer-rounded-xl univer-bg-gray-0
                                  dark:!univer-bg-gray-800
                                "
                            >
                                {navigationItems.map((schema, index) => (
                                    <MobileStyleNavigationItem
                                        key={schema.key}
                                        schema={schema}
                                        bordered={index !== navigationItems.length - 1}
                                        onOpenView={onOpenView}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                );
            })}
        </div>
    );
}

function MobileRotationNavigation(props: {
    schema: SelectorMenuSchema;
    onOpenView: (view: MobileStyleView) => void;
}) {
    const { schema, onOpenView } = props;
    const item = schema.item;
    const localeService = useDependency(LocaleService);
    const status = useToolbarItemStatus(item);
    const selections = Array.isArray(item.selections) ? item.selections : [];
    const selected = selections.find((option) => option.value === status.value);
    const titleKey = item.title ?? item.tooltip;
    const title = typeof titleKey === 'string' ? localeService.t(titleKey) : schema.key;
    const value = selected ? getOptionLabel(localeService, selected) : undefined;

    if (status.hidden) return null;

    return (
        <div
            className="
              univer-overflow-hidden univer-rounded-xl univer-bg-gray-0
              dark:!univer-bg-gray-800
            "
        >
            <MobileActionRow
                title={title}
                value={value}
                valueType="text"
                trailing={<MoreRightIcon />}
                onClick={() => onOpenView({ kind: 'options', title, item })}
            />
        </div>
    );
}

function MobileMergeGroup(props: {
    schema: MenuSchemaWithItem;
    onExecute: (params: IMobileStyleCommand) => void;
}) {
    const { schema, onExecute } = props;
    const item = schema.item;
    const localeService = useDependency(LocaleService);
    const status = useToolbarItemStatus(item);
    const titleKey = item.title ?? item.tooltip;
    const title = typeof titleKey === 'string' ? localeService.t(titleKey) : schema.key;
    const children = schema.children?.filter(hasMenuItem) ?? [];

    if (status.hidden || children.length === 0) return null;

    return (
        <section className="univer-grid univer-gap-2">
            <div
                className="
                  univer-px-1 univer-text-xs univer-font-medium univer-text-gray-500
                  dark:!univer-text-gray-400
                "
            >
                {title}
            </div>
            <div
                className="
                  univer-grid univer-grid-cols-4 univer-divide-x univer-divide-gray-100 univer-overflow-hidden
                  univer-rounded-xl univer-bg-gray-0
                  dark:univer-divide-gray-700 dark:!univer-bg-gray-800
                "
            >
                {children.map((child) => (
                    <MobileMergeOption key={child.key} schema={child} parentDisabled={status.disabled} onExecute={onExecute} />
                ))}
            </div>
        </section>
    );
}

function MobileMergeOption(props: {
    schema: MenuSchemaWithItem;
    parentDisabled: boolean;
    onExecute: (params: IMobileStyleCommand) => void;
}) {
    const { schema, parentDisabled, onExecute } = props;
    const item = schema.item;
    const localeService = useDependency(LocaleService);
    const status = useToolbarItemStatus(item);
    const titleKey = item.title ?? item.tooltip;
    const title = typeof titleKey === 'string' ? localeService.t(titleKey) : schema.key;

    if (status.hidden) return null;

    return (
        <button
            type="button"
            aria-label={title}
            disabled={parentDisabled || status.disabled}
            className={clsx(resetButtonClassName, `
              univer-flex univer-min-h-12 univer-items-center univer-justify-center univer-px-1.5 univer-text-center
              univer-text-sm univer-text-gray-900
              active:univer-bg-gray-100
              disabled:univer-opacity-40
              dark:!univer-text-gray-100
              dark:active:!univer-bg-gray-700
            `)}
            onClick={() => onExecute({ id: item.commandId ?? item.id })}
        >
            {title}
        </button>
    );
}

function MobileNumberFormatGroup(props: {
    schemas: IMenuSchema[];
    schema: MenuSchemaWithItem & { item: ConfiguredMobileNumberFormatItem };
    onOpenView: (view: MobileStyleView) => void;
    onExecute: (params: IMobileStyleCommand) => void;
}) {
    const { schemas, schema, onOpenView, onExecute } = props;
    const item = schema.item;
    const config = item.mobileStyle;
    const localeService = useDependency(LocaleService);
    const status = useToolbarItemStatus(item);

    if (status.hidden) return null;

    return (
        <section className="univer-grid univer-gap-2">
            <div
                className="
                  univer-px-1 univer-text-xs univer-font-medium univer-text-gray-500
                  dark:!univer-text-gray-400
                "
            >
                {localeService.t(config.title)}
            </div>
            <MobileNumberFormatTabs
                options={config.quickOptions}
                schemas={schemas}
                parentItem={item}
                currentValue={status.value}
                onExecute={onExecute}
            />
            <MobileNumberFormatTabs
                options={config.decimalOptions}
                schemas={schemas}
                parentItem={item}
                currentValue={status.value}
                onExecute={onExecute}
            />
            <div
                className="
                  univer-overflow-hidden univer-rounded-xl univer-bg-gray-0
                  dark:!univer-bg-gray-800
                "
            >
                <MobileActionRow
                    title={localeService.t(config.detailTitle)}
                    value={typeof status.value === 'string' ? status.value : undefined}
                    valueType="text"
                    trailing={<MoreRightIcon />}
                    onClick={() => onOpenView({
                        kind: 'number-format',
                        title: localeService.t(config.detailTitle),
                        item,
                        config,
                    })}
                />
            </div>
        </section>
    );
}

function MobileNumberFormatTabs(props: {
    options: IMobileNumberFormatOption[];
    schemas: IMenuSchema[];
    parentItem: MobileNumberFormatItem;
    currentValue: unknown;
    onExecute: (params: IMobileStyleCommand) => void;
}) {
    const { options, schemas, parentItem, currentValue, onExecute } = props;

    return (
        <div
            className="
              univer-grid univer-divide-x univer-divide-gray-100 univer-overflow-hidden univer-rounded-xl
              univer-bg-gray-0
              dark:univer-divide-gray-700 dark:!univer-bg-gray-800
            "
            style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
        >
            {options.map((option) => {
                const schema = schemas.find((candidate) => candidate.item?.id === option.commandId);
                return (
                    <MobileNumberFormatTab
                        key={`${option.commandId}-${option.label}`}
                        option={option}
                        statusItem={schema?.item ?? parentItem}
                        currentValue={currentValue}
                        onExecute={onExecute}
                    />
                );
            })}
        </div>
    );
}

function MobileNumberFormatTab(props: {
    option: IMobileNumberFormatOption;
    statusItem: IDisplayMenuItem<IMenuItem>;
    currentValue: unknown;
    onExecute: (params: IMobileStyleCommand) => void;
}) {
    const { option, statusItem, currentValue, onExecute } = props;
    const localeService = useDependency(LocaleService);
    const status = useToolbarItemStatus(statusItem);
    const title = option.label ? localeService.t(option.label) : '';
    const selected = title === currentValue;

    if (status.hidden) return null;

    return (
        <button
            type="button"
            aria-label={title}
            aria-pressed={selected}
            disabled={status.disabled}
            className={clsx(resetButtonClassName, `
              univer-flex univer-min-h-12 univer-items-center univer-justify-center univer-px-2 univer-text-sm
              univer-text-gray-900
              active:univer-bg-gray-100
              disabled:univer-opacity-40
              dark:!univer-text-gray-100
              dark:active:!univer-bg-gray-700
            `, {
                'univer-bg-primary-50 univer-text-primary-600 dark:!univer-bg-primary-900 dark:!univer-text-primary-300': selected,
            })}
            onClick={() => onExecute(typeof option.value === 'undefined'
                ? { id: option.commandId! }
                : { id: option.commandId!, value: option.value })}
        >
            {title}
        </button>
    );
}

function MobileNumberFormatDetails(props: {
    item: MobileNumberFormatItem;
    config: IMobileNumberFormatMenuConfig;
    onOpenView: (view: MobileStyleView) => void;
    onExecute: (params: IMobileStyleCommand) => void;
}) {
    const { item, config, onOpenView, onExecute } = props;
    const localeService = useDependency(LocaleService);
    const status = useToolbarItemStatus(item);

    return (
        <div
            className="
              univer-overflow-hidden univer-rounded-xl univer-bg-gray-0
              dark:!univer-bg-gray-800
            "
        >
            {config.detailOptions.map((option, index) => {
                if (option.divider) {
                    return (
                        <div
                            key={`divider-${config.detailOptions[index - 1]?.label}-${config.detailOptions[index + 1]?.label}`}
                            className="
                              univer-h-2 univer-bg-gray-50
                              dark:!univer-bg-gray-900
                            "
                        />
                    );
                }

                const title = option.label ? localeService.t(option.label) : '';
                const selected = title === status.value;
                return (
                    <button
                        key={option.label ?? String(option.value)}
                        type="button"
                        aria-label={title}
                        aria-pressed={selected}
                        disabled={status.disabled}
                        className={clsx(resetButtonClassName, `
                          univer-flex univer-min-h-12 univer-w-full univer-items-center univer-gap-3 univer-px-4
                          univer-text-left univer-text-gray-900
                          active:univer-bg-gray-100
                          disabled:univer-opacity-40
                          dark:!univer-text-gray-100
                          dark:active:!univer-bg-gray-700
                        `, index !== config.detailOptions.length - 1 && borderBottomClassName)}
                        onClick={() => option.custom
                            ? onOpenView({
                                kind: 'custom-number-format',
                                title: localeService.t(config.customTitle),
                                item,
                                config,
                            })
                            : onExecute({ id: config.commandId, value: option.value })}
                    >
                        <span className="univer-flex-1 univer-text-sm">{title}</span>
                        {option.custom
                            ? <MoreRightIcon className="univer-size-5 univer-text-gray-500" />
                            : selected && <CheckMarkIcon className="univer-text-primary-600" />}
                    </button>
                );
            })}
        </div>
    );
}

function MobileCustomNumberFormat(props: {
    config: IMobileNumberFormatMenuConfig;
    onBack: () => void;
    onExecute: (params: IMobileStyleCommand) => void;
}) {
    const { config, onBack, onExecute } = props;
    const localeService = useDependency(LocaleService);
    const [pattern, setPattern] = useState('');
    const title = localeService.t(config.customTitle);

    return (
        <div className="univer-grid univer-gap-3">
            <div className="univer-grid univer-gap-2">
                <label
                    className="
                      univer-px-1 univer-text-xs univer-font-medium univer-text-gray-500
                      dark:!univer-text-gray-400
                    "
                >
                    {title}
                </label>
                <input
                    aria-label={title}
                    value={pattern}
                    placeholder={title}
                    className="
                      univer-h-11 univer-w-full univer-rounded-xl univer-border univer-border-solid
                      univer-border-gray-200 univer-bg-gray-0 univer-px-3 univer-text-sm univer-text-gray-900
                      univer-outline-none
                      focus:univer-border-primary-500
                      dark:!univer-border-gray-700 dark:!univer-bg-gray-800 dark:!univer-text-gray-100
                    "
                    onChange={(event) => setPattern(event.target.value)}
                />
            </div>
            <div
                className="
                  univer-overflow-hidden univer-rounded-xl univer-bg-gray-0
                  dark:!univer-bg-gray-800
                "
            >
                {config.customPatterns.map((item, index) => (
                    <button
                        key={item}
                        type="button"
                        aria-label={item}
                        aria-pressed={pattern === item}
                        className={clsx(resetButtonClassName, `
                          univer-flex univer-min-h-11 univer-w-full univer-items-center univer-gap-3 univer-px-4
                          univer-text-left univer-text-gray-900
                          active:univer-bg-gray-100
                          dark:!univer-text-gray-100
                          dark:active:!univer-bg-gray-700
                        `, index !== config.customPatterns.length - 1 && borderBottomClassName)}
                        onClick={() => setPattern(item)}
                    >
                        <span className="univer-min-w-0 univer-flex-1 univer-truncate univer-font-mono univer-text-xs">
                            {item}
                        </span>
                        {pattern === item && <CheckMarkIcon className="univer-shrink-0 univer-text-primary-600" />}
                    </button>
                ))}
            </div>
            <button
                type="button"
                disabled={!pattern.trim()}
                className={clsx(resetButtonClassName, `
                  univer-min-h-11 univer-w-full univer-rounded-xl univer-bg-primary-600 univer-px-4 univer-text-sm
                  univer-font-medium univer-text-gray-0
                  active:univer-bg-primary-700
                  disabled:univer-opacity-40
                `)}
                onClick={() => {
                    onExecute({ id: config.commandId, value: pattern.trim() });
                    onBack();
                }}
            >
                {localeService.t<LocaleKey>('sheets-ui.mobile.confirm')}
            </button>
            <div
                className="
                  univer-px-1 univer-text-xs univer-text-gray-500
                  dark:!univer-text-gray-400
                "
            >
                {localeService.t<LocaleKey>('sheets-ui.mobile.customFormatDescription')}
            </div>
        </div>
    );
}

function getOptionLabel(localeService: LocaleService, option: IValueOption<string, unknown>): string {
    return typeof option.label === 'string' ? localeService.t(option.label) : String(option.value ?? '');
}

function MobileTextStyleItem(props: {
    schema: MenuSchemaWithItem;
    onExecute: (params: IMobileStyleCommand) => void;
}) {
    const { schema, onExecute } = props;
    const item = schema.item;
    const iconManager = useDependency(IconManager);
    const localeService = useDependency(LocaleService);
    const status = useToolbarItemStatus(item);
    const iconName = typeof item.icon === 'string' ? item.icon : undefined;
    const Icon = iconName ? iconManager.get(iconName) : null;
    const titleKey = item.title ?? item.tooltip;
    const title = typeof titleKey === 'string' ? localeService.t(titleKey) : schema.key;
    if (status.hidden) return null;

    return (
        <button
            type="button"
            data-u-command={item.id}
            aria-label={title}
            aria-pressed={status.activated}
            disabled={status.disabled}
            className={clsx(resetButtonClassName, `
              univer-flex univer-min-h-12 univer-items-center univer-justify-center univer-text-xl univer-text-gray-900
              active:univer-bg-gray-100
              disabled:univer-opacity-40
              dark:!univer-text-gray-100
              dark:active:!univer-bg-gray-700
              [&>svg]:univer-size-5
            `, {
                'univer-bg-primary-50 univer-text-primary-600 dark:!univer-bg-primary-900 dark:!univer-text-primary-300': status.activated,
            })}
            onClick={() => onExecute({ id: item.commandId ?? item.id })}
        >
            {Icon ? <Icon /> : title}
        </button>
    );
}

function MobileInlineSelector(props: { schema: SelectorMenuSchema; onExecute: (params: IMobileStyleCommand) => void }) {
    const { schema, onExecute } = props;
    const item = schema.item;
    const status = useToolbarItemStatus(item);
    const selections$ = useMemo(() => isObservable(item.selections) ? item.selections : undefined, [item.selections]);
    const observableSelections = useObservable(selections$);
    const selections = observableSelections ?? (Array.isArray(item.selections) ? item.selections : []);
    const selectedValue = status.value || (item.id === SetVerticalTextAlignCommand.id
        ? selections[selections.length - 1]?.value
        : selections[0]?.value);

    if (status.hidden || selections.length === 0) return null;

    return (
        <div
            className="
              univer-grid univer-divide-x univer-divide-gray-100 univer-overflow-hidden univer-rounded-xl
              univer-bg-gray-0
              dark:univer-divide-gray-700 dark:!univer-bg-gray-800
            "
            style={{ gridTemplateColumns: `repeat(${selections.length}, minmax(0, 1fr))` }}
        >
            {selections.map((option, index) => (
                <MobileInlineSelectorOption
                    key={String(option.value ?? index)}
                    item={item}
                    option={option}
                    selectedValue={selectedValue}
                    disabled={status.disabled}
                    onExecute={onExecute}
                />
            ))}
        </div>
    );
}

function MobileInlineSelectorOption(props: {
    item: IDisplayMenuItem<IMenuSelectorItem<string, MenuItemDefaultValueType, unknown>>;
    option: IValueOption<string, unknown>;
    selectedValue: unknown;
    disabled: boolean;
    onExecute: (params: IMobileStyleCommand) => void;
}) {
    const { item, option, selectedValue, disabled, onExecute } = props;
    const iconManager = useDependency(IconManager);
    const localeService = useDependency(LocaleService);
    const observableValue = useObservable(option.value$);
    const value = option.value ?? observableValue;
    const Icon = option.icon ? iconManager.get(option.icon) : null;
    const selected = value === selectedValue;
    const label = typeof option.label === 'string' ? localeService.t(option.label) : String(value ?? '');

    return (
        <button
            type="button"
            aria-label={label}
            aria-pressed={selected}
            data-u-command={option.commandId ?? item.selectionsCommandId ?? item.id}
            data-u-value={String(value ?? '')}
            disabled={disabled || option.disabled}
            className={clsx(resetButtonClassName, `
              univer-flex univer-min-h-12 univer-items-center univer-justify-center univer-text-lg univer-text-gray-800
              active:univer-bg-gray-100
              disabled:univer-opacity-40
              dark:!univer-text-gray-100
              dark:active:!univer-bg-gray-700
            `, {
                'univer-bg-primary-50 univer-text-primary-600 dark:!univer-bg-primary-900 dark:!univer-text-primary-300': selected,
            })}
            onClick={() => onExecute({
                id: option.commandId ?? item.selectionsCommandId ?? item.id,
                value,
            })}
        >
            {Icon ? <Icon /> : <span className="univer-text-sm">{String(value ?? '')}</span>}
        </button>
    );
}

function MobileStyleNavigationItem(props: {
    schema: MenuSchemaWithItem;
    bordered: boolean;
    onOpenView: (view: MobileStyleView) => void;
}) {
    const { schema, bordered, onOpenView } = props;
    const item = schema.item;
    const localeService = useDependency(LocaleService);
    const status = useToolbarItemStatus(item);
    const titleKey = item.title ?? item.tooltip;
    const title = typeof titleKey === 'string' ? localeService.t(titleKey) : schema.key;
    const target = item.id === SetRangeTextColorCommand.id ? 'text' : 'background';

    if (status.hidden) return null;

    return (
        <MobileActionRow
            title={title}
            value={typeof status.value === 'string' ? status.value : undefined}
            bordered={bordered}
            trailing={<MoreRightIcon />}
            onClick={() => onOpenView(item.id === SetBorderBasicCommand.id
                ? { kind: 'border', title, item }
                : { kind: 'color', target, title, item })}
        />
    );
}

function MobileStyleRootItem(props: { schema: MenuSchemaWithItem; onOpenView: (view: MobileStyleView) => void }) {
    const { schema, onOpenView } = props;
    const item = schema.item;
    const localeService = useDependency(LocaleService);
    const iconManager = useDependency(IconManager);
    const status = useToolbarItemStatus(item);
    const icon$ = useMemo(() => isObservable(item.icon) ? item.icon : undefined, [item.icon]);
    const observableIcon = useObservable(icon$);
    const iconName = observableIcon ?? (typeof item.icon === 'string' ? item.icon : undefined);
    const Icon = iconName ? iconManager.get(iconName) : null;
    const titleKey = item.title ?? item.tooltip;
    const title = typeof titleKey === 'string' ? localeService.t(titleKey) : schema.key;
    const displayValue = typeof status.value === 'string' || typeof status.value === 'number'
        ? status.value
        : undefined;
    const target = item.id === SetRangeTextColorCommand.id
        ? 'text'
        : item.id === SetBackgroundColorCommand.id
            ? 'background'
            : null;
    const isBorder = item.id === SetBorderBasicCommand.id;

    if (
        !target &&
        !isBorder &&
        isMobileSelectorItem(item)
    ) {
        if (status.hidden) return null;
        return (
            <button
                type="button"
                aria-label={title}
                disabled={status.disabled}
                className={clsx(resetButtonClassName, `
                  univer-flex univer-min-h-12 univer-items-center univer-justify-center univer-rounded
                  univer-text-gray-900
                  active:univer-bg-gray-100
                  disabled:univer-opacity-40
                  dark:!univer-text-gray-100
                  dark:active:!univer-bg-gray-700
                  [&>svg]:univer-size-4
                `)}
                onClick={() => onOpenView({
                    kind: 'options',
                    title,
                    item,
                })}
            >
                {Icon
                    ? <Icon />
                    : (
                        <span className="univer-max-w-full univer-truncate univer-px-1 univer-text-sm">
                            {String(displayValue ?? title)}
                        </span>
                    )}
            </button>
        );
    }

    if (!target && !isBorder) {
        return (
            <div
                className="
                  univer-flex univer-min-h-12 univer-items-center univer-justify-center
                  [&_button]:!univer-min-h-12 [&_button]:!univer-w-full
                "
            >
                <ToolbarItem {...item} grid />
            </div>
        );
    }

    if (status.hidden) return null;

    return (
        <button
            type="button"
            data-u-command={item.id}
            aria-label={title}
            disabled={status.disabled}
            className={clsx(resetButtonClassName, `
              univer-flex univer-min-h-12 univer-items-center univer-justify-center univer-rounded univer-text-gray-900
              active:univer-bg-gray-100
              disabled:univer-opacity-40
              dark:!univer-text-gray-100
              dark:active:!univer-bg-gray-700
              [&>svg]:univer-size-4
            `)}
            onClick={() => {
                if (isBorder) {
                    onOpenView({ kind: 'border', title, item });
                } else if (target) {
                    onOpenView({ kind: 'color', target, title, item });
                }
            }}
        >
            {Icon && <Icon />}
        </button>
    );
}

function MobileStyleOptionsView(props: {
    item: IDisplayMenuItem<IMenuSelectorItem<string, MenuItemDefaultValueType, unknown>>;
    onExecute: (params: IMobileStyleCommand) => void;
}) {
    const { item, onExecute } = props;
    const iconManager = useDependency(IconManager);
    const localeService = useDependency(LocaleService);
    const status = useToolbarItemStatus(item);
    const selections$ = useMemo(() => isObservable(item.selections) ? item.selections : undefined, [item.selections]);
    const observableSelections = useObservable(selections$);
    const selections = observableSelections ?? (Array.isArray(item.selections) ? item.selections : []);

    if (item.id === SetRangeFontFamilyCommand.id) {
        return <MobileFontFamilyOptions item={item} onExecute={onExecute} />;
    }

    return (
        <div
            className="
              univer-overflow-hidden univer-rounded-xl univer-bg-gray-0
              dark:!univer-bg-gray-800
            "
        >
            {selections.map((option, index) => {
                const Icon = option.icon ? iconManager.get(option.icon) : null;
                const selected = option.value === status.value;
                const label = getOptionLabel(localeService, option);
                return (
                    <button
                        key={String(option.value ?? index)}
                        type="button"
                        aria-pressed={selected}
                        disabled={status.disabled || option.disabled}
                        className={clsx(resetButtonClassName, `
                          univer-flex univer-min-h-12 univer-w-full univer-items-center univer-gap-3 univer-px-4
                          univer-text-left univer-text-gray-900
                          active:univer-bg-gray-100
                          disabled:univer-opacity-40
                          dark:!univer-text-gray-100
                          dark:active:!univer-bg-gray-700
                        `, index !== selections.length - 1 && borderBottomClassName)}
                        onClick={() => onExecute({
                            id: option.commandId ?? item.selectionsCommandId ?? item.id,
                            value: option.value,
                        })}
                    >
                        {Icon && <Icon className="univer-size-5" />}
                        <span className="univer-flex-1 univer-text-sm">{label}</span>
                        {selected && <CheckMarkIcon className="univer-text-primary-600" />}
                    </button>
                );
            })}
        </div>
    );
}

function MobileFontFamilyOptions(props: {
    item: IDisplayMenuItem<IMenuSelectorItem<string, MenuItemDefaultValueType, unknown>>;
    onExecute: (params: IMobileStyleCommand) => void;
}) {
    const { item, onExecute } = props;
    const fontService = useDependency(IFontService);
    const localeService = useDependency(LocaleService);
    const status = useToolbarItemStatus(item);
    const fonts = useObservable<IFontConfig[]>(fontService.fonts$, fontService.getFonts());

    return (
        <div
            className="
              univer-overflow-hidden univer-rounded-xl univer-bg-gray-0
              dark:!univer-bg-gray-800
            "
        >
            {fonts.map((font, index) => {
                const selected = font.value === status.value;
                return (
                    <button
                        key={font.value}
                        type="button"
                        aria-pressed={selected}
                        disabled={status.disabled}
                        className={clsx(resetButtonClassName, `
                          univer-flex univer-min-h-12 univer-w-full univer-items-center univer-gap-3 univer-px-4
                          univer-text-left univer-text-gray-900
                          active:univer-bg-gray-100
                          disabled:univer-opacity-40
                          dark:!univer-text-gray-100
                          dark:active:!univer-bg-gray-700
                        `, index !== fonts.length - 1 && borderBottomClassName)}
                        style={{ fontFamily: font.value }}
                        onClick={() => onExecute({ id: item.selectionsCommandId ?? item.id, value: font.value })}
                    >
                        <span className="univer-flex-1 univer-text-sm">{localeService.t(font.label)}</span>
                        {selected && <CheckMarkIcon className="univer-text-primary-600" />}
                    </button>
                );
            })}
        </div>
    );
}

function MobileColorView(props: {
    target: Exclude<ColorTarget, 'border'>;
    item: IDisplayMenuItem<IMenuItem>;
    recentColors: string[];
    customColorTitle: string;
    onOpenView: (view: MobileStyleView) => void;
    onExecute: (params: IMobileStyleCommand) => void;
    onUseColor: (color: string) => void;
}) {
    const { target, item, recentColors, customColorTitle, onOpenView, onExecute, onUseColor } = props;
    const localeService = useDependency(LocaleService);
    const { value } = useToolbarItemStatus(item);
    const [selectedColor, setSelectedColor] = useState<string | undefined>(typeof value === 'string' ? value : undefined);

    function selectColor(color: string) {
        executeColor(target, color, onExecute);
        setSelectedColor(color);
        onUseColor(color);
    }

    return (
        <div className="univer-grid univer-gap-4">
            <MobileActionRow
                icon={<NoColorDoubleIcon />}
                title={localeService.t<LocaleKey>('sheets-ui.toolbar.resetColor')}
                onClick={() => {
                    onExecute({ id: target === 'text' ? ResetRangeTextColorCommand.id : ResetBackgroundColorCommand.id });
                    setSelectedColor(undefined);
                }}
            />
            <ColorPresets value={selectedColor} variant="mobile" onSelect={selectColor} />
            {recentColors.length > 0 && (
                <section className="univer-grid univer-gap-2">
                    <div
                        className="
                          univer-text-xs univer-font-medium univer-text-gray-500
                          dark:!univer-text-gray-400
                        "
                    >
                        {localeService.t<LocaleKey>('sheets-ui.mobile.recentColors')}
                    </div>
                    <div className="univer-flex univer-flex-wrap univer-gap-2">
                        {recentColors.map((color) => (
                            <ColorButton key={color} color={color} selected={color.toUpperCase() === selectedColor?.toUpperCase()} onClick={() => selectColor(color)} />
                        ))}
                    </div>
                </section>
            )}
            <MobileActionRow
                title={customColorTitle}
                value={selectedColor}
                trailing={<MoreRightIcon />}
                onClick={() => onOpenView({
                    kind: 'custom-color',
                    target,
                    title: customColorTitle,
                    value: selectedColor,
                    item,
                })}
            />
        </div>
    );
}

function MobileBorderView(props: {
    item: IDisplayMenuItem<IMenuItem>;
    value: IBorderInfo;
    borderColorTitle: string;
    borderStyleTitle: string;
    onOpenView: (view: MobileStyleView) => void;
    onExecute: (params: IMobileStyleCommand) => void;
}) {
    const { item, value, borderColorTitle, borderStyleTitle, onOpenView, onExecute } = props;
    const iconManager = useDependency(IconManager);
    const localeService = useDependency(LocaleService);

    function apply(next: Partial<IBorderInfo>) {
        onExecute({ id: SetBorderBasicCommand.id, value: { ...value, ...next } });
    }

    return (
        <div className="univer-grid univer-gap-4">
            <div className="univer-grid univer-grid-cols-3 univer-gap-2">
                {BORDER_LINE_CHILDREN.map((option) => {
                    const Icon = iconManager.get(option.icon);
                    const selected = value.type === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            aria-pressed={selected}
                            className={clsx(resetButtonClassName, `
                              univer-relative univer-flex univer-min-h-14 univer-flex-col univer-items-center
                              univer-justify-center univer-gap-1 univer-rounded-lg univer-bg-gray-0 univer-p-1
                              univer-text-xs univer-text-gray-700
                              active:univer-bg-gray-100
                              dark:!univer-bg-gray-800 dark:!univer-text-gray-300
                              dark:active:!univer-bg-gray-700
                            `, {
                                'univer-ring-2 univer-ring-primary-600 dark:!univer-ring-primary-400': selected,
                            })}
                            onClick={() => apply({ type: option.value })}
                        >
                            {Icon && <Icon className="univer-size-5" />}
                            <span className="univer-line-clamp-1">{localeService.t(option.label)}</span>
                        </button>
                    );
                })}
            </div>
            <div
                className="
                  univer-overflow-hidden univer-rounded-xl univer-bg-gray-0
                  dark:!univer-bg-gray-800
                "
            >
                <MobileActionRow
                    title={borderColorTitle}
                    value={value.color}
                    bordered
                    trailing={<MoreRightIcon />}
                    onClick={() => onOpenView({ kind: 'border-color', title: borderColorTitle, item })}
                />
                <MobileActionRow
                    title={borderStyleTitle}
                    trailing={<MoreRightIcon />}
                    onClick={() => onOpenView({ kind: 'border-style', title: borderStyleTitle, item })}
                />
            </div>
        </div>
    );
}

function MobileBorderColorView(props: {
    item: IDisplayMenuItem<IMenuItem>;
    value: IBorderInfo;
    recentColors: string[];
    defaultColor: string;
    customColorTitle: string;
    onOpenView: (view: MobileStyleView) => void;
    onExecute: (params: IMobileStyleCommand) => void;
    onUseColor: (color: string) => void;
}) {
    const { item, value, recentColors, defaultColor, customColorTitle, onOpenView, onExecute, onUseColor } = props;
    const localeService = useDependency(LocaleService);

    function selectColor(color: string) {
        onExecute({ id: SetBorderBasicCommand.id, value: { ...value, color } });
        onUseColor(color);
    }

    return (
        <div className="univer-grid univer-gap-4">
            <MobileActionRow
                icon={<NoColorDoubleIcon />}
                title={localeService.t<LocaleKey>('sheets-ui.toolbar.resetColor')}
                onClick={() => onExecute({ id: SetBorderBasicCommand.id, value: { ...value, color: defaultColor } })}
            />
            <ColorPresets value={value.color} variant="mobile" onSelect={selectColor} />
            {recentColors.length > 0 && (
                <div className="univer-flex univer-flex-wrap univer-gap-2">
                    {recentColors.map((color) => (
                        <ColorButton key={color} color={color} selected={color.toUpperCase() === value.color?.toUpperCase()} onClick={() => selectColor(color)} />
                    ))}
                </div>
            )}
            <MobileActionRow
                title={customColorTitle}
                value={value.color}
                trailing={<MoreRightIcon />}
                onClick={() => onOpenView({
                    kind: 'custom-color',
                    target: 'border',
                    title: customColorTitle,
                    value: value.color,
                    borderValue: value,
                    item,
                })}
            />
        </div>
    );
}

function MobileBorderStyleView(props: {
    value: IBorderInfo;
    onExecute: (params: IMobileStyleCommand) => void;
}) {
    const { value, onExecute } = props;

    return (
        <div
            className="
              univer-overflow-hidden univer-rounded-xl univer-bg-gray-0
              dark:!univer-bg-gray-800
            "
        >
            {BORDER_SIZE_CHILDREN.map((option, index) => (
                <button
                    key={option.value}
                    type="button"
                    className={clsx(resetButtonClassName, `
                      univer-flex univer-min-h-12 univer-w-full univer-items-center univer-gap-4 univer-px-4
                      univer-text-gray-900
                      active:univer-bg-gray-100
                      dark:!univer-text-gray-100
                      dark:active:!univer-bg-gray-700
                    `, index !== BORDER_SIZE_CHILDREN.length - 1 && borderBottomClassName)}
                    onClick={() => onExecute({
                        id: SetBorderBasicCommand.id,
                        value: { ...value, style: option.value },
                    })}
                >
                    <BorderLine
                        className="
                          univer-w-28 univer-fill-gray-900
                          dark:!univer-fill-gray-0
                        "
                        type={option.value}
                    />
                    <span className="univer-flex-1 univer-text-left univer-text-sm">{option.value}</span>
                    {value.style === option.value && (
                        <CheckMarkIcon
                            className="
                              univer-text-primary-600
                              dark:!univer-text-primary-400
                            "
                        />
                    )}
                </button>
            ))}
        </div>
    );
}

function MobileActionRow(props: {
    title: string;
    icon?: ReactNode;
    value?: string;
    valueType?: 'color' | 'text';
    trailing?: ReactNode;
    bordered?: boolean;
    onClick: () => void;
}) {
    const { title, icon, value, valueType = 'color', trailing, bordered, onClick } = props;

    return (
        <button
            type="button"
            aria-label={title}
            className={clsx(resetButtonClassName, `
              univer-flex univer-min-h-12 univer-w-full univer-items-center univer-gap-3 univer-rounded-xl
              univer-bg-gray-0 univer-px-4 univer-text-left univer-text-base univer-font-medium univer-text-gray-900
              active:univer-bg-gray-100
              dark:!univer-bg-gray-800 dark:!univer-text-gray-100
              dark:active:!univer-bg-gray-700
              [&>svg]:univer-size-5
            `, bordered && borderBottomClassName)}
            onClick={onClick}
        >
            {icon}
            <span className="univer-flex-1">{title}</span>
            {value && valueType === 'color' && (
                <span
                    className="
                      univer-size-6 univer-rounded-md univer-border univer-border-solid univer-border-gray-200
                      dark:!univer-border-gray-600
                    "
                    style={{ backgroundColor: value }}
                />
            )}
            {value && valueType === 'text' && (
                <span
                    className="
                      univer-max-w-32 univer-truncate univer-text-sm univer-font-normal univer-text-gray-500
                      dark:!univer-text-gray-400
                    "
                >
                    {value}
                </span>
            )}
            {trailing}
        </button>
    );
}

function ColorButton(props: { color: string; selected: boolean; onClick: () => void }) {
    const { color, selected, onClick } = props;
    return (
        <button
            type="button"
            aria-label={color}
            aria-pressed={selected}
            className={clsx(resetButtonClassName, `
              univer-flex univer-size-10 univer-items-center univer-justify-center univer-rounded-lg
            `, {
                'univer-ring-2 univer-ring-primary-600 dark:!univer-ring-primary-400': selected,
            })}
            onClick={onClick}
        >
            <span
                className="
                  univer-aspect-square univer-w-8 univer-shrink-0 univer-rounded-md univer-border univer-border-solid
                  univer-border-gray-200
                  dark:!univer-border-gray-600
                "
                style={{ backgroundColor: color }}
            />
        </button>
    );
}

function executeColor(
    target: ColorTarget,
    color: string,
    onExecute: (params: IMobileStyleCommand) => void,
    borderValue?: IBorderInfo
) {
    if (target === 'border') {
        if (borderValue) {
            onExecute({ id: SetBorderBasicCommand.id, value: { ...borderValue, color } });
        }
        return;
    }

    onExecute({ id: target === 'text' ? SetRangeTextColorCommand.id : SetBackgroundColorCommand.id, value: color });
}

function isBorderInfo(value: unknown): value is IBorderInfo {
    if (!value || typeof value !== 'object') return false;

    return 'type' in value
        && BORDER_TYPES.has(value.type)
        && 'color' in value
        && (typeof value.color === 'string' || value.color === undefined)
        && 'style' in value
        && typeof value.style === 'number'
        && 'activeBorderType' in value
        && typeof value.activeBorderType === 'boolean';
}

function hasMenuItem(schema: IMenuSchema): schema is MenuSchemaWithItem {
    return schema.item !== undefined;
}

function isMobileSelectorItem(item: IMenuItem): item is SelectorMenuSchema['item'] {
    return item.type !== MenuItemType.BUTTON;
}

function isMobileSelectorSchema(schema: MenuSchemaWithItem): schema is SelectorMenuSchema {
    return isMobileSelectorItem(schema.item);
}

function isMobileNumberFormatSchema(
    schema: MenuSchemaWithItem
): schema is MenuSchemaWithItem & { item: ConfiguredMobileNumberFormatItem } {
    if (!isMobileSelectorItem(schema.item) || !('mobileStyle' in schema.item)) return false;

    const config = schema.item.mobileStyle;
    if (!config || typeof config !== 'object') return false;

    return 'kind' in config
        && config.kind === 'number-format'
        && 'title' in config
        && typeof config.title === 'string'
        && 'commandId' in config
        && typeof config.commandId === 'string'
        && 'detailTitle' in config
        && typeof config.detailTitle === 'string'
        && 'customTitle' in config
        && typeof config.customTitle === 'string'
        && 'quickOptions' in config
        && Array.isArray(config.quickOptions)
        && 'decimalOptions' in config
        && Array.isArray(config.decimalOptions)
        && 'detailOptions' in config
        && Array.isArray(config.detailOptions)
        && 'customPatterns' in config
        && Array.isArray(config.customPatterns);
}
