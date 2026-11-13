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

export interface IFieldGroupProps {
    className?: string;
    children: ReactNode;
    disabled?: boolean;
    error?: ReactNode;
    help?: ReactNode;
    label: ReactNode;
}

export function FieldGroup(props: IFieldGroupProps) {
    const fieldId = useId();
    const hasHelp = props.help !== undefined && props.help !== null && typeof props.help !== 'boolean';
    const hasError = props.error !== undefined && props.error !== null && typeof props.error !== 'boolean';
    const helpId = hasHelp ? `${fieldId}-help` : undefined;
    const errorId = hasError ? `${fieldId}-error` : undefined;

    return (
        <fieldset
            aria-describedby={[helpId, errorId].filter(Boolean).join(' ') || undefined}
            aria-invalid={hasError || undefined}
            className={clsx('univer-m-0 univer-min-w-0 univer-border-0 univer-p-0', props.className)}
            disabled={props.disabled}
        >
            <legend
                className="
                  univer-mb-2 univer-w-full univer-p-0 univer-text-sm univer-text-gray-600
                  dark:!univer-text-gray-200
                "
            >
                {props.label}
            </legend>
            {props.children}
            {hasHelp && (
                <span
                    id={helpId}
                    className="
                      univer-mt-1 univer-block univer-text-xs univer-text-gray-500
                      dark:!univer-text-gray-400
                    "
                >
                    {props.help}
                </span>
            )}
            {hasError && (
                <span id={errorId} className="univer-mt-1 univer-block univer-text-xs univer-text-red-500">
                    {props.error}
                </span>
            )}
        </fieldset>
    );
}
