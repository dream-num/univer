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

import type { ComponentProps } from 'react';
import {
    CheckboxItem,
    Content,
    Group,
    Item,
    ItemIndicator,
    Label,
    Portal,
    RadioGroup,
    RadioItem,
    Root,
    Separator,
    Sub,
    SubContent,
    SubTrigger,
    Trigger,
} from '@radix-ui/react-dropdown-menu';
import { CheckMarkSingle, MoreRightSingle } from '@univerjs/icons';
import { borderClassName, scrollbarClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';

function DropdownMenuPrimitive({
    ...props
}: ComponentProps<typeof Root>) {
    return <Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
    ...props
}: ComponentProps<typeof Portal>) {
    return (
        <Portal data-slot="dropdown-menu-portal" {...props} />
    );
}

function DropdownMenuTrigger({
    ...props
}: ComponentProps<typeof Trigger>) {
    return (
        <Trigger
            data-slot="dropdown-menu-trigger"
            {...props}
        />
    );
}

function DropdownMenuGroup({
    ...props
}: ComponentProps<typeof Group>) {
    return (
        <Group data-slot="dropdown-menu-group" {...props} />
    );
}

function DropdownMenuSub({
    ...props
}: ComponentProps<typeof Sub>) {
    return <Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuRadioGroup({
    ...props
}: ComponentProps<typeof RadioGroup>) {
    return (
        <RadioGroup
            data-slot="dropdown-menu-radio-group"
            {...props}
        />
    );
}

function DropdownMenuSubTrigger({
    className,
    inset,
    children,
    ...props
}: ComponentProps<typeof SubTrigger> & {
    inset?: boolean;
}) {
    return (
        <SubTrigger
            data-slot="dropdown-menu-sub-trigger"
            data-inset={inset}
            className={clsx(
                `
                  univer-flex univer-cursor-default univer-select-none univer-items-center univer-justify-between
                  univer-gap-2 univer-rounded univer-px-2 univer-py-1.5 univer-text-sm univer-outline-none
                  [&_svg]:univer-pointer-events-none [&_svg]:univer-size-4 [&_svg]:univer-shrink-0
                  dark:focus:univer-bg-gray-600
                  data-[state=open]:univer-bg-gray-100
                  focus:univer-bg-gray-100
                `,
                className
            )}
            {...props}
        >
            {children}
            <MoreRightSingle className="ml-auto" />
        </SubTrigger>
    );
}

function DropdownMenuSubContent({
    className,
    ...props
}: ComponentProps<typeof SubContent>) {
    return (
        <SubContent
            data-slot="dropdown-menu-sub-content"
            className={clsx(
                `
                  univer-z-[1080] univer-box-border univer-max-h-[var(--radix-popper-available-height)]
                  univer-overflow-y-auto univer-rounded-md univer-bg-white univer-p-1.5 univer-text-gray-900
                  univer-shadow-md
                  dark:univer-bg-gray-700 dark:univer-text-white
                  data-[side=bottom]:univer-slide-in-from-top-2
                  data-[side=left]:univer-slide-in-from-right-2
                  data-[side=right]:univer-slide-in-from-left-2
                  data-[side=top]:univer-slide-in-from-bottom-2
                  data-[state=closed]:univer-animate-out data-[state=closed]:univer-fade-out-0
                  data-[state=closed]:univer-zoom-out-95
                  data-[state=open]:univer-animate-in data-[state=open]:univer-fade-in-0
                  data-[state=open]:univer-zoom-in-95
                `,
                borderClassName,
                scrollbarClassName,
                className
            )}
            {...props}
        />
    );
}

function DropdownMenuContent({
    className,
    sideOffset = 4,
    ...props
}: ComponentProps<typeof Content>) {
    return (
        <Portal>
            <Content
                data-slot="dropdown-menu-content"
                sideOffset={sideOffset}
                className={clsx(
                    `
                      univer-z-[1080] univer-box-border univer-max-h-[var(--radix-popper-available-height)]
                      univer-overflow-y-auto univer-rounded-md univer-bg-white univer-p-1.5 univer-text-gray-900
                      univer-shadow-md
                      dark:univer-bg-gray-700 dark:univer-text-white
                      data-[side=bottom]:univer-slide-in-from-top-2
                      data-[side=left]:univer-slide-in-from-right-2
                      data-[side=right]:univer-slide-in-from-left-2
                      data-[side=top]:univer-slide-in-from-bottom-2
                      data-[state=closed]:univer-animate-out data-[state=closed]:univer-fade-out-0
                      data-[state=closed]:univer-zoom-out-95
                      data-[state=open]:univer-animate-in data-[state=open]:univer-fade-in-0
                      data-[state=open]:univer-zoom-in-95
                    `,
                    borderClassName,
                    scrollbarClassName,
                    className
                )}
                {...props}
            />
        </Portal>
    );
}

function DropdownMenuItem({
    className,
    inset,
    variant = 'default',
    ...props
}: ComponentProps<typeof Item> & {
    inset?: boolean;
    variant?: 'default' | 'destructive';
}) {
    return (
        <Item
            data-slot="dropdown-menu-item"
            data-inset={inset}
            data-variant={variant}
            className={clsx(
                `
                  univer-relative univer-flex univer-cursor-default univer-select-none univer-items-center univer-gap-2
                  univer-rounded univer-px-2 univer-py-1.5 univer-text-sm univer-outline-none univer-transition-colors
                  [&>svg]:univer-size-4 [&>svg]:univer-shrink-0
                  dark:focus:univer-bg-gray-600
                  data-[disabled]:univer-pointer-events-none data-[disabled]:univer-opacity-50
                  focus:univer-bg-gray-100
                `,
                className
            )}
            {...props}
        />
    );
}

function DropdownMenuCheckboxItem({
    className,
    children,
    hideIndicator,
    checked,
    ...props
}: ComponentProps<typeof CheckboxItem> & { hideIndicator?: boolean }) {
    return (
        <CheckboxItem
            data-slot="dropdown-menu-checkbox-item"
            className={clsx(
                `
                  univer-relative univer-flex univer-cursor-default univer-select-none univer-items-center
                  univer-rounded univer-py-1.5 univer-pr-2 univer-text-sm univer-outline-none univer-transition-colors
                  dark:focus:univer-bg-gray-600
                  data-[disabled]:univer-pointer-events-none data-[disabled]:univer-opacity-50
                  focus:univer-bg-gray-100
                `,
                {
                    'univer-pl-8': !hideIndicator,
                    'univer-pl-2': hideIndicator,
                },
                className
            )}
            checked={checked}
            {...props}
        >
            {!hideIndicator && (
                <span
                    className={`
                      univer-absolute univer-left-2 univer-flex univer-h-3.5 univer-w-3.5 univer-items-center
                      univer-justify-center
                    `}
                >
                    <ItemIndicator>
                        <CheckMarkSingle
                            className="univer-block univer-size-4 univer-fill-current univer-text-primary-600"
                        />
                    </ItemIndicator>
                </span>
            )}
            {children}
        </CheckboxItem>
    );
}

function DropdownMenuRadioItem({
    className,
    children,
    hideIndicator,
    ...props
}: ComponentProps<typeof RadioItem> & { hideIndicator?: boolean }) {
    return (
        <RadioItem
            data-slot="dropdown-menu-radio-item"
            className={clsx(
                `
                  univer-relative univer-flex univer-cursor-default univer-select-none univer-items-center
                  univer-rounded univer-py-1.5 univer-pr-2 univer-text-sm univer-outline-none univer-transition-colors
                  dark:focus:univer-bg-gray-600
                  data-[disabled]:univer-pointer-events-none data-[disabled]:univer-opacity-50
                  focus:univer-bg-gray-100
                `,
                {
                    'univer-pl-8': !hideIndicator,
                    'univer-pl-2': hideIndicator,
                },
                className
            )}
            {...props}
        >
            {!hideIndicator && (
                <span
                    className={`
                      univer-absolute univer-left-2 univer-flex univer-h-3.5 univer-w-3.5 univer-items-center
                      univer-justify-center
                    `}
                >

                    <ItemIndicator>
                        <CheckMarkSingle
                            className="univer-block univer-size-4 univer-fill-current univer-text-primary-600"
                        />
                    </ItemIndicator>
                </span>
            )}
            {children}
        </RadioItem>
    );
}

function DropdownMenuLabel({
    className,
    inset,
    ...props
}: ComponentProps<typeof Label> & {
    inset?: boolean;
}) {
    return (
        <Label
            data-slot="dropdown-menu-label"
            data-inset={inset}
            className={clsx(
                'univer-px-2 univer-py-1.5 univer-text-sm univer-font-semibold',
                className
            )}
            {...props}
        />
    );
}

function DropdownMenuSeparator({
    className,
    ...props
}: ComponentProps<typeof Separator>) {
    return (
        <Separator
            className={clsx('-univer-mx-1 univer-my-1 univer-h-px univer-bg-gray-200', className)}
            {...props}
        />
    );
}
function DropdownMenuShortcut({
    className,
    ...props
}: ComponentProps<'span'>) {
    return (
        <span
            className={clsx('univer-ml-auto univer-text-sm univer-tracking-widest univer-opacity-60', className)}
            {...props}
        />
    );
};

export {
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuPrimitive,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
};
