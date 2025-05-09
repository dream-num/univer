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

    const keys = keyboard.split('+');

    return (
        <span
            className={clsx(`
              univer-inline-block univer-h-6 univer-select-none univer-rounded-md univer-bg-gray-50 univer-px-2
              univer-font-mono univer-text-xs/6 univer-font-medium univer-text-gray-700
              dark:univer-bg-gray-700 dark:univer-text-white
            `, borderClassName, className)}
        >
            {keys.map((text, index) => (
                <Fragment key={index}>
                    <kbd
                        className="univer-inline-block univer-h-full"
                    >
                        {text}
                    </kbd>
                    {index < keys.length - 1 && (
                        <span className="univer-inline-block univer-h-full univer-px-1">
                            +
                        </span>
                    )}
                </Fragment>
            ))}
        </span>
    );
}
