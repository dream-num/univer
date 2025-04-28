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

import type { ITextWatermarkConfig } from '@univerjs/engine-render';
import { LocaleService } from '@univerjs/core';
import { Checkbox, clsx, ColorPicker, Dropdown, Input, InputNumber, Select } from '@univerjs/design';
import { BoldSingle, FontColor, ItalicSingle } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';

interface IWatermarkTextSettingProps {
    config?: ITextWatermarkConfig;
    onChange: (config: ITextWatermarkConfig) => void;
}

export function WatermarkTextSetting(props: IWatermarkTextSettingProps) {
    const { config, onChange } = props;
    const localeService = useDependency(LocaleService);

    if (!config) return null;

    return (
        <div className="univer-grid univer-gap-2">
            <div className="univer-text-gray-400">{localeService.t('univer-watermark.style')}</div>

            <div className="univer-mb-4 univer-grid univer-gap-1">
                <div>{localeService.t('univer-watermark.content')}</div>
                <Input
                    value={config.content}
                    onChange={(val) => onChange({ ...config, content: val })}
                    placeholder={localeService.t('univer-watermark.textPlaceholder')}
                />
            </div>

            <div className="univer-grid univer-gap-4">
                <div className="univer-flex univer-gap-2">
                    <div className="univer-grid univer-gap-1">
                        <div>{localeService.t('univer-watermark.fontSize')}</div>
                        <InputNumber
                            value={config.fontSize}
                            max={72}
                            min={12}
                            onChange={(val) => {
                                if (val != null) {
                                    onChange({ ...config, fontSize: Number.parseInt(val.toString()) });
                                }
                            }}
                        />
                    </div>

                    <div className="univer-grid univer-gap-1">
                        <div>{localeService.t('univer-watermark.direction')}</div>
                        <Select
                            value={config.direction}
                            options={[
                                { label: localeService.t('univer-watermark.ltr'), value: 'ltr' },
                                { label: localeService.t('univer-watermark.rtl'), value: 'rtl' },
                            ]}
                            onChange={(v) => onChange({ ...config, direction: v as 'ltr' | 'rtl' })}
                        />
                    </div>

                    <div className="univer-grid univer-gap-1">
                        <div>{localeService.t('univer-watermark.opacity')}</div>
                        <InputNumber
                            max={1}
                            min={0}
                            step={0.05}
                            value={config.opacity}
                            onChange={(val) => {
                                if (val != null) {
                                    onChange({ ...config, opacity: Number.parseFloat(val.toString()) });
                                }
                            }}
                        />
                    </div>
                </div>

                <div
                    className={`
                      univer-flex univer-justify-around univer-gap-4
                      [&_a]:univer-flex [&_a]:univer-size-6 [&_a]:univer-items-center [&_a]:univer-justify-center
                      [&_a]:univer-rounded
                    `}
                >
                    <Dropdown
                        overlay={(
                            <div className="univer-rounded-lg univer-p-4">
                                <ColorPicker value={config.color} onChange={(val) => onChange({ ...config, color: val })} />
                            </div>
                        )}
                    >
                        <a className="hover:univer-bg-gray-100">
                            <FontColor extend={{ colorChannel1: config.color ?? '#2c53f1' }} />
                        </a>
                    </Dropdown>
                    <a
                        className={clsx('hover:univer-bg-gray-100', {
                            'univer-bg-gray-200': config.bold,
                        })}
                        onClick={() => { onChange({ ...config, bold: !config.bold }); }}
                    >
                        <BoldSingle />
                    </a>
                    <a
                        className={clsx('hover:univer-bg-gray-100', {
                            'univer-bg-gray-200': config.italic,
                        })}
                        onClick={() => { onChange({ ...config, italic: !config.italic }); }}
                    >
                        <ItalicSingle />
                    </a>
                </div>
            </div>

            {/* Layout */}
            <div className="univer-text-gray-400">{localeService.t('univer-watermark.layout')}</div>

            <div className="univer-grid univer-gap-2 univer-text-center">
                <div className="univer-flex univer-gap-2">
                    <div className="univer-grid univer-flex-1 univer-gap-1">
                        <div>{localeService.t('univer-watermark.rotate')}</div>
                        <InputNumber
                            value={config.rotate}
                            max={360}
                            min={-360}
                            onChange={(val) => {
                                if (val != null) {
                                    onChange({ ...config, rotate: Number.parseInt(val.toString()) });
                                }
                            }}
                        />
                    </div>
                    <div className="univer-grid univer-flex-1 univer-gap-1">
                        <div>{localeService.t('univer-watermark.repeat')}</div>
                        <Checkbox
                            className="univer-justify-center univer-self-baseline"
                            checked={config.repeat}
                            onChange={(val) => onChange({ ...config, repeat: val as boolean })}
                        />
                    </div>
                </div>
                <div className="univer-flex univer-gap-2">
                    <div className="univer-grid univer-gap-1">
                        <div>{localeService.t('univer-watermark.spacingX')}</div>
                        <InputNumber
                            value={config.spacingX}
                            min={0}
                            onChange={(val) => {
                                if (val != null) {
                                    onChange({ ...config, spacingX: Number.parseInt(val.toString()) });
                                }
                            }}
                        />
                    </div>

                    <div className="univer-grid univer-gap-1">
                        <div>{localeService.t('univer-watermark.spacingY')}</div>
                        <InputNumber
                            value={config.spacingY}
                            min={0}
                            onChange={(val) => {
                                if (val != null) {
                                    onChange({ ...config, spacingY: Number.parseInt(val.toString()) });
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="univer-flex univer-gap-2">
                    <div className="univer-grid univer-gap-1">
                        <div>{localeService.t('univer-watermark.startX')}</div>
                        <InputNumber
                            value={config.x}
                            min={0}
                            onChange={(val) => {
                                if (val != null) {
                                    onChange({ ...config, x: Number.parseInt(val.toString()) });
                                }
                            }}
                        />
                    </div>

                    <div className="univer-grid univer-gap-1">
                        <div>{localeService.t('univer-watermark.startY')}</div>
                        <InputNumber
                            value={config.y}
                            min={0}
                            onChange={(val) => {
                                if (val != null) {
                                    onChange({ ...config, y: Number.parseInt(val.toString()) });
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
