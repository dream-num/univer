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

import type { ComponentPropsWithoutRef, ElementRef, HTMLAttributes } from 'react';
import { Close, Content, Description, Overlay, Portal, Root, Title, Trigger } from '@radix-ui/react-dialog';
import { CloseSingle } from '@univerjs/icons';
import { forwardRef } from 'react';
import { borderClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';

const Dialog = Root;

const DialogTrigger = Trigger;

const DialogPortal = Portal;

const DialogClose = Close;

const DialogOverlay = forwardRef<
    ElementRef<typeof Overlay>,
    ComponentPropsWithoutRef<typeof Overlay>
>(({ className, ...props }, ref) => (
    <Overlay
        ref={ref}
        className={clsx(
            `
              univer-fixed univer-inset-0 univer-z-[1050] univer-bg-black/80
              data-[state=closed]:univer-animate-out data-[state=closed]:univer-fade-out-0
              data-[state=open]:univer-animate-in data-[state=open]:univer-fade-in-0
            `,
            className
        )}
        {...props}
    />
));
DialogOverlay.displayName = Overlay.displayName;

interface IDialogContentProps {
    closable?: boolean;
    onClickClose?: () => void;
}
const DialogContent = forwardRef<
    ElementRef<typeof Content>,
    ComponentPropsWithoutRef<typeof Content> & IDialogContentProps
>(({ className, children, closable = true, onClickClose, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <Content
            ref={ref}
            className={clsx(
                `
                  univer-fixed univer-left-1/2 univer-top-1/2 univer-z-[1050] univer-box-border univer-grid
                  univer-w-full univer-max-w-lg -univer-translate-x-1/2 -univer-translate-y-1/2 univer-gap-4
                  univer-bg-white univer-px-6 univer-py-4 univer-text-gray-500 univer-shadow-md univer-duration-200
                  dark:univer-bg-gray-700 dark:univer-text-gray-400
                  data-[state=closed]:univer-animate-out data-[state=closed]:univer-fade-out-0
                  data-[state=closed]:univer-zoom-out-95 data-[state=closed]:univer-slide-out-to-left-1/2
                  data-[state=closed]:univer-slide-out-to-top-[48%]
                  data-[state=open]:univer-animate-in data-[state=open]:univer-fade-in-0
                  data-[state=open]:univer-zoom-in-95 data-[state=open]:univer-slide-in-from-left-1/2
                  data-[state=open]:univer-slide-in-from-top-[48%]
                  sm:univer-rounded-lg
                `,
                borderClassName,
                className
            )}
            {...props}
        >
            {children}
            {closable && (
                <Close
                    className={`
                      univer-absolute univer-right-4 univer-top-4 univer-size-6 univer-cursor-pointer univer-rounded-sm
                      univer-border-none univer-bg-transparent univer-p-0 univer-transition-opacity
                      disabled:univer-pointer-events-none
                      hover:univer-opacity-100
                    `}
                    onClick={onClickClose}
                >
                    <CloseSingle className="univer-size-4 univer-text-gray-400" />
                    <span className="univer-sr-only">Close</span>
                </Close>
            )}
        </Content>
    </DialogPortal>
));
DialogContent.displayName = Content.displayName;

const DialogHeader = ({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) => (
    <div
        className={clsx(
            `
              univer-flex univer-flex-col univer-space-y-1.5 univer-text-center
              sm:univer-text-left
            `,
            className
        )}
        {...props}
    />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) => (
    <div
        className={clsx(
            `
              univer-flex univer-flex-col-reverse
              sm:univer-flex-row sm:univer-justify-end sm:univer-space-x-2
            `,
            className
        )}
        {...props}
    />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = forwardRef<
    ElementRef<typeof Title>,
    ComponentPropsWithoutRef<typeof Title>
>(({ className, ...props }, ref) => (
    <Title
        ref={ref}
        className={clsx(
            `
              univer-my-0 univer-text-lg univer-font-semibold univer-leading-none univer-tracking-tight
              univer-text-gray-900
              dark:univer-text-white
            `,
            className
        )}
        {...props}
    />
));
DialogTitle.displayName = Title.displayName;

const DialogDescription = forwardRef<
    ElementRef<typeof Description>,
    ComponentPropsWithoutRef<typeof Description>
>(({ className, ...props }, ref) => (
    <Description
        ref={ref}
        className={clsx('univer-text-sm univer-text-gray-500', className)}
        {...props}
    />
));
DialogDescription.displayName = Description.displayName;

export {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
};
