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

import { cleanup, fireEvent, render } from '@testing-library/react';
import { useEffect, useRef, useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { InputNumber } from '../InputNumber';

function BlurOnControlledReset() {
    const [value, setValue] = useState(24);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (value === 11) {
            inputRef.current?.blur();
        }
    }, [value]);

    return (
        <InputNumber
            ref={inputRef}
            value={value}
            onKeyDown={(event) => {
                if (event.key === 'Escape') {
                    setValue(11);
                }
            }}
        />
    );
}

describe('InputNumber controlled reset', () => {
    afterEach(cleanup);

    it('keeps the new controlled value when focus leaves during reset effects', () => {
        const { container } = render(<BlurOnControlledReset />);
        const input = container.querySelector('input')!;
        input.focus();

        fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

        expect(input.value).toBe('11');
        expect(document.activeElement).not.toBe(input);
    });
});
