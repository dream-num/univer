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

import type { DocumentDataModel } from '@univerjs/core';
import type { ReactNode } from 'react';
import type { LocaleKey } from '../../locale/types';
import {
    BooleanNumber,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    PositionedObjectLayoutType,
    UniverInstanceType,
} from '@univerjs/core';
import { borderClassName, clsx, Dropdown, DropdownMenu, Separator, Tooltip } from '@univerjs/design';
import {
    AutofillDoubleIcon,
    ChartIcon,
    MoreDownIcon,
    TextWrapShapeIcon,
} from '@univerjs/icons';
import { IconManager, useDependency } from '@univerjs/ui';
import { useState } from 'react';

export interface IImagePopupMenuItem {
    label: string;
    index: number;
    commandId: string;
    commandParams?: object;
    disable: boolean;
    type?: 'button' | 'select';
    value?: string;
    options?: Array<{ label: unknown; value: string }>;
    commandParamsFactory?: (value: string) => object;
    hideOnClick?: boolean;
    icon?: string;
}

export interface IImagePopupMenuExtraProps {
    menuItems: IImagePopupMenuItem[];
    variant?: 'doc-floating-toolbar' | 'doc-chart-floating-toolbar';
    unitId?: string;
    subUnitId?: string;
    drawingId?: string;
}

export interface IImagePopupMenuProps {
    popup: {
        extraProps?: IImagePopupMenuExtraProps;
    };
}

export function ImagePopupMenu(props: IImagePopupMenuProps) {
    const { popup } = props;

    const menuItems = popup?.extraProps?.menuItems;
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const [visible, setVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    if (!menuItems) return null;

    if (
        popup.extraProps?.variant === 'doc-floating-toolbar' &&
        popup.extraProps.unitId &&
        popup.extraProps.subUnitId &&
        popup.extraProps.drawingId
    ) {
        return (
            <DocImageFloatingToolbar
                menuItems={menuItems}
                unitId={popup.extraProps.unitId}
                subUnitId={popup.extraProps.subUnitId}
                drawingId={popup.extraProps.drawingId}
            />
        );
    }

    if (popup.extraProps?.variant === 'doc-chart-floating-toolbar') {
        return <DocChartFloatingToolbar menuItems={menuItems} />;
    }

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const onVisibleChange = (visible: boolean) => {
        setVisible(visible);
    };

    const handleClick = (item: IImagePopupMenuItem) => {
        commandService.executeCommand(item.commandId, item.commandParams);
        setVisible(false);
    };

    const showMore = visible || isHovered;

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <DropdownMenu
                align="start"
                items={menuItems.map((item) => ({
                    type: 'item',
                    children: localeService.t(item.label as LocaleKey),
                    disabled: item.disable,
                    onSelect: () => handleClick(item),
                }))}
                open={visible}
                onOpenChange={onVisibleChange}
            >
                <div
                    className={clsx(`
                      univer-flex univer-items-center univer-gap-2 univer-rounded univer-p-1
                      hover:univer-bg-gray-100
                      dark:hover:!univer-bg-gray-800
                    `, borderClassName, {
                        'univer-bg-gray-100 dark:!univer-bg-gray-800': visible,
                        'univer-bg-white dark:!univer-bg-gray-900': !visible,
                    })}
                >
                    <AutofillDoubleIcon
                        className={`
                          univer-fill-primary-600 univer-text-gray-900
                          dark:!univer-text-white
                        `}
                    />
                    {showMore && <MoreDownIcon className="dark:!univer-text-white" />}
                </div>
            </DropdownMenu>
        </div>
    );
};

const UPDATE_DOC_DRAWING_WRAPPING_STYLE_COMMAND_ID = 'doc.command.update-doc-drawing-wrapping-style';

enum TextWrappingStyle {
    INLINE = 'inline',
    BEHIND_TEXT = 'behindText',
    IN_FRONT_OF_TEXT = 'inFrontOfText',
    WRAP_SQUARE = 'wrapSquare',
    WRAP_TOP_AND_BOTTOM = 'wrapTopAndBottom',
}

