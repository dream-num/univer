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

import type { IFunctionInfo } from '@univerjs/engine-formula';
import type { Root } from 'react-dom/client';
import { FunctionType } from '@univerjs/engine-formula';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { InputParams } from '../InputParams';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const countIfInfo: IFunctionInfo = {
    functionName: 'COUNTIF',
    functionType: FunctionType.Statistical,
    description: 'Counts cells that meet a condition.',
    abstract: 'Conditional count.',
    functionParameter: [
        {
            name: 'range',
            detail: 'Cells to evaluate.',
            example: 'A1:A10',
            require: 1,
            repeat: 0,
        },
        {
            name: 'criterion',
            detail: 'Condition to apply.',
            example: '">5"',
            require: 0,
            repeat: 0,
        },
    ],
};

describe('InputParams', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
    });

    it('shows the selected function signature and description before a parameter is active', () => {
        const changes: string[][] = [];

        act(() => {
            root.render(<InputParams functionInfo={countIfInfo} onChange={(params) => changes.push(params)} />);
        });

        expect(container.textContent).toContain('range');
        expect(container.textContent).toContain('criterion');
        expect(container.textContent).toContain('COUNTIF(range,[criterion])');
        expect(container.textContent).toContain('Counts cells that meet a condition.');
        expect(changes).toEqual([]);
    });
});
