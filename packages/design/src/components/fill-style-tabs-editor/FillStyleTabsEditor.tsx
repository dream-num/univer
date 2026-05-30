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

import type { ReactNode } from 'react';
import type { IGradientValue } from '../gradient-color-picker/GradientColorPicker';
import { MoreDownIcon, PaintBucketDoubleIcon } from '@univerjs/icons';
import { useState } from 'react';
import { clsx } from '../../helper/clsx';
import { ColorPicker } from '../color-picker/ColorPicker';
import { Dropdown } from '../dropdown/Dropdown';
import { GradientColorPicker } from '../gradient-color-picker/GradientColorPicker';
import { InputNumber } from '../input-number/InputNumber';
import { Segmented } from '../segmented/Segmented';

type ItemValue = string | number;

export type FillStyleType = 'none' | 'solid' | 'gradient' | 'picture';

export interface IFillStyleTypeValues<T extends ItemValue = FillStyleType> {
    none: T;
    solid: T;
    gradient: T;
    picture: T;
}

export interface IFillStyleTabsEditorLabels {
    noFill: string;
    solidFill: string;
    gradientFill: string;
    pictureFill: string;
    color: string;
    transparency: string;
}

export interface IFillStyleTabsEditorProps<T extends ItemValue = FillStyleType> {
    className?: string;
    compact?: boolean;
    disabled?: boolean;
    value: T;
    typeValues?: IFillStyleTypeValues<T>;
    color?: string;
    transparency?: number;
    gradientValue?: IGradientValue;
    labels?: Partial<IFillStyleTabsEditorLabels>;
    tabLabels?: Partial<Pick<IFillStyleTabsEditorLabels, 'noFill' | 'solidFill' | 'gradientFill' | 'pictureFill'>>;
    noFillEditor?: ReactNode;
    pictureFillEditor?: ReactNode;
    onChange?: (value: T) => void;
    onColorChange?: (color: string) => void;
    onTransparencyChange?: (transparency: number) => void;
    onGradientChange?: (value: IGradientValue) => void;
}

const DEFAULT_LABELS: IFillStyleTabsEditorLabels = {
    noFill: 'None',
    solidFill: 'Solid',
    gradientFill: 'Gradient',
    pictureFill: 'Picture',
    color: 'Color',
    transparency: 'Transparency',
};

const DEFAULT_TYPE_VALUES: IFillStyleTypeValues = {
    none: 'none',
    solid: 'solid',
    gradient: 'gradient',
    picture: 'picture',
};

const DEFAULT_GRADIENT_VALUE: IGradientValue = {
    type: 'linear',
    angle: 90,
    stops: [
        { color: '#ffffff', offset: 0 },
        { color: '#000000', offset: 100 },
    ],
};

export function FillStyleTabsEditor<T extends ItemValue = FillStyleType>(props: IFillStyleTabsEditorProps<T>) {
    const {
        className,
        compact = true,
        disabled = false,
        value,
        typeValues = DEFAULT_TYPE_VALUES as IFillStyleTypeValues<T>,
        color = '#ffffff',
        transparency = 0,
        gradientValue = DEFAULT_GRADIENT_VALUE,
        labels: labelOverrides,
        tabLabels,
        noFillEditor,
        pictureFillEditor,
        onChange,
        onColorChange,
        onTransparencyChange,
        onGradientChange,
    } = props;

    const [colorPickerOpen, setColorPickerOpen] = useState(false);
    const labels = { ...DEFAULT_LABELS, ...labelOverrides };

    const handleTypeChange = (nextValue: T) => {
        if (disabled) {
            return;
        }

        onChange?.(nextValue);
    };

    return (
        <div
            className={clsx(
                'univer-flex univer-min-w-0 univer-flex-col',
                compact ? 'univer-gap-3' : 'univer-gap-4',
                className
            )}
        >
            <Segmented
                className={clsx(
                    'univer-w-full univer-min-w-0 univer-overflow-hidden',
                    disabled && 'univer-pointer-events-none univer-opacity-60'
                )}
                items={[
                    { label: tabLabels?.noFill ?? labels.noFill, value: typeValues.none },
                    { label: tabLabels?.solidFill ?? labels.solidFill, value: typeValues.solid },
                    { label: tabLabels?.gradientFill ?? labels.gradientFill, value: typeValues.gradient },
                    { label: tabLabels?.pictureFill ?? labels.pictureFill, value: typeValues.picture },
                ]}
                value={value}
                onChange={handleTypeChange}
            />

            {value === typeValues.none && noFillEditor}

            {value === typeValues.solid && (
                <div className={clsx('univer-flex univer-flex-col', compact ? 'univer-gap-2' : 'univer-gap-3')}>
                    <div className="univer-flex univer-items-center univer-justify-between univer-gap-3">
                        <span
                            className="

                              univer-shrink-0 univer-text-xs univer-text-gray-600

                              dark:!univer-text-gray-200

                            "
                        >
                            {labels.color}
                        </span>
                        <Dropdown
                            disabled={disabled}
                            overlay={(
                                <div className="univer-rounded-lg univer-p-3">
                                    <ColorPicker
                                        value={color}
                                        onChange={(nextColor) => {
                                            onColorChange?.(nextColor);
                                            setColorPickerOpen(false);
                                        }}
                                    />
                                </div>
                            )}
                            open={colorPickerOpen}
                            onOpenChange={setColorPickerOpen}
                        >
                            <a
                                className={`

                                  univer-flex univer-cursor-pointer univer-items-center univer-gap-1.5 univer-rounded

                                  univer-border univer-border-solid univer-border-gray-200 univer-px-2 univer-py-1

                                  univer-transition-colors

                                  hover:univer-border-primary-600 hover:univer-bg-gray-100

                                  dark:!univer-border-gray-600

                                  dark:hover:!univer-bg-gray-700

                                `}
                            >
                                <PaintBucketDoubleIcon
                                    className="univer-text-xl univer-text-gray-500"
                                    extend={{ colorChannel1: color }}
                                />
                                <MoreDownIcon
                                    className={clsx(
                                        'univer-text-gray-600 univer-transition-transform',
                                        { 'univer-rotate-180': colorPickerOpen }
                                    )}
                                />
                            </a>
                        </Dropdown>
                    </div>

                    <div className="univer-flex univer-items-center univer-justify-between univer-gap-3">
                        <span
                            className="

                              univer-shrink-0 univer-text-xs univer-text-gray-600

                              dark:!univer-text-gray-200

                            "
                        >
                            {labels.transparency}
                        </span>
                        <div className="univer-w-20">
                            <InputNumber
                                className="univer-w-full"
                                value={transparency}
                                disabled={disabled}
                                min={0}
                                max={100}
                                step={10}
                                formatter={(v) => `${v}%`}
                                parser={(v) => v?.replace('%', '') || ''}
                                onChange={(nextValue) => onTransparencyChange?.(nextValue ?? 0)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {value === typeValues.gradient && (
                <GradientColorPicker
                    compact={compact}
                    value={gradientValue}
                    onChange={onGradientChange}
                />
            )}

            {value === typeValues.picture && pictureFillEditor}
        </div>
    );
}
