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

import type { IFormulaSyntax } from '@univerjs/engine-formula';
import { LocaleService, RegionService, Univer } from '@univerjs/core';
import { getFormulaSyntax, LexerTreeBuilder } from '@univerjs/engine-formula';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { useFormulaEditorValue } from '../use-formula-editor-value';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

interface IValidationFormulaProps {
    syntax: IFormulaSyntax;
    draft: string;
    onChange: (formula: string) => void;
    onVerify: (valid: boolean, formula: string) => void;
}

function ValidationFormula({ syntax, draft, onChange, onVerify }: IValidationFormulaProps) {
    useFormulaEditorValue(syntax, draft, true, onChange, onVerify);
    return null;
}

describe('useFormulaEditorValue', () => {
    it('publishes canonical formula values and invalidates the previous rule when its separators are mixed', () => {
        vi.useFakeTimers();
        const univer = new Univer();
        const injector = univer.__getInjector();
        injector.get(RegionService).setRegion('es-ES');
        injector.add([LexerTreeBuilder]);
        const syntax = getFormulaSyntax(injector.get(RegionService), injector.get(LocaleService));
        const onChange = vi.fn();
        const onVerify = vi.fn();
        const root = createRoot(document.createElement('div'));
        onTestFinished(() => {
            act(() => root.unmount());
            univer.dispose();
            vi.useRealTimers();
        });

        const render = (draft: string) => act(() => root.render(
            <RediContext.Provider value={{ injector }}>
                <ValidationFormula syntax={syntax} draft={draft} onChange={onChange} onVerify={onVerify} />
            </RediContext.Provider>
        ));

        render('=');
        act(() => vi.advanceTimersByTime(500));
        render('=SUM(1,5;A1)');
        expect(onChange).toHaveBeenLastCalledWith('=SUM(1.5,A1)');
        expect(onVerify).toHaveBeenLastCalledWith(true, '=SUM(1.5,A1)');
        render('=SUM(1,5;A1,B1)');
        expect(onChange).toHaveBeenLastCalledWith('');
        expect(onVerify).toHaveBeenLastCalledWith(false, '');
    });
});
