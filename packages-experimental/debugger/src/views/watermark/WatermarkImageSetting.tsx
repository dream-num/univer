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

import type { IImageWatermarkConfig } from '@univerjs/engine-render';
import { LocaleService } from '@univerjs/core';
import { Button, Checkbox, InputNumber } from '@univerjs/design';
import { ILocalFileService, useDependency } from '@univerjs/ui';
import { WATERMARK_IMAGE_ALLOW_IMAGE_LIST } from '@univerjs/watermark';

interface IWatermarkImageSettingProps {
    config?: IImageWatermarkConfig;
    onChange: (config: IImageWatermarkConfig) => void;
}

export function WatermarkImageSetting({ config, onChange }: IWatermarkImageSettingProps) {
    const fileOpenService = useDependency(ILocalFileService);
    const localeService = useDependency(LocaleService);

    if (!config) return null;

    const handleUpdateImageUrl = async () => {
        const files = await fileOpenService.openFile({
            multiple: false,
            accept: WATERMARK_IMAGE_ALLOW_IMAGE_LIST.map((image) => `.${image.replace('image/', '')}`).join(','),
        });

        const fileLength = files.length;
        if (fileLength === 0) {
            return false;
        }

        const file = files[0];

        const reader = new FileReader();

        reader.onload = function (event) {
            if (event.target?.result) {
                const base64String = event.target.result;

                const img = new Image();
                img.onload = function () {
                    onChange({ ...config, url: base64String as string, width: Math.max(20, img.width), height: Math.max(img.height, 20), originRatio: img.width / img.height });
                };

                img.src = base64String as string;
            }
        };

        reader.readAsDataURL(file);
    };

    return (
        <div className="univer-grid univer-gap-2">
            <div className="univer-text-gray-400">{localeService.t('univer-watermark.image')}</div>

            <div className="univer-mb-4 univer-grid univer-gap-1">
                <Button
                    className="univer-mb-2"
                    onClick={handleUpdateImageUrl}
                >
                    {config.url ? localeService.t('univer-watermark.replaceImage') : localeService.t('univer-watermark.uploadImage')}
                </Button>

                <div className="univer-flex univer-gap-2 univer-text-center">
                    <div className="univer-grid univer-flex-1 univer-gap-1">
                        <div>{localeService.t('univer-watermark.opacity')}</div>
                        <InputNumber
                            className="univer-box-border univer-h-7"
                            value={config.opacity}
                            max={1}
                            min={0}
                            step={0.05}
                            onChange={(val) => {
                                if (val != null) {
                                    onChange({ ...config, opacity: Number.parseFloat(val.toString()) });
                                }
                            }}
                        />
                    </div>

                    <div className="univer-grid univer-flex-1 univer-gap-1">
                        <div>{localeService.t('univer-watermark.keepRatio')}</div>
                        <Checkbox
                            className="univer-justify-center univer-self-baseline"
                            checked={config.maintainAspectRatio}
                            onChange={(val) => {
                                if (val === true) {
                                    onChange({ ...config, maintainAspectRatio: val as boolean, height: Math.round(config.width / config.originRatio) });
                                } else {
                                    onChange({ ...config, maintainAspectRatio: val as boolean });
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="univer-grid univer-gap-2 univer-text-center">
                <div className="univer-flex univer-gap-2">
                    <div className="univer-grid univer-flex-1 univer-gap-1">
                        <div>{localeService.t('univer-watermark.width')}</div>
                        <InputNumber
                            className="univer-box-border univer-h-7"
                            value={config.width}
                            min={20}
                            onChange={(val) => {
                                if (val != null) {
                                    const newWidth = Math.max(20, Number.parseInt(val.toString()));
                                    if (config.maintainAspectRatio) {
                                        onChange({ ...config, width: newWidth, height: Math.round(newWidth / config.originRatio) });
                                    } else {
                                        onChange({ ...config, width: newWidth });
                                    }
                                }
                            }}
                        />
                    </div>

                    <div className="univer-grid univer-flex-1 univer-gap-1">
                        <div>{localeService.t('univer-watermark.height')}</div>
                        <InputNumber
                            className="univer-box-border univer-h-7"
                            value={config.height}
                            min={20}
                            onChange={(val) => {
                                if (val != null) {
                                    const newHeight = Math.max(20, Number.parseInt(val.toString()));
                                    if (config.maintainAspectRatio) {
                                        onChange({ ...config, height: newHeight, width: Math.round(newHeight * config.originRatio) });
                                    } else {
                                        onChange({ ...config, height: Number.parseInt(val.toString()) });
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="univer-text-gray-400">{localeService.t('univer-watermark.layout')}</div>

            <div className="univer-grid univer-gap-2 univer-text-center">
                <div className="univer-flex univer-gap-2">
                    <div className="univer-grid univer-flex-1 univer-gap-1">
                        <div>{localeService.t('univer-watermark.rotate')}</div>
                        <InputNumber
                            className="univer-box-border univer-h-7"
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
                    <div className="univer-grid univer-flex-1 univer-gap-1">
                        <div>{localeService.t('univer-watermark.spacingX')}</div>
                        <InputNumber
                            className="univer-box-border univer-h-7"
                            value={config.spacingX}
                            min={0}
                            onChange={(val) => {
                                if (val != null) {
                                    onChange({ ...config, spacingX: Number.parseInt(val.toString()) });
                                }
                            }}
                        />
                    </div>

                    <div className="univer-grid univer-flex-1 univer-gap-1">
                        <div>{localeService.t('univer-watermark.spacingY')}</div>
                        <InputNumber
                            className="univer-box-border univer-h-7"
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
                    <div className="univer-grid univer-flex-1 univer-gap-1">
                        <div>{localeService.t('univer-watermark.startX')}</div>
                        <InputNumber
                            className="univer-box-border univer-h-7"
                            value={config.x}
                            min={0}
                            onChange={(val) => {
                                if (val != null) {
                                    onChange({ ...config, x: Number.parseInt(val.toString()) });
                                }
                            }}
                        />
                    </div>

                    <div className="univer-grid univer-flex-1 univer-gap-1">
                        <div>{localeService.t('univer-watermark.startY')}</div>
                        <InputNumber
                            className="univer-box-border univer-h-7"
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
