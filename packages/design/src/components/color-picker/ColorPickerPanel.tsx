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

import { useContext, useState } from 'react';
import { Button } from '../button/Button';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { hexToHsv, hsvToHex } from './color-conversion';
import { ColorInput } from './ColorInput';
import { ColorSpectrum } from './ColorSpectrum';
import { HueSlider } from './HueSlider';

export interface IColorPickerPanelProps {
    value?: string;
    confirmText?: string;
    onConfirm?: (value: string) => void;
}

export function ColorPickerPanel({ value = '#000000', confirmText, onConfirm }: IColorPickerPanelProps) {
    const { locale } = useContext(ConfigContext);
    const [hsv, setHsv] = useState<[number, number, number]>(() => hexToHsv(value));

    const color = hsvToHex(...hsv);

    return (
        <div data-u-comp="color-picker-panel" className="univer-grid univer-gap-4">
            <div className="univer-h-44 univer-overflow-hidden univer-rounded-lg">
                <ColorSpectrum hsv={hsv} onChange={(h, s, v) => setHsv([h, s, v])} />
            </div>
            <div className="univer-flex univer-items-center univer-gap-3">
                <span
                    className="
                      univer-size-10 univer-shrink-0 univer-rounded-lg univer-border univer-border-solid
                      univer-border-gray-200
                      dark:!univer-border-gray-600
                    "
                    style={{ backgroundColor: color }}
                />
                <div className="univer-flex-1">
                    <HueSlider hsv={hsv} onChange={(h, s, v) => setHsv([h, s, v])} />
                </div>
            </div>
            <ColorInput
                hsv={hsv}
                alpha={1}
                format="hex"
                onChange={(h, s, v) => setHsv([h, s, v])}
            />
            <Button className="!univer-h-11 !univer-w-full" variant="primary" onClick={() => onConfirm?.(color)}>
                {confirmText ?? locale?.ColorPicker.confirm}
            </Button>
        </div>
    );
}
