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
import type { ChangeEvent, ComponentProps } from 'react';
import { cva } from 'class-variance-authority';
import { forwardRef, useContext, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { borderClassName, inputStateClassName, scrollbarClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { FormLayoutContext } from '../form-layout/FormLayout';

const textareaVariants = cva(
    `
      univer-box-border univer-flex univer-w-full univer-resize univer-rounded-md univer-bg-gray-0 univer-text-gray-900
      univer-transition-[border-color,color,box-shadow] univer-duration-200
      placeholder:univer-text-gray-500
      enabled:hover:univer-border-gray-300
      disabled:univer-cursor-not-allowed disabled:univer-bg-gray-50 disabled:univer-text-gray-400
      disabled:univer-opacity-50
      motion-reduce:univer-transition-none
      dark:!univer-bg-gray-700 dark:!univer-text-gray-0
      dark:placeholder:univer-text-gray-300
      dark:enabled:hover:!univer-border-gray-500
      dark:disabled:!univer-bg-gray-800 dark:disabled:!univer-text-gray-500
    `,
    {
        variants: {
            size: {
                mini: 'univer-px-2 univer-py-1 univer-text-xs',
                small: 'univer-p-2 univer-text-sm',
                middle: 'univer-px-2.5 univer-py-2 univer-text-sm',
                large: 'univer-p-2.5 univer-text-base',
            },
        },
        defaultVariants: {
            size: 'small',
        },
    }
);

export interface ITextareaProps extends Omit<ComponentProps<'textarea'>, 'size'>, VariantProps<typeof textareaVariants> {
    className?: string;
    size?: 'mini' | 'small' | 'middle' | 'large';
    onResize?: (width: number, height: number) => void;
    onValueChange?: (value: string) => void;
}

export const Textarea = forwardRef<HTMLTextAreaElement, ITextareaProps>((props, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lastSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

    const { className, size = 'small', onResize, onValueChange, onChange, ...restProps } = props;
    const invalid = useContext(FormLayoutContext);

    useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement, []);

    useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (textarea && onResize) {
            const resizeObserver = new ResizeObserver((entries) => {
                const { width, height } = entries[0].target.getBoundingClientRect();

                if (width === 0 || height === 0) return;

                if (
                    lastSizeRef.current.width !== width ||
                    lastSizeRef.current.height !== height
                ) {
                    lastSizeRef.current = { width, height };
                    onResize(width, height);
                }
            });

            resizeObserver.observe(textarea);

            return () => {
                resizeObserver.unobserve(textarea);
                resizeObserver.disconnect();
            };
        }
    }, [onResize]);

    function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
        onChange?.(event);
        onValueChange?.(event.target.value);
    }

    return (
        <textarea
            ref={textareaRef}
            data-u-comp="textarea"
            data-slot="textarea"
            className={clsx(
                borderClassName,
                textareaVariants({ size }),
                inputStateClassName,
                scrollbarClassName,
                className
            )}
            {...restProps}
            onChange={handleChange}
            aria-invalid={restProps['aria-invalid'] ?? (invalid || undefined)}
        />
    );
});
