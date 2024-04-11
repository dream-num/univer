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

import { FormLayout } from '@univerjs/design';
import React from 'react';

import { TextEditor } from '@univerjs/ui';
import type { IFormulaInputProps } from '@univerjs/data-validation';
import { createInternalEditorID } from '@univerjs/core';

export function CustomFormulaInput(props: IFormulaInputProps) {
    const { unitId, subUnitId, value, onChange, showError, validResult } = props;
    const formula1Res = showError ? validResult?.formula1 : '';

    return (
        <FormLayout error={formula1Res}>
            <TextEditor
                value={value?.formula1 ?? ''}
                id={createInternalEditorID(`dataValidation-custom-formula-${unitId}-${subUnitId}`)}
                onChange={(newValue) => {
                    onChange?.({
                        ...value,
                        formula1: newValue ?? '',
                    });
                }}
                onlyInputFormula
                openForSheetUnitId={unitId}
                openForSheetSubUnitId={subUnitId}
            />
        </FormLayout>
    );
}
