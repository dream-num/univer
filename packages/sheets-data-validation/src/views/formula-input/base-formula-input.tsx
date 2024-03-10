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

import type { IFormulaInputProps } from '@univerjs/data-validation';
import { Input } from '@univerjs/design';
import React from 'react';

export const BaseFormulaInput = (props: IFormulaInputProps) => {
    const { isTwoFormula = false, value, onChange } = props;

    if (isTwoFormula) {
        return (
            <>
                <Input
                    placeholder="Value or formula"
                    value={value?.formula1}
                    onChange={(newValue) => {
                        onChange?.({
                            ...value,
                            formula1: newValue,
                        });
                    }}
                />
                <div>
                    and
                </div>
                <Input
                    placeholder="Value or formula"
                    value={value?.formula2}
                    onChange={(newValue) => {
                        onChange?.({
                            ...value,
                            formula2: newValue,
                        });
                    }}
                />
            </>
        );
    }

    return (
        <Input
            placeholder="Value or formula"
            value={value?.formula1}
            onChange={(newValue) => {
                onChange?.({ formula1: newValue });
            }}
        />
    );
};
