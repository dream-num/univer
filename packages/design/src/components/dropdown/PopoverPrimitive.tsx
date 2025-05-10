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
import { Anchor, Content, Portal, Root, Trigger } from '@radix-ui/react-popover';
import { borderClassName, scrollbarClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';

function PopoverPrimitive({
    ...props
}: ComponentProps<typeof Root>) {
    return <Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
    ...props
}: ComponentProps<typeof Trigger>) {
    return <Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
    className,
    align = 'center',
    sideOffset = 4,
    ...props
}: ComponentProps<typeof Content>) {
    return (
        <Portal>
            <Content
                data-slot="popover-content"
                align={align}
                sideOffset={sideOffset}
                className={clsx(
                    `
                      univer-z-[1080] univer-max-h-[var(--radix-popper-available-height)] univer-overflow-y-auto
                      univer-rounded-md univer-bg-white univer-text-gray-900 univer-shadow-md univer-outline-hidden
                      dark:univer-bg-gray-900 dark:univer-text-white
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

function PopoverAnchor({
    ...props
}: ComponentProps<typeof Anchor>) {
    return <Anchor data-slot="popover-anchor" {...props} />;
}

export { PopoverAnchor, PopoverContent, PopoverPrimitive, PopoverTrigger };
