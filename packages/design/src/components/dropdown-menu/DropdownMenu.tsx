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
import { useState } from 'react';
import {
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPrimitive,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './DropdownMenuPrimitive';

interface IDropdownMenuNormalItem {
    type: 'item';
    className?: string;
    children: ReactNode;
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

type DropdownMenuType = IDropdownMenuNormalItem | IDropdownMenuSeparatorItem | IDropdownMenuRadioItem | IDropdownMenuCheckItem;

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
                    onSelect={() => {
                        item.onSelect?.(item);
                    }}
                >
                    {item.children}
                </DropdownMenuItem>
            );
        }
    }

    return (
        <DropdownMenuPrimitive modal={false} open={open} onOpenChange={handleChangeOpen}>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="univer-text-sm" {...restProps} onWheel={(e) => e.stopPropagation()}>
                {items.map((item, index) => renderMenuItem(item, index))}
            </DropdownMenuContent>
        </DropdownMenuPrimitive>
    );
}
