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

import { Input } from '@univerjs/design';
import { useState } from 'react';

interface IRuleNumberInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
    className?: string;
}

export function RuleNumberInput({ value, onChange, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER, disabled, className }: IRuleNumberInputProps) {
    const [draftState, setDraftState] = useState({ value, text: String(value) });
    if (!Object.is(draftState.value, value)) {
        setDraftState({ value, text: String(value) });
    }
    const draft = draftState.text;
    const setDraft = (text: string) => setDraftState({ value, text });

    return (
        <Input
            className={className}
            disabled={disabled}
            inputMode="decimal"
            value={draft}
            aria-invalid={!Number.isFinite(Number(draft))}
            onChange={(next) => {
                setDraft(next);
                const number = Number(next);
                if (Number.isFinite(number)) {
                    const bounded = Math.min(max, Math.max(min, number));
                    if (bounded !== number) {
                        setDraft(String(bounded));
                    }
                    onChange(bounded);
                }
            }}
            onBlur={() => setDraft(String(value))}
        />
    );
}
