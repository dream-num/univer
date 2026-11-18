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

/**
 * @vitest-environment jsdom
 */

import { cleanup, fireEvent, render } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IGradientValue } from '../GradientColorPicker';
import enUS from '../../../locale/en-US';
import { ConfigProvider } from '../../config-provider/ConfigProvider';
import { MobileGradientColorPicker } from '../MobileGradientColorPicker';
import '@testing-library/jest-dom/vitest';

beforeEach(() => {
    vi.stubGlobal('CSS', { ...globalThis.CSS, supports: () => false });
    vi.stubGlobal('ResizeObserver', class {
        observe() {}
        unobserve() {}
        disconnect() {}
    });
});
afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

const defaultValue: IGradientValue = {
    type: 'linear',
    stops: [
        { color: '#ffffff', offset: 0 },
        { color: '#000000', offset: 100 },
    ],
    angle: 0,
};

function Editor({ onChange }: { onChange: (value: IGradientValue) => void }) {
    const [value, setValue] = useState(defaultValue);
    return (
        <ConfigProvider mountContainer={document.body} locale={enUS.design}>
            <MobileGradientColorPicker
                value={value}
                types={['linear']}
                onChange={(next) => {
                    setValue(next);
                    onChange(next);
                }}
            />
        </ConfigProvider>
    );
}

describe('mobile GradientColorPicker', () => {
    it('updates the selected stop, adds and removes stops without desktop hover controls', () => {
        const onChange = vi.fn();
        const view = render(<Editor onChange={onChange} />);
        expect(view.queryByText(enUS.design.GradientColorPicker.radial)).toBeNull();
        fireEvent.click(view.getByRole('button', { name: enUS.design.GradientColorPicker.add }));
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ stops: [defaultValue.stops[0], defaultValue.stops[1], { ...defaultValue.stops[0], offset: 50 }] }));
        expect(view.getByRole('button', { name: `${enUS.design.GradientColorPicker.offset} 50%` })).toHaveAttribute('aria-pressed', 'true');
        fireEvent.change(view.getByLabelText(enUS.design.GradientColorPicker.angle), { target: { value: '180' } });
        fireEvent.change(view.getByLabelText(enUS.design.GradientColorPicker.offset), { target: { value: '60' } });
        fireEvent.change(view.getByLabelText(enUS.design.GradientColorPicker.transparency), { target: { value: '40' } });
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ angle: 180, stops: expect.arrayContaining([{ color: '#ffffff', offset: 60, opacity: 0.6 }]) }));
        fireEvent.click(view.getByRole('button', { name: enUS.design.GradientColorPicker.delete }));
        expect(onChange).toHaveBeenLastCalledWith({ ...defaultValue, angle: 180 });
        expect(view.getByRole('button', { name: enUS.design.GradientColorPicker.delete })).toBeDisabled();
    });

    it('supports every registered gradient type and controlled value updates', () => {
        const onChange = vi.fn();
        const view = render(<ConfigProvider mountContainer={document.body} locale={enUS.design}><MobileGradientColorPicker value={defaultValue} onChange={onChange} /></ConfigProvider>);
        for (const type of ['linear', 'radial', 'angular', 'diamond'] as const) {
            fireEvent.click(view.getByRole('button', { name: enUS.design.GradientColorPicker[type] }));
            expect(onChange).toHaveBeenLastCalledWith({ ...defaultValue, type });
        }
        view.rerender(<ConfigProvider mountContainer={document.body} locale={enUS.design}><MobileGradientColorPicker value={{ ...defaultValue, type: 'radial' }} onChange={onChange} /></ConfigProvider>);
        expect(view.getByRole('button', { name: enUS.design.GradientColorPicker.radial })).toHaveAttribute('aria-pressed', 'true');
        expect(view.queryByLabelText(enUS.design.GradientColorPicker.angle)).toBeNull();
    });
});
