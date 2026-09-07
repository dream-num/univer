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

import type { KeyboardEvent } from 'react';
import type { IFontSizeProps } from './interface';
import { InputNumber } from '@univerjs/design';
import { useState } from 'react';
import { useObservable } from '../../utils/di';

export const FontSize = (props: IFontSizeProps) => {
    const { value, min, max, onChange, disabled$ } = props;
    const disabled = useObservable(disabled$);
    const [draft, setDraft] = useState<{ source: number; value: number | null } | null>(null);
    const inputValue = draft !== null && draft.source === value ? draft.value : Number(value ?? 0);

    function handleChange(nextValue: number | null) {
        setDraft({ source: value, value: nextValue });
    }

    function resetDraft() {
        setDraft(null);
    }

    function handleStopPropagation(e: KeyboardEvent<HTMLInputElement>) {
        e.stopPropagation();

        if (disabled || e.nativeEvent.isComposing) {
            return;
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            resetDraft();
        } else if (e.code === 'Enter') {
            resetDraft();
            if (inputValue !== null) {
                // Clamp on confirmation: a draft "2" must remain a valid prefix of "24".
                onChange(Math.min(max, Math.max(min, inputValue)));
            }
        }
    }

    return (
        <div className="univer-h-6 univer-w-7 univer-text-sm" onPointerDown={(event) => event.stopPropagation()}>
            <InputNumber
                className={`
                  univer-block univer-h-6 univer-border-none univer-bg-transparent univer-leading-6
                  [&_input:focus]:!univer-ring-0
                  [&_input]:univer-h-6 [&_input]:univer-w-7 [&_input]:univer-border-none
                  [&_input]:!univer-bg-transparent [&_input]:univer-p-0 [&_input]:univer-text-sm
                `}
                value={inputValue}
                controls={false}
                onKeyDown={handleStopPropagation}
                onChange={handleChange}
                onBlur={resetDraft}
                disabled={disabled}
            />
        </div>
    );
};
