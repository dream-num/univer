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

import type { IFormulaInputProps } from '@univerjs/data-validation';
import type { IFormulaEditorRef } from '@univerjs/sheets-formula-ui';
import { borderClassName, clsx, FormLayout } from '@univerjs/design';
import { FormulaEditor } from '@univerjs/sheets-formula-ui';
import { useSidebarClick } from '@univerjs/ui';
import { useRef, useState } from 'react';

export function CustomFormulaInput(props: IFormulaInputProps) {
    const { unitId, subUnitId, value, onChange, showError, validResult } = props;
    const formula1Res = showError ? validResult?.formula1 : undefined;
    const formulaEditorRef = useRef<IFormulaEditorRef>(null);
    const [isFocusFormulaEditor, isFocusFormulaEditorSet] = useState(false);

    useSidebarClick((e: MouseEvent) => {
        const isOutSide = formulaEditorRef.current?.isClickOutSide(e);
        isOutSide && isFocusFormulaEditorSet(false);
    });

    return (
        <FormLayout error={formula1Res}>
            <FormulaEditor
                ref={formulaEditorRef}
                className={clsx(`
                  univer-box-border univer-h-8 univer-w-full univer-cursor-pointer univer-items-center univer-rounded-lg
                  univer-bg-white univer-pt-2 univer-transition-colors
                  [&>div:first-child]:univer-px-2.5
                  [&>div]:univer-h-5 [&>div]:univer-ring-transparent
                  dark:univer-bg-gray-700 dark:univer-text-white
                  hover:univer-border-primary-600
                `, borderClassName)}
                initValue={value?.formula1 ?? '=' as any}
                unitId={unitId}
                subUnitId={subUnitId}
                isFocus={isFocusFormulaEditor}
                isSupportAcrossSheet
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
                onFocus={() => isFocusFormulaEditorSet(true)}
            />
        </FormLayout>
    );
}
