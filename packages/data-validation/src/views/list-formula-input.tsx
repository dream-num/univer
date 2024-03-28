/**
 * Copyright 2023-present DreamNum Inc.
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

import { RangeSelector } from '@univerjs/ui';
import React, { useState } from 'react';
import { FormLayout, Input, Radio, RadioGroup } from '@univerjs/design';
import { isReferenceString, serializeRange } from '@univerjs/engine-formula';
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { IRange } from '@univerjs/core';
import { LocaleService } from '@univerjs/core';
import type { IFormulaInputProps } from '../types';

function isRangeInValid(range: IRange) {
    return Number.isNaN(range.startColumn) || Number.isNaN(range.endColumn) || Number.isNaN(range.startRow) || Number.isNaN(range.endRow);
}

export function ListFormulaInput(props: IFormulaInputProps) {
    const { value, onChange, unitId, subUnitId } = props;
    const { formula1 = '', formula2 = '' } = value || {};
    const [isRefRange, setIsRefRange] = useState(() => isReferenceString(formula1) ? '1' : '0');
    const [refRange, setRefRange] = useState(isRefRange === '1' ? formula1 : undefined);
    const [strRange, setStrRange] = useState(isRefRange === '1' ? '' : formula1);
    const localeService = useDependency(LocaleService);

    return (
        <>
            <FormLayout label="选项来源">
                <RadioGroup value={isRefRange} onChange={(v) => setIsRefRange(v as string)}>
                    <Radio value="0">自定义</Radio>
                    <Radio value="1">引用数据</Radio>
                </RadioGroup>
            </FormLayout>
            <FormLayout>
                {isRefRange === '1'
                    ? (
                        <RangeSelector
                            id={`list-ref-range-${unitId}-${subUnitId}`}
                            value={refRange}
                            openForSheetUnitId={unitId}
                            openForSheetSubUnitId={subUnitId}
                            onChange={(ranges) => {
                                const range = ranges[0];
                                if (!range || isRangeInValid(range.range)) {
                                    onChange?.({
                                        formula1: '',
                                        formula2,
                                    });
                                    setRefRange('');
                                } else {
                                    const rangeStr = serializeRange(ranges[0].range);
                                    onChange?.({
                                        formula1: rangeStr,
                                        formula2,
                                    });
                                    setRefRange(rangeStr);
                                }
                            }}
                            isSingleChoice

                        />
                    )
                    : (
                        <Input
                            value={strRange}
                            onChange={(newValue) => {
                                setStrRange(newValue);
                                onChange?.({
                                    formula1: newValue,
                                    formula2,
                                });
                            }}
                            placeholder={localeService.t('dataValidation.list.strPlaceholder')}
                        />
                    )}
            </FormLayout>
        </>
    );
}