interface IDocImageFloatingToolbarProps {
    menuItems: IImagePopupMenuItem[];
    unitId: string;
    subUnitId: string;
    drawingId: string;
}

interface IToolbarDropdownOption<T extends string | number> {
    label: string;
    value: T;
    icon: ReactNode;
}

function getWrappingStyle(documentDataModel: DocumentDataModel | undefined, drawingId: string): TextWrappingStyle {
    const drawing = documentDataModel?.getSnapshot().drawings?.[drawingId];
    if (!drawing) {
        return TextWrappingStyle.INLINE;
    }

    if (drawing.layoutType === PositionedObjectLayoutType.WRAP_NONE) {
        return drawing.behindDoc === BooleanNumber.TRUE ? TextWrappingStyle.BEHIND_TEXT : TextWrappingStyle.IN_FRONT_OF_TEXT;
    }

    if (drawing.layoutType === PositionedObjectLayoutType.WRAP_SQUARE) {
        return TextWrappingStyle.WRAP_SQUARE;
    }

    if (drawing.layoutType === PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM) {
        return TextWrappingStyle.WRAP_TOP_AND_BOTTOM;
    }

    return TextWrappingStyle.INLINE;
}

function ToolbarGroup(props: { children: ReactNode }) {
    return (
        <div className="univer-flex univer-h-7 univer-items-center univer-gap-1 univer-px-1">
            {props.children}
        </div>
    );
}

function ToolbarButton(props: { titleKey: string; active?: boolean; disabled?: boolean; children: ReactNode; onClick: () => void }) {
    const localeService = useDependency(LocaleService);

    return (
        <Tooltip title={localeService.t(props.titleKey as LocaleKey)} placement="bottom">
            <button
                type="button"
                disabled={props.disabled}
                onClick={props.onClick}
                className={clsx(`
                  univer-flex univer-h-6 univer-w-6 univer-items-center univer-justify-center univer-rounded-md
                  univer-border-none univer-bg-transparent univer-p-0 univer-text-sm univer-text-gray-700
                  univer-transition-colors
                  hover:univer-bg-gray-100
                  disabled:univer-cursor-not-allowed disabled:univer-opacity-40
                  dark:!univer-text-gray-100
                  dark:hover:!univer-bg-gray-700
                `, {
                    'univer-bg-gray-100 univer-text-primary-600 dark:!univer-bg-gray-700 dark:!univer-text-primary-300': props.active,
                })}
            >
                {props.children}
            </button>
        </Tooltip>
    );
}

function ToolbarDropdownButton<T extends string | number>(props: {
    title: string;
    value: T;
    options: Array<IToolbarDropdownOption<T>>;
    onChange: (value: T) => void;
}) {
    const [open, setOpen] = useState(false);
    const activeOption = props.options.find((option) => option.value === props.value) ?? props.options[0];

    return (
        <Dropdown
            open={open}
            onOpenChange={setOpen}
            overlay={(
                <div
                    className={`
                      univer-min-w-32 univer-rounded-lg univer-border univer-border-solid univer-border-gray-200
                      univer-bg-white univer-p-1 univer-shadow-lg
                      dark:!univer-border-gray-700 dark:!univer-bg-gray-900
                    `}
                >
                    {props.options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                props.onChange(option.value);
                                setOpen(false);
                            }}
                            className={clsx(`
                              univer-flex univer-h-8 univer-w-full univer-items-center univer-gap-2 univer-rounded-md
                              univer-border-none univer-bg-transparent univer-px-2 univer-text-left univer-text-sm
                              univer-text-gray-700 univer-transition-colors
                              hover:univer-bg-gray-100
                              dark:!univer-text-gray-100
                              dark:hover:!univer-bg-gray-800
                            `, {
                                'univer-bg-primary-50 univer-text-primary-600 dark:!univer-bg-gray-800 dark:!univer-text-primary-300': option.value === props.value,
                            })}
                        >
                            <span className="univer-flex univer-size-4 univer-items-center univer-justify-center">{option.icon}</span>
                            <span className="univer-flex-1">{option.label}</span>
                        </button>
                    ))}
                </div>
            )}
        >
            <span>
                <Tooltip title={props.title} placement="bottom">
                    <button
                        type="button"
                        className={clsx(`
                          univer-flex univer-h-6 univer-min-w-9 univer-items-center univer-justify-center univer-gap-1
                          univer-rounded-md univer-border-none univer-bg-transparent univer-px-1.5 univer-text-sm
                          univer-text-gray-700 univer-transition-colors
                          hover:univer-bg-gray-100
                          dark:!univer-text-gray-100
                          dark:hover:!univer-bg-gray-700
                        `, {
                            'univer-bg-gray-100 univer-text-primary-600 dark:!univer-bg-gray-700 dark:!univer-text-primary-300': open,
                        })}
                    >
                        {activeOption.icon}
                        <MoreDownIcon className="univer-text-xs" />
                    </button>
                </Tooltip>
            </span>
        </Dropdown>
    );
}

