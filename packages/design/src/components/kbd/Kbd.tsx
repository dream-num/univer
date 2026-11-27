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

import { Fragment } from 'react/jsx-runtime';
import { borderClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';

export interface IKBDProps {
    keyboard: string;
    className?: string;
}

export function KBD(props: IKBDProps) {
    const { keyboard, className } = props;

    const trimmed = keyboard.trim();
    const rawKeys = trimmed === '+'
        ? ['+']
        : keyboard
            .split('+')
            .map((key) => key.trim())
            .filter(Boolean);

    const keyCounts = new Map<string, number>();
    const keys = rawKeys.map((text) => {
        const count = (keyCounts.get(text) ?? 0) + 1;
        keyCounts.set(text, count);
        return {
            id: `${text}-${count}`,
            text,
        };
    });

    return (
        <span
            data-u-comp="kbd"
            className={clsx(`
              univer-inline-flex univer-select-none univer-items-center univer-gap-1 univer-whitespace-nowrap
            `, className)}
        >
            {keys.map(({ id, text }, index) => (
                <Fragment key={id}>
                    <kbd
                        className={clsx(`
                          univer-box-border univer-inline-flex univer-h-5 univer-min-w-5 univer-items-center
                          univer-justify-center univer-rounded univer-bg-gray-50 univer-px-1.5 univer-text-xs
                          univer-font-medium univer-leading-none univer-text-gray-700 univer-shadow-sm
                          dark:!univer-bg-gray-700 dark:!univer-text-gray-0
                        `, borderClassName)}
                    >
                        {text}
                    </kbd>
                    {index < keys.length - 1 && (
                        <span
                            aria-hidden="true"
                            className="
                              univer-text-xs univer-font-medium univer-leading-none univer-text-gray-500
                              dark:!univer-text-gray-300
                            "
                        >
                            +
                        </span>
                    )}
                </Fragment>
            ))}
        </span>
    );
}
