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
import { Injector, LocaleService, LocaleType } from '@univerjs/core';
import { RediContext } from '@wendellhu/redi/react-bindings';
import { afterEach, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { SymbolPicker } from '../SymbolPicker';

afterEach(cleanup);

it('reports a selected symbol to the menu', () => {
    const injector = new Injector([[LocaleService]]);
    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: enUS });
    localeService.setLocale(LocaleType.EN_US);
    localeService.setDirection('ltr');
    const onChange = vi.fn();
    const { getByRole } = render(
        <RediContext.Provider value={{ injector }}>
            <SymbolPicker embedded onChange={onChange} />
        </RediContext.Provider>
    );

    fireEvent.click(getByRole('button', { name: '∞' }));
    expect(onChange).toHaveBeenCalledWith('∞');
});
