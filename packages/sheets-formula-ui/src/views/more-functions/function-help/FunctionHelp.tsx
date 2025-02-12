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

import type { IFunctionParam } from '@univerjs/engine-formula';
import React from 'react';
import { generateParam } from '../../../services/utils';

interface IFunctionHelpProps {
    prefix?: string;
    value?: IFunctionParam[];
}

/**
 * Determine the parameter format
 * ┌─────────┬────────┬─────────────┐
 * │ Require │ Repeat │  Parameter  │
 * ├─────────┼────────┼─────────────┤
 * │ 0       │ 0      │ [Number]    │
 * │ 1       │ 0      │ Number      │
 * │ 0       │ 1      │ [Number,...] │
 * │ 1       │ 1      │ Number,...   │
 * └─────────┴────────┴─────────────┘
 *
 * @param props
 * @returns
 */
export function FunctionHelp(props: IFunctionHelpProps) {
    const { prefix, value } = props;

    return (
        <div>
            <span>
                {prefix}
                (
            </span>
            {value &&
                value.map((item: IFunctionParam, i: number) => (
                    <span key={i}>
                        <span>{generateParam(item)}</span>
                        {i === value.length - 1 ? '' : ','}
                    </span>
                ))}
            )
        </div>
    );
}
