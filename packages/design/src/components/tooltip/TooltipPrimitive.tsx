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
import { Arrow, Content, Portal, Provider, Root, Trigger } from '@radix-ui/react-tooltip';
import { clsx } from '../../helper/clsx';

function TooltipProvider({
    delayDuration = 0,
    ...props
}: ComponentProps<typeof Provider>) {
    return (
        <Provider
            data-slot="tooltip-provider"
            delayDuration={delayDuration}
            {...props}
        />
    );
}

function TooltipPrimitive({
    ...props
}: ComponentProps<typeof Root>) {
    return (
        <TooltipProvider>
            <Root data-slot="tooltip" {...props} />
        </TooltipProvider>
    );
}

function TooltipTrigger({
    ...props
}: ComponentProps<typeof Trigger>) {
    return <Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
    className,
    sideOffset = 0,
    children,
    ...props
}: ComponentProps<typeof Content>) {
    return (
        <Portal>
            <Content
                data-slot="tooltip-content"
                sideOffset={sideOffset}
                className={clsx(
                    `
                      univer-z-[1080] univer-box-border univer-w-fit univer-text-balance univer-rounded-lg
                      univer-bg-gray-700 univer-px-3 univer-py-2.5 univer-text-xs univer-font-medium univer-text-white
                      univer-animate-in univer-fade-in-0 univer-zoom-in-95
                      data-[side=bottom]:univer-slide-in-from-top-2
                      data-[side=left]:univer-slide-in-from-right-2
                      data-[side=right]:univer-slide-in-from-left-2
                      data-[side=top]:univer-slide-in-from-bottom-2
                      data-[state=closed]:univer-animate-out data-[state=closed]:univer-fade-out-0
                      data-[state=closed]:univer-zoom-out-95
                    `,
                    className
                )}
                {...props}
            >
                {children}
                <Arrow
                    className={`
                      univer-z-[1080] univer-size-2.5 univer-translate-y-[calc(-50%_-_2px)] univer-rotate-45
                      univer-rounded-[2px] univer-bg-gray-700 univer-fill-gray-700
                    `}
                />
            </Content>
        </Portal>
    );
}

export { TooltipContent, TooltipPrimitive, TooltipProvider, TooltipTrigger };
