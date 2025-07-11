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

import { memo, useCallback, useContext, useEffect, useState } from 'react';
import { isBrowser } from '../../helper/is-browser';
import { Button } from '../button/Button';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { Dialog } from '../dialog/Dialog';
import { hexToHsv, hsvToHex, hsvToRgb, rgbToHex } from './color-conversion';
import { ColorInput } from './ColorInput';
import { ColorPresets } from './ColorPresets';
import { ColorSpectrum } from './ColorSpectrum';
import { HueSlider } from './HueSlider';

const MemoizedColorSpectrum = memo(ColorSpectrum);
const MemoizedHueSlider = memo(HueSlider);
const MemoizedColorInput = memo(ColorInput);
const MemoizedColorPresets = memo(ColorPresets);

export interface IColorPickerProps {
    format?: 'hex';
    value?: string;
    onChange?: (value: string) => void;
}

export function ColorPicker({ format = 'hex', value = '#000000', onChange }: IColorPickerProps) {
    if (!isBrowser) return null;

    const { locale } = useContext(ConfigContext);

    const [hsv, setHsv] = useState<[number, number, number]>([0, 100, 100]);
    const [visible, setVisible] = useState(false);

    const getRgb = useCallback((h: number, s: number, v: number) => {
        return hsvToRgb(h, s, v);
    }, []);

    useEffect(() => {
        try {
            if (format === 'hex') {
                const [h, s, v] = value ? hexToHsv(value) : hsv;
                setHsv([h, s, v]);
            }
        } catch (error) {
            console.error('Invalid value:', error);
        }
    }, [value]);

    function handleColorChange(h: number, s: number, v: number) {
        setHsv([h, s, v]);
    }

    function handleColorChanged(h: number, s: number, v: number) {
        const [r, g, b] = getRgb(h, s, v);
        if (format === 'hex') {
            const hex = rgbToHex(r, g, b);
            onChange?.(hex);
        }
    }

    function handleConfirmCustomColor() {
        const [h, s, v] = hsv;
        const hex = hsvToHex(h, s, v);
        onChange?.(hex);
        setVisible(false);
    }

    return (
        <div
            data-u-comp="color-picker"
            className={`
              univer-cursor-default univer-space-y-2 univer-rounded-lg univer-bg-white
              dark:!univer-bg-gray-700
            `}
            onClick={(e) => e.stopPropagation()}
        >
            <MemoizedColorPresets
                hsv={hsv}
                onChange={(h, s, v) => {
                    handleColorChange(h, s, v);
                    handleColorChanged(h, s, v);
                }}
            />

            <div className="univer-flex univer-h-7 univer-items-center">
                <a
                    className={`
                      univer-cursor-pointer univer-gap-2 univer-text-sm univer-text-gray-900 univer-transition-opacity
                      hover:univer-opacity-80
                      dark:!univer-text-white
                    `}
                    onClick={() => setVisible(true)}
                >
                    {locale?.ColorPicker.more}
                </a>
            </div>

            <Dialog
                className="!univer-w-fit !univer-p-2.5"
                closable={false}
                maskClosable={false}
                open={visible}
                onOpenChange={setVisible}
            >
                <div className="univer-grid univer-w-64 univer-gap-2">
                    <MemoizedColorSpectrum
                        hsv={hsv}
                        onChange={handleColorChange}
                    />

                    <div className="univer-flex univer-items-center univer-gap-2">
                        <div
                            className="univer-size-6 univer-flex-shrink-0 univer-rounded-sm"
                            style={{
                                backgroundColor: hsvToHex(...hsv),
                            }}
                        />
                        <MemoizedHueSlider
                            hsv={hsv}
                            onChange={handleColorChange}
                        />
                    </div>

                    <MemoizedColorInput
                        hsv={hsv}
                        onChange={handleColorChange}
                    />

                    <footer className="univer-flex univer-items-center univer-justify-end univer-gap-2">
                        <Button onClick={() => setVisible(false)}>
                            {locale?.ColorPicker.cancel}
                        </Button>
                        <Button variant="primary" onClick={handleConfirmCustomColor}>
                            {locale?.ColorPicker.confirm}
                        </Button>
                    </footer>
                </div>
            </Dialog>
        </div>
    );
}
