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

import type { ComponentPropsWithoutRef, ElementRef } from 'react';
import { Content, Portal, Root, Trigger } from '@radix-ui/react-hover-card';
import { forwardRef } from 'react';
import { borderClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';

const HoverCardPrimitive = Root;

const HoverCardPortal = Portal;

const HoverCardTrigger = Trigger;

const HoverCardContent = forwardRef<
    ElementRef<typeof Content>,
    ComponentPropsWithoutRef<typeof Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
    <Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={clsx(
            `
              data-[state=open]:univer-animate-in data-[state=open]:univer-fade-in-0 data-[state=open]:univer-zoom-in-95
              data-[state=closed]:univer-animate-out data-[state=closed]:univer-fade-out-0
              data-[state=closed]:univer-zoom-out-95
              data-[side=bottom]:univer-slide-in-from-top-2
              data-[side=left]:univer-slide-in-from-right-2
              data-[side=right]:univer-slide-in-from-left-2
              data-[side=top]:univer-slide-in-from-bottom-2
              univer-z-[1080] univer-w-64 univer-origin-[--radix-hover-card-content-transform-origin] univer-rounded-md
              univer-bg-white univer-text-gray-900 univer-shadow-md univer-outline-none
              dark:!univer-bg-gray-900 dark:!univer-text-white
            `,
            borderClassName,
            className
        )}
        {...props}
    />
));

HoverCardContent.displayName = Content.displayName;

export { HoverCardContent, HoverCardPortal, HoverCardPrimitive, HoverCardTrigger };
