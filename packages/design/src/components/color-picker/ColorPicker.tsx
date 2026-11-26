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

import { ColorWheelMultiIcon, MoreRightIcon } from '@univerjs/icons';
import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { isBrowser } from '../../helper/is-browser';
import { Button } from '../button/Button';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { AlphaSlider } from './AlphaSlider';
import {
    CHECKERBOARD_BACKGROUND_STYLE,
    hexToHsv,
    hsvToHex,
    hsvToRgba,
    parseRgba,
    rgbToHsv,
} from './color-conversion';
import { ColorInput } from './ColorInput';
import { ColorPresets } from './ColorPresets';
import { ColorSpectrum } from './ColorSpectrum';
import { HueSlider } from './HueSlider';

export interface IColorPickerProps {
    format?: 'hex' | 'rgba';
    value?: string;
    onChange?: (value: string) => void;
}

export function ColorPicker({ format = 'hex', value, onChange }: IColorPickerProps) {
    const { direction, locale } = useContext(ConfigContext);
    const [selectedColor, setSelectedColor] = useState(value);
    const [hsv, setHsv] = useState<[number, number, number]>([0, 0, 0]);
    const [alpha, setAlpha] = useState(1);
    const [custom, setCustom] = useState(false);
    const returnFocusRef = useRef(false);
    const moreButtonRef = useRef<HTMLButtonElement>(null);
    const customPanelRef = useRef<HTMLDivElement>(null);

    const resetDraft = useCallback((color?: string) => {
        try {
            if (format === 'hex') {
                setHsv(hexToHsv(color || '#000000'));
                setAlpha(1);
            } else {
                const [r, g, b, a] = parseRgba(color || 'rgba(0, 0, 0, 1)');
                setHsv(rgbToHsv(r, g, b));
                setAlpha(a);
            }
        } catch (error) {
            console.error('Invalid value:', error);
        }
    }, [format]);

    useEffect(() => {
        setSelectedColor(value);
        resetDraft(value);
    }, [value, resetDraft]);

    useLayoutEffect(() => {
        if (custom) {
            customPanelRef.current?.querySelector('input')?.focus();
        } else if (returnFocusRef.current) {
            moreButtonRef.current?.focus();
            returnFocusRef.current = false;
        }
    }, [custom]);

    if (!isBrowser) {
        return null;
    }

    function handleColorChange(h: number, s: number, v: number) {
        setHsv([h, s, v]);
    }

    function applyColor(h: number, s: number, v: number, a: number) {
        const color = format === 'hex' ? hsvToHex(h, s, v) : hsvToRgba(h, s, v, a);
        setSelectedColor(color);
        returnFocusRef.current = custom;
        setCustom(false);
        onChange?.(color);
    }

    function cancelCustomColor() {
        returnFocusRef.current = true;
        resetDraft(selectedColor);
        setCustom(false);
    }

    const previewColor = format === 'hex' ? hsvToHex(...hsv) : hsvToRgba(...hsv, alpha);

    return (
        <div
            data-u-comp="color-picker"
            dir={direction}
            className="univer-w-72 univer-max-w-full univer-cursor-default univer-rounded-lg"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
                if (custom) event.stopPropagation();
                if (custom && event.key === 'Escape') {
                    event.preventDefault();
                    cancelCustomColor();
                }
            }}
        >
            {custom
                ? (
                    <div
                        ref={customPanelRef}
                        className="univer-grid univer-gap-3"
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
                                event.preventDefault();
                                event.stopPropagation();
                                applyColor(...hsv, alpha);
                            }
                        }}
                    >
                        <div className="univer-h-40 univer-rounded-lg">
                            <ColorSpectrum hsv={hsv} onChange={handleColorChange} />
                        </div>
                        <div className="univer-flex univer-items-center univer-gap-3">
                            <span
                                aria-hidden="true"
                                className="
                                  univer-relative univer-size-9 univer-shrink-0 univer-overflow-hidden univer-rounded-md
                                  univer-bg-gray-0 univer-ring-1 univer-ring-inset univer-ring-black/10
                                  dark:!univer-bg-gray-700 dark:!univer-ring-white/15
                                "
                                style={CHECKERBOARD_BACKGROUND_STYLE}
                            >
                                <span
                                    className="univer-block univer-size-full"
                                    style={{ backgroundColor: previewColor }}
                                />
                            </span>
                            <div className="univer-flex-1 univer-space-y-2.5">
                                <HueSlider hsv={hsv} onChange={handleColorChange} />
                                {format === 'rgba' && <AlphaSlider hsv={hsv} alpha={alpha} onChange={setAlpha} />}
                            </div>
                        </div>
                        <ColorInput
                            hsv={hsv}
                            alpha={alpha}
                            format={format}
                            onChange={(h, s, v, a) => {
                                handleColorChange(h, s, v);
                                if (a !== undefined) setAlpha(a);
                            }}
                        />
                        <footer
                            className="
                              univer-flex univer-justify-end univer-gap-2 univer-border-0 univer-border-t
                              univer-border-solid univer-border-gray-100 univer-pt-2.5
                              dark:!univer-border-gray-600
                            "
                        >
                            <Button onClick={cancelCustomColor}>{locale?.ColorPicker.cancel}</Button>
                            <Button variant="primary" onClick={() => applyColor(...hsv, alpha)}>
                                {locale?.ColorPicker.confirm}
                            </Button>
                        </footer>
                    </div>
                )
                : (
                    <div className="univer-space-y-2">
                        <ColorPresets
                            hsv={selectedColor && alpha === 1 ? hsv : undefined}
                            onChange={(h, s, v) => {
                                handleColorChange(h, s, v);
                                setAlpha(1);
                                applyColor(h, s, v, 1);
                            }}
                        />
                        <div
                            className="
                              univer-border-0 univer-border-t univer-border-solid univer-border-gray-100 univer-pt-2
                              dark:!univer-border-gray-600
                            "
                        >
                            <Button
                                ref={moreButtonRef}
                                variant="ghost"
                                className="
                                  univer-w-full univer-justify-between univer-px-2 univer-font-normal
                                  hover:univer-bg-gray-100
                                  dark:hover:!univer-bg-gray-600
                                "
                                onClick={() => {
                                    resetDraft(selectedColor);
                                    setCustom(true);
                                }}
                            >
                                <span className="univer-inline-flex univer-items-center univer-gap-2">
                                    <ColorWheelMultiIcon aria-hidden="true" className="univer-size-4 univer-shrink-0" />
                                    {locale?.ColorPicker.more}
                                </span>
                                <span
                                    aria-hidden="true"
                                    className="univer-inline-flex univer-items-center univer-gap-1.5"
                                >
                                    {selectedColor && (
                                        <span
                                            className="
                                              univer-relative univer-size-4 univer-overflow-hidden univer-rounded
                                              univer-bg-gray-0 univer-ring-1 univer-ring-inset univer-ring-black/10
                                              dark:!univer-bg-gray-700 dark:!univer-ring-white/15
                                            "
                                            style={CHECKERBOARD_BACKGROUND_STYLE}
                                        >
                                            <span
                                                className="univer-block univer-size-full"
                                                style={{ backgroundColor: selectedColor }}
                                            />
                                        </span>
                                    )}
                                    <MoreRightIcon
                                        preserveStrokeWidth
                                        className="
                                          univer-size-3.5 univer-text-gray-400
                                          rtl:univer-rotate-180
                                        "
                                    />
                                </span>
                            </Button>
                        </div>
                    </div>
                )}
        </div>
    );
}
