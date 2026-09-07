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
import { clsx } from '../../helper/clsx';
import { Button } from './Button';

/** Active object states use the primary theme token in both light and dark themes. */
export function StateIconButton({ active, emphasizeActive = false, className, ...props }: ComponentProps<typeof Button> & { active: boolean; emphasizeActive?: boolean }) {
    return (
        <Button
            {...props}
            variant="ghost"
            size="icon"
            className={clsx(
                `
                  univer-size-7 univer-shrink-0
                  focus-visible:univer-outline focus-visible:univer-outline-2 focus-visible:univer-outline-offset-1
                  focus-visible:univer-outline-primary-500
                `,
                active
                    ? `
                      !univer-text-primary-600
                      dark:!univer-text-primary-400
                    `
                    : `
                      !univer-text-gray-500
                      hover:!univer-text-gray-900
                      focus-visible:!univer-text-gray-900
                      dark:!univer-text-gray-300
                      dark:hover:!univer-text-gray-100
                      dark:focus-visible:!univer-text-gray-100
                    `,
                active && emphasizeActive && `
                  !univer-border-primary-300 !univer-bg-primary-50
                  hover:!univer-bg-primary-100
                  dark:!univer-border-primary-700 dark:!univer-bg-primary-900 dark:!univer-text-primary-100
                  dark:hover:!univer-bg-primary-800
                `,
                className
            )}
        />
    );
}
