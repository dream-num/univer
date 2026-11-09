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

import type { ChangeEvent, ComponentProps } from 'react';
import { forwardRef, useContext, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import { borderClassName, inputStateClassName, scrollbarClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { FormLayoutContext } from '../form-layout/FormLayout';

interface ITextareaProps extends ComponentProps<'textarea'> {
    className?: string;
    size?: 'small' | 'large';
    onResize?: (width: number, height: number) => void;
    onValueChange?: (value: string) => void;
}

export const Textarea = forwardRef<HTMLTextAreaElement, ITextareaProps>((props, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lastSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

    const { className, size = 'small', onResize, onValueChange, ...restProps } = props;
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
        const value = event.target.value;
        onValueChange?.(value);
    }

    return (
        <textarea
            ref={textareaRef}
            data-u-comp="textarea"
            data-slot="textarea"
            className={clsx(
                `
                  univer-box-border univer-flex univer-w-full univer-resize univer-rounded-md univer-bg-gray-0
                  univer-p-2 univer-text-sm univer-text-gray-900 univer-transition-[color,box-shadow]
                  placeholder:univer-text-gray-500
                  disabled:univer-cursor-not-allowed disabled:univer-opacity-50
                  dark:!univer-bg-gray-700 dark:!univer-text-gray-0
                  dark:placeholder:univer-text-gray-300
                `,
                borderClassName,
                inputStateClassName,
                scrollbarClassName,
                size === 'large' && 'univer-text-base',
                className
            )}
            onChange={handleChange}
            {...restProps}
            aria-invalid={restProps['aria-invalid'] ?? (invalid || undefined)}
        />
    );
});
