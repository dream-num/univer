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

import type { ReactNode } from 'react';
import { useId } from 'react';
import { clsx } from '../../helper/clsx';

export interface IFieldControlProps {
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
    'aria-labelledby'?: string;
    id: string;
}

export interface IFieldProps {
    className?: string;
    labelClassName?: string;
    children: ReactNode | ((controlProps: IFieldControlProps) => ReactNode);
    disabled?: boolean;
    error?: ReactNode;
    help?: ReactNode;
    label: ReactNode;
}

export function Field(props: IFieldProps) {
    const fieldId = useId();
    const labelId = `${fieldId}-label`;
    const hasHelp = props.help !== undefined && props.help !== null && typeof props.help !== 'boolean';
    const hasError = props.error !== undefined && props.error !== null && typeof props.error !== 'boolean';
    const helpId = hasHelp ? `${fieldId}-help` : undefined;
    const errorId = hasError ? `${fieldId}-error` : undefined;
    const descriptionIds = [helpId, errorId].filter(Boolean).join(' ') || undefined;
    const controlProps: IFieldControlProps = {
        id: `${fieldId}-control`,
        'aria-labelledby': labelId,
        'aria-describedby': descriptionIds,
        'aria-invalid': hasError || undefined,
    };
    const children = typeof props.children === 'function'
        ? props.children(controlProps)
        : props.children;

    return (
        <div
            aria-describedby={descriptionIds}
            aria-disabled={props.disabled || undefined}
            aria-invalid={hasError || undefined}
            aria-labelledby={labelId}
            className={clsx('univer-flex univer-min-w-0 univer-flex-1 univer-flex-col', props.className)}
            role="group"
        >
            <span
                id={labelId}
                className={clsx(`
                  univer-mb-2 univer-text-sm univer-text-gray-600
                  dark:!univer-text-gray-200
                `, props.labelClassName)}
            >
                {props.label}
            </span>
            {children}
            {hasHelp && (
                <span
                    id={helpId}
                    className="
                      univer-mt-1 univer-text-xs univer-text-gray-500
                      dark:!univer-text-gray-400
                    "
                >
                    {props.help}
                </span>
            )}
            {hasError && (
                <span id={errorId} className="univer-mt-1 univer-text-xs univer-text-red-500">
                    {props.error}
                </span>
            )}
        </div>
    );
}
