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

import type { VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { forwardRef } from 'react';
import { clsx } from '../../helper/clsx';

export const buttonVariants = cva(
    `
      univer-box-border univer-inline-flex univer-cursor-pointer univer-select-none univer-items-center
      univer-justify-center univer-gap-2 univer-whitespace-nowrap univer-rounded-md univer-border univer-border-solid
      univer-text-sm univer-font-medium univer-transition-colors
      [&_svg]:univer-pointer-events-none [&_svg]:univer-size-4 [&_svg]:univer-shrink-0
      disabled:univer-pointer-events-none disabled:univer-cursor-not-allowed disabled:univer-opacity-50
    `,
    {
        variants: {
            variant: {
                default: `
                  univer-border-gray-200 univer-bg-white univer-text-gray-700
                  active:univer-bg-gray-200
                  dark:univer-border-gray-600 dark:univer-bg-gray-700 dark:univer-text-white
                  dark:hover:univer-bg-gray-600 dark:active:univer-bg-gray-700
                  hover:univer-bg-gray-100
                `,
                primary: `
                  univer-border-primary-600 univer-bg-primary-600 univer-text-white
                  active:univer-bg-primary-700
                  hover:univer-bg-primary-500
                `,
                danger: `
                  univer-border-red-500 univer-bg-red-500 univer-text-white
                  active:univer-border-red-600 active:univer-bg-red-600
                  hover:univer-border-red-400 hover:univer-bg-red-400
                `,
                text: `
                  univer-border-transparent univer-bg-transparent univer-text-gray-900
                  active:univer-bg-gray-200
                  dark:univer-text-white dark:hover:univer-bg-gray-700 dark:active:univer-bg-gray-600
                  hover:univer-bg-gray-100
                `,
                link: `
                  univer-underline-current univer-border-transparent univer-bg-transparent univer-text-primary-600
                  univer-underline-offset-4
                  active:univer-text-primary-700
                  hover:univer-text-primary-500 hover:univer-underline
                `,
            },
            size: {
                small: 'univer-h-6 univer-rounded-md univer-px-1.5 univer-text-xs',
                middle: 'univer-h-8 univer-rounded-lg univer-px-2 univer-text-sm',
                large: 'univer-h-10 univer-rounded-lg univer-px-3 univer-text-sm',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'middle',
        },
    }
);

export interface IButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, IButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                className={clsx(buttonVariants({ variant, size, className }))}
                ref={ref}
                data-u-comp="button"
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';
