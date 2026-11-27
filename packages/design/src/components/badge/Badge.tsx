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
import type { ReactNode } from 'react';
import { CloseIcon } from '@univerjs/icons';
import { cva } from 'class-variance-authority';
import { useContext } from 'react';
import { focusClassName, resetButtonClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { ConfigContext } from '../config-provider/ConfigProvider';

const badgeVariants = cva(
    `
      univer-box-border univer-inline-flex univer-items-center univer-gap-1 univer-truncate univer-rounded-md
      univer-border univer-border-solid univer-px-2.5 univer-py-0.5 univer-text-xs univer-font-medium
    `,
    {
        variants: {
            variant: {
                default: `
                  univer-border-gray-200 univer-bg-gray-100 univer-text-gray-900
                  dark:!univer-border-gray-600 dark:!univer-bg-gray-700 dark:!univer-text-gray-100
                `,
                primary: `
                  univer-border-primary-200 univer-bg-primary-50 univer-text-primary-700
                  dark:!univer-border-primary-700 dark:!univer-bg-primary-900 dark:!univer-text-primary-200
                `,
                success: `
                  univer-border-green-200 univer-bg-green-50 univer-text-green-700
                  dark:!univer-border-green-700 dark:!univer-bg-green-900 dark:!univer-text-green-200
                `,
                warning: `
                  univer-border-yellow-200 univer-bg-yellow-50 univer-text-yellow-700
                  dark:!univer-border-yellow-700 dark:!univer-bg-yellow-900 dark:!univer-text-yellow-200
                `,
                danger: `
                  univer-border-red-200 univer-bg-red-50 univer-text-red-700
                  dark:!univer-border-red-700 dark:!univer-bg-red-900 dark:!univer-text-red-200
                `,
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface IBadgeProps extends VariantProps<typeof badgeVariants> {
    className?: string;
    children: ReactNode;
    closable?: boolean;
    onClose?: () => void;
}

export function Badge(props: IBadgeProps) {
    const { className, children, closable = false, onClose, variant = 'default' } = props;
    const { locale } = useContext(ConfigContext);

    return (
        <span
            data-u-comp="badge"
            className={clsx(badgeVariants({ variant }), className)}
        >
            <span className="univer-flex-1 univer-truncate">
                {children}
            </span>

            {closable && (
                <button
                    className={clsx(resetButtonClassName, focusClassName, `
                      univer-size-3.5 univer-shrink-0 univer-rounded-sm univer-text-current univer-transition-opacity
                      univer-duration-200
                      hover:univer-opacity-70
                      motion-reduce:univer-transition-none
                    `)}
                    type="button"
                    aria-label={locale?.Accessibility.closeBadge}
                    onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                    }}
                    onClick={(event) => {
                        event.stopPropagation();
                        onClose?.();
                    }}
                >
                    <CloseIcon aria-hidden="true" className="univer-size-3 univer-text-current" />
                </button>
            )}
        </span>
    );
}
