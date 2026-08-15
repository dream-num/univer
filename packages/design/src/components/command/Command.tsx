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
import { SearchIcon } from '@univerjs/icons';
import { Command as CommandPrimitive } from 'cmdk';
import { clsx } from '../../helper/clsx';

export function Command({ className, ...props }: ComponentProps<typeof CommandPrimitive>) {
    return (
        <CommandPrimitive
            data-slot="command"
            className={clsx(`
              univer-flex univer-h-full univer-w-full univer-flex-col univer-overflow-hidden univer-rounded-md
              univer-bg-gray-0 univer-text-gray-900
              dark:!univer-bg-gray-700 dark:!univer-text-gray-0
            `, className)}
            {...props}
        />
    );
}

export function CommandInput({ className, ...props }: ComponentProps<typeof CommandPrimitive.Input>) {
    return (
        <div
            data-slot="command-input-wrapper"
            className={`
              univer-flex univer-h-10 univer-items-center univer-gap-2 univer-border-0 univer-border-b
              univer-border-solid univer-border-gray-200 univer-px-3
              dark:!univer-border-gray-600
              [&>svg]:univer-size-4 [&>svg]:univer-shrink-0 [&>svg]:univer-text-gray-400
            `}
        >
            <SearchIcon />
            <CommandPrimitive.Input
                data-slot="command-input"
                className={clsx(`
                  univer-h-10 univer-w-full univer-border-none univer-bg-transparent univer-text-sm univer-outline-none
                  placeholder:univer-text-gray-400
                `, className)}
                {...props}
            />
        </div>
    );
}

export function CommandList({ className, ...props }: ComponentProps<typeof CommandPrimitive.List>) {
    return (
        <CommandPrimitive.List
            data-slot="command-list"
            className={clsx(`
              univer-max-h-[300px] univer-overflow-y-auto univer-overflow-x-hidden univer-p-1 [scroll-padding-block:4px]
            `, className)}
            {...props}
        />
    );
}

export function CommandEmpty({ className, ...props }: ComponentProps<typeof CommandPrimitive.Empty>) {
    return (
        <CommandPrimitive.Empty
            data-slot="command-empty"
            className={clsx('univer-py-6 univer-text-center univer-text-sm univer-text-gray-500', className)}
            {...props}
        />
    );
}

export function CommandGroup({ className, ...props }: ComponentProps<typeof CommandPrimitive.Group>) {
    return (
        <CommandPrimitive.Group
            data-slot="command-group"
            className={clsx(`
              univer-overflow-hidden univer-p-1
              [&_[cmdk-group-heading]]:univer-px-2 [&_[cmdk-group-heading]]:univer-py-1.5
              [&_[cmdk-group-heading]]:univer-text-xs [&_[cmdk-group-heading]]:univer-font-medium
              [&_[cmdk-group-heading]]:univer-text-gray-500
            `, className)}
            {...props}
        />
    );
}

export function CommandItem({ className, ...props }: ComponentProps<typeof CommandPrimitive.Item>) {
    return (
        <CommandPrimitive.Item
            data-slot="command-item"
            className={clsx(`
              univer-relative univer-flex univer-cursor-default univer-select-none univer-items-center univer-gap-2
              univer-rounded univer-px-2 univer-py-1.5 univer-text-sm univer-outline-none
              data-[disabled=true]:univer-pointer-events-none
              data-[selected=true]:univer-bg-gray-100
              data-[disabled=true]:univer-opacity-50
              dark:data-[selected=true]:!univer-bg-gray-600
            `, className)}
            {...props}
        />
    );
}

export function CommandSeparator({ className, ...props }: ComponentProps<typeof CommandPrimitive.Separator>) {
    return (
        <CommandPrimitive.Separator
            data-slot="command-separator"
            className={clsx(`
              univer-my-1 univer-h-px univer-bg-gray-200
              dark:!univer-bg-gray-600
            `, className)}
            {...props}
        />
    );
}

export function CommandShortcut({ className, ...props }: ComponentProps<'span'>) {
    return (
        <span
            data-slot="command-shortcut"
            className={clsx(`
              univer-ml-auto univer-text-xs univer-tracking-widest univer-text-gray-400
              rtl:univer-ml-0 rtl:univer-mr-auto
            `, className)}
            {...props}
        />
    );
}
