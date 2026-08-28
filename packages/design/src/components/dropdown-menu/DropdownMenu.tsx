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

import type { ComponentProps, ReactNode } from 'react';
import { useContext, useState } from 'react';
import { clsx } from '../../helper/clsx';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { MobileDropdownSurface } from '../dropdown/MobileDropdownSurface';
import {
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuPrimitive,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from './DropdownMenuPrimitive';

interface IDropdownMenuNormalItem {
    type: 'item';
    className?: string;
    children: ReactNode;
    disabled?: boolean;
    variant?: 'default' | 'destructive';
    onSelect?: (item: DropdownMenuType) => void;
}

interface IDropdownMenuNormalSubItem {
    type: 'subItem';
    className?: string;
    children: ReactNode;
    options?: DropdownMenuType[];
    disabled?: boolean;
    onSelect?: (item: DropdownMenuType) => void;
}

interface IDropdownMenuSeparatorItem {
    type: 'separator';
    className?: string;
}

interface IDropdownMenuOption {
    label?: ReactNode;
    value?: string;
    disabled?: boolean;
}

interface IDropdownMenuRadioItem {
    type: 'radio';
    className?: string;
    value: string;
    hideIndicator?: boolean;
    options: (IDropdownMenuOption | IDropdownMenuSeparatorItem)[];
    onSelect?: (item: string) => void;
}

interface IDropdownMenuCheckItem {
    type: 'checkbox';
    className?: string;
    label?: ReactNode;
    value: string;
    disabled?: boolean;
    checked?: boolean;
    onSelect?: (item: string) => void;
}

interface IDropdownMenuCustomItem {
    type: 'custom';
    className?: string;
    children: ReactNode;
}

type DropdownMenuType = IDropdownMenuNormalItem | IDropdownMenuNormalSubItem | IDropdownMenuSeparatorItem | IDropdownMenuRadioItem | IDropdownMenuCheckItem | IDropdownMenuCustomItem;

export interface IDropdownMenuProps extends ComponentProps<typeof DropdownMenuContent> {
    children: ReactNode;
    items: DropdownMenuType[];
    disabled?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function DropdownMenu(props: IDropdownMenuProps) {
    const {
        children,
        items,
        disabled,
        open: controlledOpen,
        onOpenChange: controlledOnOpenChange,
        ...restProps
    } = props;

    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const { mobile } = useContext(ConfigContext);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;

    function handleChangeOpen(newOpen: boolean) {
        if (disabled) return;

        if (!isControlled) {
            setUncontrolledOpen(newOpen);
        }

        controlledOnOpenChange?.(newOpen);
    }

    function renderMenuItem(item: DropdownMenuType, index: number) {
        const { className, type } = item;

        if (type === 'separator') {
            return <DropdownMenuSeparator key={index} className={className} />;
        } else if (type === 'custom') {
            return (
                <div key={index} className={className}>
                    {item.children}
                </div>
            );
        } else if (type === 'radio') {
            return (
                <DropdownMenuRadioGroup
                    key={index}
                    className={className}
                    value={item.value}
                    onValueChange={item.onSelect}
                >
                    {item.options.map((option, index) => {
                        if ('type' in option) {
                            if (option.type === 'separator') {
                                return <DropdownMenuSeparator key={index} className={option.className} />;
                            }
                        } else {
                            if (option.value === undefined) {
                                throw new Error('[DropdownMenu]: `value` is required');
                            }
                            return (
                                <DropdownMenuRadioItem
                                    key={option.value}
                                    value={option.value}
                                    disabled={option.disabled}
                                    hideIndicator={item.hideIndicator}
                                >
                                    {option.label}
                                </DropdownMenuRadioItem>
                            );
                        }
                        return null;
                    })}
                </DropdownMenuRadioGroup>
            );
        } else if (type === 'checkbox') {
            return (
                <DropdownMenuCheckboxItem
                    key={index}
                    className={className}
                    disabled={item.disabled}
                    checked={item.checked}
                    onSelect={() => {
                        item.onSelect?.(item.value);
                    }}
                >
                    {item.label}
                </DropdownMenuCheckboxItem>
            );
        } else if (type === 'item') {
            return (
                <DropdownMenuItem
                    key={index}
                    className={className}
                    disabled={item.disabled}
                    variant={item.variant}
                    onSelect={() => {
                        item.onSelect?.(item);
                    }}
                >
                    {item.children}
                </DropdownMenuItem>
            );
        } else if (type === 'subItem') {
            return (
                <DropdownMenuSub key={index}>
                    <DropdownMenuSubTrigger>{item.children}</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent sideOffset={12}>
                            {item.options?.map((subItem, subIndex) => (
                                renderMenuItem(subItem, subIndex)
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
            );
        }
    }

    function renderMobileMenuItem(item: DropdownMenuType, index: number): ReactNode {
        if (item.type === 'separator') {
            return (
                <div
                    key={index}
                    className="
                      univer-my-1 univer-h-px univer-bg-gray-200
                      dark:!univer-bg-gray-700
                    "
                />
            );
        }
        if (item.type === 'custom') {
            return <div key={index} className={item.className}>{item.children}</div>;
        }
        if (item.type === 'radio') {
            return item.options.map((option, optionIndex) => {
                if ('type' in option) {
                    return renderMobileMenuItem(option, optionIndex);
                }
                if (option.value === undefined) {
                    throw new Error('[DropdownMenu]: `value` is required');
                }
                return (
                    <button
                        key={option.value}
                        type="button"
                        disabled={option.disabled}
                        className={mobileRowClassName(option.value === item.value)}
                        onClick={() => {
                            item.onSelect?.(option.value!);
                            handleChangeOpen(false);
                        }}
                    >
                        {option.label}
                    </button>
                );
            });
        }
        if (item.type === 'checkbox') {
            return (
                <button
                    key={index}
                    type="button"
                    disabled={item.disabled}
                    className={clsx(mobileRowClassName(Boolean(item.checked)), item.className)}
                    onClick={() => {
                        item.onSelect?.(item.value);
                        handleChangeOpen(false);
                    }}
                >
                    {item.label}
                </button>
            );
        }
        if (item.type === 'item') {
            return (
                <button
                    key={index}
                    type="button"
                    disabled={item.disabled}
                    className={clsx(mobileRowClassName(false), item.className, {
                        '!univer-text-red-600 dark:!univer-text-red-400': item.variant === 'destructive',
                    })}
                    onClick={() => {
                        item.onSelect?.(item);
                        handleChangeOpen(false);
                    }}
                >
                    {item.children}
                </button>
            );
        }
        return (
            <div key={index} className="univer-flex univer-flex-col univer-gap-2">
                <div className="univer-px-4 univer-py-2 univer-text-sm univer-font-medium univer-text-gray-500">
                    {item.children}
                </div>
                {item.options?.map(renderMobileMenuItem)}
            </div>
        );
    }

    if (mobile) {
        return (
            <MobileDropdownSurface
                open={open}
                disabled={disabled}
                onOpenChange={handleChangeOpen}
                content={<div className="univer-flex univer-flex-col univer-gap-2">{items.map(renderMobileMenuItem)}</div>}
            >
                {children}
            </MobileDropdownSurface>
        );
    }

    return (
        <DropdownMenuPrimitive modal={false} open={open} onOpenChange={handleChangeOpen}>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="univer-text-sm"
                collisionPadding={{ top: 12, bottom: 12 }}
                onWheel={(e) => e.stopPropagation()}
                {...restProps}
            >
                {items.map((item, index) => renderMenuItem(item, index))}
            </DropdownMenuContent>
        </DropdownMenuPrimitive>
    );
}

function mobileRowClassName(active: boolean): string {
    return clsx(`
      univer-flex univer-h-12 univer-w-full univer-items-center univer-rounded-xl univer-border-0 univer-px-4
      univer-text-left univer-text-base univer-text-gray-900 univer-outline-none
      active:univer-bg-gray-200
      disabled:univer-opacity-40
      dark:!univer-text-gray-0
      dark:active:!univer-bg-gray-700
    `, active
        ? `
          univer-bg-primary-50
          dark:!univer-bg-gray-700
        `
        : `
          univer-bg-gray-0
          dark:!univer-bg-gray-800
        `);
}
