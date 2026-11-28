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

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { MobileFormulaBarOverlays } from '../MobileFormulaBarControls';

describe('MobileFormulaBarOverlays', () => {
    it.each([',', ';'])('inserts the current argument separator %s from the operator keypad', (argumentSeparator) => {
        vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
        const container = document.createElement('div');
        const root = createRoot(container);
        onTestFinished(() => {
            act(() => root.unmount());
            vi.unstubAllGlobals();
        });
        const insert = vi.fn();
        act(() => root.render(
            <MobileFormulaBarOverlays expanded={false} formulaActive operatorsVisible argumentSeparator={argumentSeparator} editorId="editor" onOperator={insert} />
        ));
        const button = container.querySelector<HTMLButtonElement>(`button[aria-label="${argumentSeparator}"]`);
        expect(button?.textContent).toBe(argumentSeparator);
        button!.click();
        expect(insert).toHaveBeenCalledWith(argumentSeparator);
    });
});
