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

import type { Content } from '@radix-ui/react-popover';
import type { ComponentProps, ReactNode } from 'react';
import { useState } from 'react';
import {
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPrimitive,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './DropdownMenuPrimitive';
// import { DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuPrimitive, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from './DropdownMenuPrimitive';

type DropdownMenu = {
    type: 'item';
    className?: string;
    children: ReactNode;
    disabled?: boolean;
    onSelect?: (item: DropdownMenu) => void;
} | {
    type?: 'separator';
    className?: string;
} | {
    type?: 'radio';
    className?: string;
    value: string;
    options: { value: string; label: ReactNode; disabled?: boolean }[];
    onSelect?: (item: string) => void;
};

export interface IDropdownProps {
    children: ReactNode;
    items: DropdownMenu[];
    disabled?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function DropdownMenu(props: IDropdownProps & ComponentProps<typeof Content>) {
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

    function renderMenuItem(item: DropdownMenu, index: number) {
        // const { type, children, icon, checked, hidden, onSelect } = item;
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
                    {item.options.map((option) => (
                        <DropdownMenuRadioItem
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
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
            <DropdownMenuContent {...restProps}>
                {items.map((item, index) => renderMenuItem(item, index))}
            </DropdownMenuContent>
        </DropdownMenuPrimitive>
    );
}
