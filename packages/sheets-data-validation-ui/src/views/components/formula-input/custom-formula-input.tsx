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
import { FormulaEditor } from '@univerjs/sheets-formula-ui';
import { useSidebarClick } from '@univerjs/ui';
import React, { useRef, useState } from 'react';

export function CustomFormulaInput(props: IFormulaInputProps) {
    const { unitId, subUnitId, value, onChange, showError, validResult } = props;
    const formula1Res = showError ? validResult?.formula1 : undefined;
    const formulaEditorActionsRef = useRef<Parameters<typeof FormulaEditor>[0]['actions']>({});
    const [isFocusFormulaEditor, isFocusFormulaEditorSet] = useState(false);

    useSidebarClick((e: MouseEvent) => {
        const handleOutClick = formulaEditorActionsRef.current?.handleOutClick;
        handleOutClick && handleOutClick(e, () => isFocusFormulaEditorSet(false));
    });

    return (
        <FormulaEditor
            initValue={value?.formula1 ?? '=' as any}
            unitId={unitId}
            subUnitId={subUnitId}
            isFocus={isFocusFormulaEditor}
            onChange={(newValue) => {
                const newFormula = (newValue ?? '').trim();
                if (newFormula === value?.formula1) {
                    return;
                }

                onChange?.({
                    ...value,
                    formula1: newFormula,
                });
            }}
            errorText={formula1Res}
            onFocus={() => isFocusFormulaEditorSet(true)}
            actions={formulaEditorActionsRef.current}
            isSupportAcrossSheet
        />
    );
}
