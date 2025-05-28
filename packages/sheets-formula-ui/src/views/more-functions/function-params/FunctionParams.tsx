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

import type { ReactElement } from 'react';
import { clsx } from '@univerjs/design';

interface IParamsProps {
    className?: string;
    title?: string | ReactElement;
    value?: string | ReactElement;
}

export function FunctionParams(props: IParamsProps) {
    const { className, value, title } = props;

    return (
        <div className="univer-mb-2 univer-text-xs">
            <div
                className={clsx(`
                  univer-mb-2 univer-font-medium univer-text-gray-500
                  dark:!univer-text-gray-300
                `, className)}
            >
                {title}
            </div>
            <div
                className={`
                  univer-break-all univer-text-gray-900
                  dark:!univer-text-white
                `}
            >
                {value}
            </div>
        </div>
    );
}
