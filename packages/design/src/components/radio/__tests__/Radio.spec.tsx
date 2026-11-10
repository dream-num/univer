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
import { afterEach, describe, expect, it } from 'vitest';
import { Radio } from '../Radio';

afterEach(cleanup);

describe('Radio', () => {
    it('keeps named options mutually exclusive using native radio behavior', () => {
        const { getByLabelText } = render(
            <>
                <Radio name="update-mode" value="pages">Page numbers</Radio>
                <Radio name="update-mode" value="all">Entire table</Radio>
            </>
        );
        const pages = getByLabelText('Page numbers') as HTMLInputElement;
        const all = getByLabelText('Entire table') as HTMLInputElement;
        fireEvent.click(pages);
        fireEvent.click(all);
        expect(pages.checked).toBe(false);
        expect(all.checked).toBe(true);
    });

    const component = <Radio value="0">text</Radio>;

    it('click Radio', () => {
        const { container } = render(component);

        fireEvent.click(container.querySelector('input')!);

        const $input = container.querySelector('input');

        expect($input?.checked).toBe(true);
    });
});
