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
import { afterEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { ColorPickerPanel } from '../ColorPickerPanel';

afterEach(cleanup);

describe('ColorPickerPanel', () => {
    it('commits a custom color only when the apply button is clicked', () => {
        const onConfirm = vi.fn();
        const { getByRole } = render(
            <ConfigProvider locale={enUS.design} mountContainer={document.body}>
                <ColorPickerPanel value="#3F83F8" onConfirm={onConfirm} />
            </ConfigProvider>
        );

        expect(onConfirm).not.toHaveBeenCalled();
        fireEvent.click(getByRole('button', { name: enUS.design.ColorPicker.confirm }));
        expect(onConfirm).toHaveBeenCalledWith('#3f83f8');
    });
});
