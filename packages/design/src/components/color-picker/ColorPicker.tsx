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

import { memo, useContext, useState } from 'react';
import { clsx } from '../../helper/clsx';
import { isBrowser } from '../../helper/is-browser';
import { Button } from '../button/Button';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { Dialog } from '../dialog/Dialog';
import { AlphaSlider } from './AlphaSlider';
import { hexToHsv, hsvToHex, hsvToRgb, hsvToRgba, parseRgba, rgbToHex, rgbToHsv } from './color-conversion';
import { ColorInput } from './ColorInput';
import { ColorPresets } from './ColorPresets';
import { ColorSpectrum } from './ColorSpectrum';
import { HueSlider } from './HueSlider';
import { MobileColorPresets } from './MobileColorPresets';

const MemoizedColorSpectrum = memo(ColorSpectrum);
const MemoizedHueSlider = memo(HueSlider);
const MemoizedAlphaSlider = memo(AlphaSlider);
const MemoizedColorInput = memo(ColorInput);
const MemoizedColorPresets = memo(ColorPresets);
const MemoizedMobileColorPresets = memo(MobileColorPresets);

export interface IColorPickerProps {
    format?: 'hex' | 'rgba';
    value?: string;
    onChange?: (value: string) => void;
}

export function ColorPicker({ format = 'hex', value, onChange }: IColorPickerProps) {
    const { direction, locale, mobile } = useContext(ConfigContext);

    function getDraftColor(): { hsv: [number, number, number]; alpha: number } {
        try {
            const actualValue = value || (format === 'hex' ? '#000000' : 'rgba(0, 0, 0, 1)');
            if (format === 'hex') {
                return { hsv: hexToHsv(actualValue), alpha: 1 };
            }

            const [r, g, b, alpha] = parseRgba(actualValue);
            return { hsv: rgbToHsv(r, g, b), alpha };
        } catch (error) {
            console.error('Invalid value:', error);
            return { hsv: [0, 100, 100], alpha: 1 };
        }
    }

    const [draftColor, setDraftColor] = useState(getDraftColor);
    const [previousSource, setPreviousSource] = useState({ format, value });
    const [visible, setVisible] = useState(false);

    if (format !== previousSource.format || value !== previousSource.value) {
        setPreviousSource({ format, value });
        setDraftColor(getDraftColor());
    }

    const { hsv, alpha } = draftColor;

    if (!isBrowser) return null;

    function handleColorChange(h: number, s: number, v: number) {
        setDraftColor((current) => ({ ...current, hsv: [h, s, v] }));
    }

    function handleAlphaChange(a: number) {
        setDraftColor((current) => ({ ...current, alpha: a }));
    }

    function handleColorChanged(h: number, s: number, v: number, a: number = alpha) {
        if (format === 'hex') {
            const [r, g, b] = hsvToRgb(h, s, v);
            const hex = rgbToHex(r, g, b);
            onChange?.(hex);
        } else if (format === 'rgba') {
            const [r, g, b] = hsvToRgb(h, s, v);
            onChange?.(`rgba(${r}, ${g}, ${b}, ${a})`);
        }
    }

    function handleConfirmCustomColor() {
        const [h, s, v] = hsv;
        if (format === 'hex') {
            const hex = hsvToHex(h, s, v);
            onChange?.(hex);
        } else if (format === 'rgba') {
            const [r, g, b] = hsvToRgb(h, s, v);
            onChange?.(`rgba(${r}, ${g}, ${b}, ${alpha})`);
        }
        setVisible(false);
    }

    return (
        <div
            data-u-comp="color-picker"
            dir={direction}
            className="univer-cursor-default univer-space-y-2 univer-rounded-lg"
            onClick={(e) => e.stopPropagation()}
        >
            {mobile
                ? (
                    <MemoizedMobileColorPresets
                        value={hsvToHex(...hsv)}
                        onSelect={(color) => {
                            const [h, s, v] = hexToHsv(color);
                            handleColorChange(h, s, v);
                            handleAlphaChange(1);
                            handleColorChanged(h, s, v, 1);
                        }}
                    />
                )
                : (
                    <MemoizedColorPresets
                        hsv={hsv}
                        onChange={(h, s, v) => {
                            handleColorChange(h, s, v);
                            handleAlphaChange(1);
                            handleColorChanged(h, s, v, 1);
                        }}
                    />
                )}

            <div className={clsx('univer-flex univer-items-center', mobile ? 'univer-h-12' : 'univer-h-7')}>
                <button
                    type="button"
                    className={clsx(`
                      univer-cursor-pointer univer-border-0 univer-text-sm univer-text-gray-900
                      dark:!univer-text-gray-0
                    `, mobile
                        ? `
                          univer-h-11 univer-w-full univer-rounded-xl univer-bg-gray-100 univer-font-medium
                          active:univer-bg-gray-200
                          dark:!univer-bg-gray-800
                          dark:active:!univer-bg-gray-700
                        `
                        : `
                          univer-bg-transparent univer-p-0 univer-transition-opacity
                          hover:univer-opacity-80
                        `)}
                    onClick={() => setVisible(true)}
                >
                    {locale?.ColorPicker.more}
                </button>
            </div>

            <Dialog
                className="!univer-z-[1090] !univer-w-fit !univer-p-2.5"
                overlayClassName="!univer-z-[1090]"
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
                                backgroundColor: format === 'hex' ? hsvToHex(...hsv) : hsvToRgba(...hsv, alpha),
                            }}
                        />
                        <div className="univer-flex-1 univer-space-y-2">
                            <MemoizedHueSlider
                                hsv={hsv}
                                onChange={handleColorChange}
                            />
                            {format === 'rgba' && (
                                <MemoizedAlphaSlider
                                    hsv={hsv}
                                    alpha={alpha}
                                    onChange={handleAlphaChange}
                                />
                            )}
                        </div>
                    </div>

                    <MemoizedColorInput
                        hsv={hsv}
                        alpha={alpha}
                        format={format}
                        onChange={(h, s, v, a) => {
                            handleColorChange(h, s, v);
                            if (a !== undefined) handleAlphaChange(a);
                        }}
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
