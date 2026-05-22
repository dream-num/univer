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

import type { CSSProperties, ReactNode } from 'react';
import { DownIcon } from '@univerjs/icons';
import { useId, useState } from 'react';
import { clsx } from '../../helper/clsx';

// ================= Panel =================
export interface IPanelProps {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
}

export function Panel(props: IPanelProps) {
    const { children, className, style } = props;
    return (
        <div
            data-u-comp="panel"
            className={clsx('univer-flex univer-flex-col univer-gap-5 univer-py-2', className)}
            style={style}
        >
            {children}
        </div>
    );
}

// ================= PanelSection =================
export interface IPanelSectionProps {
    title: ReactNode;
    children: ReactNode;
    className?: string;
    defaultExpanded?: boolean;
    collapsible?: boolean;
}

export function PanelSection(props: IPanelSectionProps) {
    const { title, children, className, defaultExpanded = true, collapsible = true } = props;
    const [expanded, setExpanded] = useState(defaultExpanded);
    const contentId = useId();
    const headerId = useId();

    return (
        <div
            data-u-comp="panel-section"
            className={clsx('univer-flex univer-flex-col', className)}
        >
            <button
                id={headerId}
                type="button"
                aria-expanded={expanded}
                aria-controls={contentId}
                disabled={!collapsible}
                className={clsx(`
                  univer-box-border univer-flex univer-w-full univer-items-center univer-gap-1.5 univer-border-none
                  univer-bg-transparent univer-p-0 univer-pb-2.5 univer-text-left univer-text-sm univer-font-medium
                  univer-text-gray-700
                  dark:!univer-text-gray-200
                `, {
                    'univer-cursor-pointer': collapsible,
                    'univer-cursor-default': !collapsible,
                })}
                onClick={() => collapsible && setExpanded((v) => !v)}
            >
                {collapsible && (
                    <DownIcon
                        className={clsx('univer-size-2.5 univer-flex-shrink-0 univer-transition-transform', {
                            '-univer-rotate-90': !expanded,
                            'univer-rotate-0': expanded,
                        })}
                    />
                )}
                <span>{title}</span>
            </button>

            <div
                id={contentId}
                role="region"
                aria-labelledby={headerId}
                className={clsx(`
                  univer-overflow-hidden univer-transition-[max-height,opacity] univer-duration-300 univer-ease-in-out
                `, {
                    'univer-max-h-[1000px] univer-opacity-100': expanded,
                    'univer-max-h-0 univer-opacity-0': !expanded,
                })}
            >
                <div className="univer-box-border univer-flex univer-flex-col univer-gap-3 univer-py-1">
                    {children}
                </div>
            </div>
        </div>
    );
}

// ================= PanelField =================
export interface IPanelFieldProps {
    label: ReactNode;
    children: ReactNode;
    className?: string;
    required?: boolean;
    error?: string;
}

export function PanelField(props: IPanelFieldProps) {
    const { label, children, className, required, error } = props;
    return (
        <div
            data-u-comp="panel-field"
            className={clsx('univer-flex univer-flex-col univer-gap-1.5', className)}
        >
            <div className="univer-flex univer-items-center univer-gap-1">
                <span
                    className={`
                      univer-text-xs univer-text-gray-600
                      dark:!univer-text-gray-300
                    `}
                >
                    {label}
                </span>
                {required && (
                    <span className="univer-text-xs univer-text-red-500">*</span>
                )}
            </div>
            <div className="univer-w-full">{children}</div>
            {error && (
                <span className="univer-text-xs univer-text-red-500">{error}</span>
            )}
        </div>
    );
}
