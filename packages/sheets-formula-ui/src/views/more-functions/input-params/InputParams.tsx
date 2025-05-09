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

import type { IFunctionInfo, IFunctionParam } from '@univerjs/engine-formula';
import { borderLeftClassName, clsx } from '@univerjs/design';

import React, { useState } from 'react';
import { FunctionHelp } from '../function-help/FunctionHelp';
import { FunctionParams } from '../function-params/FunctionParams';

export interface IInputParamsProps {
    functionInfo: IFunctionInfo | null;
    onChange: (params: string[]) => void;
}

export function InputParams(props: IInputParamsProps) {
    const { functionInfo, onChange } = props;
    if (!functionInfo) return null;

    const [params, setParams] = useState<string[]>([]);
    const [functionParameter, setFunctionParameter] = useState<IFunctionParam[]>(functionInfo.functionParameter);
    const [activeIndex, setActiveIndex] = useState(-1);

    // TODO@Dushusir: Display description when all range selectors is canceled
    function handleChange(range: string, paramIndex: number) {
        const newParams = [...params];
        newParams[paramIndex] = range;
        setParams(newParams);
        onChange(newParams);
    }

    function handleActive(i: number) {
        if (i === functionParameter.length - 1 && functionParameter[i].repeat) {
            const newFunctionParameter = [...functionParameter];
            newFunctionParameter.push(functionParameter[i]);
            setFunctionParameter(newFunctionParameter);
        }

        setActiveIndex(i);
    }

    return (
        <div>
            <div className="univer-h-[364px] univer-overflow-y-auto">
                {functionParameter.map((item: IFunctionParam, i: number) => (
                    <div key={i}>
                        <div className="univer-text-sm">{item.name}</div>

                        <div className="univer-mb-2 univer-mt-1">
                            {/* <RangeSelector
                                onChange={(range: string) => handleChange(range, i)}
                                onActive={() => handleActive(i)}
                            /> */}
                        </div>
                    </div>
                ))}
            </div>

            <div className={clsx('univer-flex-1 univer-p-3', borderLeftClassName)}>
                <FunctionParams
                    title={activeIndex === -1
                        ? <FunctionHelp prefix={functionInfo.functionName} value={functionParameter} />
                        : functionParameter[activeIndex].name}
                    value={activeIndex === -1 ? functionInfo.description : functionParameter[activeIndex].detail}
                />
            </div>
        </div>
    );
}
