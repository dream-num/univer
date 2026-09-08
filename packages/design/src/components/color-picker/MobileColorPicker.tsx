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

import type { IColorPickerProps } from './ColorPicker';
import { memo, useCallback, useContext, useEffect, useState } from 'react';
import { isBrowser } from '../../helper/is-browser';
import { MobileActionRowGroup } from '../action-row/MobileActionRowGroup';
import { Button } from '../button/Button';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { MobileDialog } from '../dialog/MobileDialog';
import { MobileDropdownCloseContext } from '../dropdown/MobileDropdown';
import { AlphaSlider } from './AlphaSlider';
import { hexToHsv, hsvToHex, hsvToRgb, hsvToRgba, parseRgba, rgbToHex, rgbToHsv } from './color-conversion';
import { ColorInput } from './ColorInput';
import { ColorSpectrum } from './ColorSpectrum';
import { HueSlider } from './HueSlider';
import { MobileColorPresets } from './MobileColorPresets';

const MemoizedColorSpectrum = memo(ColorSpectrum);
const MemoizedHueSlider = memo(HueSlider);
const MemoizedAlphaSlider = memo(AlphaSlider);
const MemoizedColorInput = memo(ColorInput);
const MemoizedMobileColorPresets = memo(MobileColorPresets);

export type IMobileColorPickerProps = IColorPickerProps;

export function MobileColorPicker({ format = 'hex', value, onChange }: IMobileColorPickerProps) {
    const { direction, locale } = useContext(ConfigContext);
    const closeMobileDropdown = useContext(MobileDropdownCloseContext);
    const [hsv, setHsv] = useState<[number, number, number]>([0, 100, 100]);
    const [alpha, setAlpha] = useState(1);
    const [visible, setVisible] = useState(false);
    const getRgb = useCallback((h: number, s: number, v: number) => hsvToRgb(h, s, v), []);

    useEffect(() => {
        try {
            const actualValue = value || (format === 'hex' ? '#000000' : 'rgba(0, 0, 0, 1)');
            if (format === 'hex') {
                setHsv(hexToHsv(actualValue));
                setAlpha(1);
            } else {
                const [r, g, b, a] = parseRgba(actualValue);
                setHsv(rgbToHsv(r, g, b));
                setAlpha(a);
            }
        } catch (error) {
            console.error('Invalid value:', error);
        }
    }, [format, value]);

    if (!isBrowser) {
        return null;
    }

    function handleColorChange(h: number, s: number, v: number) {
        setHsv([h, s, v]);
    }

    function handleColorChanged(h: number, s: number, v: number, a: number = alpha) {
        if (format === 'hex') {
            onChange?.(rgbToHex(...getRgb(h, s, v)));
        } else {
            const [r, g, b] = getRgb(h, s, v);
            onChange?.(`rgba(${r}, ${g}, ${b}, ${a})`);
        }
        closeMobileDropdown?.();
    }

    function handleConfirmCustomColor() {
        const [h, s, v] = hsv;
        setVisible(false);
        handleColorChanged(h, s, v, alpha);
    }

    return (
        <div
            data-u-comp="color-picker"
            data-presentation="mobile"
            dir={direction}
            className="univer-cursor-default univer-space-y-2 univer-rounded-lg"
            onClick={(event) => event.stopPropagation()}
        >
            <MemoizedMobileColorPresets
                value={hsvToHex(...hsv)}
                onSelect={(color) => {
                    const [h, s, v] = hexToHsv(color);
                    handleColorChange(h, s, v);
                    setAlpha(1);
                    handleColorChanged(h, s, v, 1);
                }}
            />

            <div className="univer-flex univer-h-12 univer-items-center">
                <button
                    type="button"
                    className="
                      univer-h-11 univer-w-full univer-cursor-pointer univer-rounded-xl univer-border-0
                      univer-bg-gray-100 univer-text-sm univer-font-medium univer-text-gray-900
                      active:univer-bg-gray-200
                      dark:!univer-bg-gray-800 dark:!univer-text-gray-0
                      dark:active:!univer-bg-gray-700
                    "
                    onClick={() => setVisible(true)}
                >
                    {locale?.ColorPicker.more}
                </button>
            </div>

            <MobileDialog
                className="!univer-z-[1420] !univer-p-2.5"
                overlayClassName="!univer-z-[1410]"
                closable={false}
                maskClosable={false}
                open={visible}
                onOpenChange={setVisible}
            >
                <div data-u-comp="mobile-color-picker-custom" className="univer-grid univer-w-full univer-gap-2">
                    <div className="univer-h-44 univer-w-full univer-overflow-hidden univer-rounded-lg">
                        <MemoizedColorSpectrum hsv={hsv} onChange={handleColorChange} />
                    </div>

                    <div className="univer-flex univer-items-center univer-gap-2">
                        <div
                            className="univer-size-6 univer-flex-shrink-0 univer-rounded-sm"
                            style={{ backgroundColor: format === 'hex' ? hsvToHex(...hsv) : hsvToRgba(...hsv, alpha) }}
                        />
                        <div className="univer-flex-1 univer-space-y-2">
                            <MemoizedHueSlider hsv={hsv} onChange={handleColorChange} />
                            {format === 'rgba' && (
                                <MemoizedAlphaSlider hsv={hsv} alpha={alpha} onChange={setAlpha} />
                            )}
                        </div>
                    </div>

                    <MemoizedColorInput
                        hsv={hsv}
                        alpha={alpha}
                        format={format}
                        onChange={(h, s, v, a) => {
                            handleColorChange(h, s, v);
                            if (a !== undefined) {
                                setAlpha(a);
                            }
                        }}
                    />

                    <MobileActionRowGroup>
                        <Button onClick={() => setVisible(false)}>{locale?.ColorPicker.cancel}</Button>
                        <Button variant="primary" onClick={handleConfirmCustomColor}>{locale?.ColorPicker.confirm}</Button>
                    </MobileActionRowGroup>
                </div>
            </MobileDialog>
        </div>
    );
}