function DocImageFloatingToolbar(props: IDocImageFloatingToolbarProps) {
    const commandService = useDependency(ICommandService);
    const iconManager = useDependency(IconManager);
    const localeService = useDependency(LocaleService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const documentDataModel = univerInstanceService.getUnit<DocumentDataModel>(props.unitId, UniverInstanceType.UNIVER_DOC) ?? undefined;
    const [wrappingStyle, setWrappingStyle] = useState(() => getWrappingStyle(documentDataModel, props.drawingId));
    const [hidden, setHidden] = useState(false);
    const actionItems = props.menuItems
        .filter((item) => item.type !== 'select' && item.icon)
        .sort((a, b) => a.index - b.index);
    const wrappingStyleOptions = [
        {
            label: localeService.t<LocaleKey>('drawing-ui.image-text-wrap.inline'),
            value: TextWrappingStyle.INLINE,
            icon: <TextWrapShapeIcon />,
        },
        {
            label: localeService.t<LocaleKey>('drawing-ui.image-text-wrap.square'),
            value: TextWrappingStyle.WRAP_SQUARE,
            icon: <TextWrapShapeIcon />,
        },
        {
            label: localeService.t<LocaleKey>('drawing-ui.image-text-wrap.topAndBottom'),
            value: TextWrappingStyle.WRAP_TOP_AND_BOTTOM,
            icon: <TextWrapShapeIcon />,
        },
        {
            label: localeService.t<LocaleKey>('drawing-ui.image-text-wrap.behindText'),
            value: TextWrappingStyle.BEHIND_TEXT,
            icon: <TextWrapShapeIcon />,
        },
        {
            label: localeService.t<LocaleKey>('drawing-ui.image-text-wrap.inFrontText'),
            value: TextWrappingStyle.IN_FRONT_OF_TEXT,
            icon: <TextWrapShapeIcon />,
        },
    ];

    const executeMenuItem = (item: IImagePopupMenuItem | undefined) => {
        if (!item || item.disable) {
            return;
        }
        if (item.hideOnClick) {
            setHidden(true);
        }
        commandService.executeCommand(item.commandId, item.commandParams);
    };

    const updateWrappingStyle = (value: TextWrappingStyle) => {
        setWrappingStyle(value);
        commandService.executeCommand(UPDATE_DOC_DRAWING_WRAPPING_STYLE_COMMAND_ID, {
            unitId: props.unitId,
            subUnitId: props.subUnitId,
            drawings: [{ unitId: props.unitId, subUnitId: props.subUnitId, drawingId: props.drawingId }],
            wrappingStyle: value,
        });
    };

    if (hidden) {
        return null;
    }

    return (
        <div
            data-u-comp="doc-image-floating-toolbar"
            onMouseDown={(event) => {
                event.stopPropagation();
                event.preventDefault();
            }}
            className={clsx(`
              univer-box-border univer-flex univer-items-center univer-rounded univer-bg-white univer-px-1 univer-py-1
              univer-shadow-sm
              dark:!univer-border-gray-700 dark:!univer-bg-gray-900
            `, borderClassName)}
        >
            <ToolbarGroup>
                <ToolbarDropdownButton
                    title={wrappingStyleOptions.find((option) => option.value === wrappingStyle)?.label ?? localeService.t<LocaleKey>('drawing-ui.image-text-wrap.inline')}
                    value={wrappingStyle}
                    options={wrappingStyleOptions}
                    onChange={updateWrappingStyle}
                />
            </ToolbarGroup>
            {actionItems.length > 0 && (
                <>
                    <Separator orientation="vertical" />
                    <ToolbarGroup>
                        {actionItems.map((item) => {
                            const Icon = iconManager.get(item.icon!);
                            return (
                                <ToolbarButton
                                    key={`${item.commandId}-${item.index}`}
                                    titleKey={item.label}
                                    disabled={item.disable}
                                    onClick={() => executeMenuItem(item)}
                                >
                                    <Icon />
                                </ToolbarButton>
                            );
                        })}
                    </ToolbarGroup>
                </>
            )}
        </div>
    );
}

function DocChartFloatingToolbar(props: Pick<IDocImageFloatingToolbarProps, 'menuItems'>) {
    const commandService = useDependency(ICommandService);
    const iconManager = useDependency(IconManager);
    const localeService = useDependency(LocaleService);
    const [hidden, setHidden] = useState(false);
    const chartTypeItem = props.menuItems.find((item) => item.type === 'select');
    const actionItems = props.menuItems
        .filter((item) => item.type !== 'select' && item.icon)
        .sort((a, b) => a.index - b.index);
    const chartTypeOptions = (chartTypeItem?.options ?? []).map((option) => ({
        label: String(option.label),
        value: option.value,
        icon: <ChartIcon />,
    }));

    const executeMenuItem = (item: IImagePopupMenuItem | undefined) => {
        if (!item || item.disable) {
            return;
        }
        if (item.hideOnClick) {
            setHidden(true);
        }
        commandService.executeCommand(item.commandId, item.commandParams);
    };

    if (hidden) {
        return null;
    }

    return (
        <div
            data-u-comp="doc-chart-floating-toolbar"
            onMouseDown={(event) => {
                event.stopPropagation();
                event.preventDefault();
            }}
            className={clsx(`
              univer-box-border univer-flex univer-items-center univer-rounded univer-bg-white univer-px-1 univer-py-1
              univer-shadow-sm
              dark:!univer-border-gray-700 dark:!univer-bg-gray-900
            `, borderClassName)}
        >
            {chartTypeItem && (
                <>
                    <ToolbarGroup>
                        <ToolbarDropdownButton
                            title={localeService.t(chartTypeItem.label as LocaleKey)}
                            value={chartTypeItem.value ?? chartTypeOptions[0]?.value ?? ''}
                            options={chartTypeOptions}
                            onChange={(value) => {
                                if (!chartTypeItem.disable) {
                                    commandService.executeCommand(chartTypeItem.commandId, chartTypeItem.commandParamsFactory?.(value));
                                }
                            }}
                        />
                    </ToolbarGroup>
                    {actionItems.length > 0 && <Separator orientation="vertical" />}
                </>
            )}
            {actionItems.length > 0 && (
                <ToolbarGroup>
                    {actionItems.map((item) => {
                        const Icon = iconManager.get(item.icon!);
                        return (
                            <ToolbarButton
                                key={`${item.commandId}-${item.index}`}
                                titleKey={item.label}
                                disabled={item.disable}
                                onClick={() => executeMenuItem(item)}
                            >
                                <Icon />
                            </ToolbarButton>
                        );
                    })}
                </ToolbarGroup>
            )}
        </div>
    );
}
