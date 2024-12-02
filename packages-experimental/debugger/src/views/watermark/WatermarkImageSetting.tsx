/**
 * Copyright 2023-present DreamNum Inc.
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

import type { IImageWatermarkConfig } from '@univerjs/watermark';
import { LocaleService, useDependency } from '@univerjs/core';
import { Button, Checkbox, InputNumber } from '@univerjs/design';
import { ILocalFileService } from '@univerjs/ui';
import { WATERMARK_IMAGE_ALLOW_IMAGE_LIST } from '@univerjs/watermark';
import React from 'react';
import styles from './index.module.less';

interface IWatermarkImageSettingProps {
    config?: IImageWatermarkConfig;
    onChange: (config: IImageWatermarkConfig) => void;
}

export const WatermarkImageSetting: React.FC<IWatermarkImageSettingProps> = ({ config, onChange }) => {
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
        <div className={styles.watermarkImageSetting}>

            <div className={styles.watermarkTextSettingHeader}>{localeService.t('univer-watermark.image')}</div>

            <div className={styles.watermarkTextSettingLayout}>
                <span>{localeService.t('univer-watermark.image')}</span>
                <Button
                    onClick={handleUpdateImageUrl}
                    style={{ marginLeft: 8 }}
                >
                    {config.url ? localeService.t('univer-watermark.replaceImage') : localeService.t('univer-watermark.uploadImage')}
                </Button>
                <div className={styles.watermarkTextSettingFontStylePart}>
                    <div className={styles.watermarkTextSettingLayoutFontWrapper}>
                        <div>{localeService.t('univer-watermark.opacity')}</div>
                        <InputNumber
                            value={config.opacity}
                            onChange={(val) => {
                                if (val != null) {
                                    onChange({ ...config, opacity: Number.parseFloat(val.toString()) });
                                }
                            }}
                            max={1}
                            min={0}
                            step={0.05}
                            className={styles.watermarkInput}
                        />
                    </div>

                    <div className={styles.watermarkTextSettingLayoutFontWrapper}>
                        <div>{localeService.t('univer-watermark.keepRatio')}</div>
                        <Checkbox
                            checked={config.maintainAspectRatio}
                            onChange={(val) => {
                                if (val === true) {
                                    onChange({ ...config, maintainAspectRatio: val as boolean, height: Math.round(config.width / config.originRatio) });
                                } else {
                                    onChange({ ...config, maintainAspectRatio: val as boolean });
                                }
                            }}
                        >

                        </Checkbox>
                    </div>
                </div>
            </div>

            <div className={styles.watermarkTextSettingLayout}>
                <div className={styles.watermarkTextSettingFontStylePart}>
                    <div className={styles.watermarkTextSettingLayoutFontWrapper}>
                        <div>{localeService.t('univer-watermark.width')}</div>
                        <InputNumber
                            value={config.width}
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
                            min={20}
                            className={styles.watermarkInput}
                        />
                    </div>

                    <div className={styles.watermarkTextSettingLayoutFontWrapper}>
                        <div>{localeService.t('univer-watermark.height')}</div>
                        <InputNumber
                            value={config.height}
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
                            min={20}
                            className={styles.watermarkInput}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.watermarkTextSettingHeader}>{localeService.t('univer-watermark.layout')}</div>

            <div className={styles.watermarkTextSettingLayout}>

                <div className={styles.watermarkTextSettingFontStylePart}>
                    <div className={styles.watermarkTextSettingLayoutFontWrapper}>
                        <div>{localeService.t('univer-watermark.rotate')}</div>
                        <InputNumber
                            value={config.rotate}
                            onChange={(val) => {
                                if (val != null) {
                                    onChange({ ...config, rotate: Number.parseInt(val.toString()) });
                                }
                            }}
                            max={360}
                            min={-360}
                            className={styles.watermarkInput}
                        />
                    </div>
                    <div className={styles.watermarkTextSettingLayoutFontWrapper}>
                        <div>{localeService.t('univer-watermark.repeat')}</div>
                        <Checkbox
                            checked={config.repeat}
                            onChange={(val) => onChange({ ...config, repeat: val as boolean })}
                        >

                        </Checkbox>
                    </div>
                </div>
                <div className={styles.watermarkTextSettingFontStylePart}>
                    <div className={styles.watermarkTextSettingLayoutFontWrapper}>
                        <div>{localeService.t('univer-watermark.spacingX')}</div>
                        <InputNumber
                            value={config.spacingX}
                            onChange={(val) => {
                                if (val != null) {
                                    onChange({ ...config, spacingX: Number.parseInt(val.toString()) });
                                }
                            }}
                            min={0}
                            className={styles.watermarkInput}
                        />
                    </div>

                    <div className={styles.watermarkTextSettingLayoutFontWrapper}>
                        <div>{localeService.t('univer-watermark.spacingY')}</div>
                        <InputNumber
                            value={config.spacingY}
                            onChange={(val) => {
                                if (val != null) {
                                    onChange({ ...config, spacingY: Number.parseInt(val.toString()) });
                                }
                            }}
                            min={0}
                            className={styles.watermarkInput}
                        />
                    </div>
                </div>
                <div className={styles.watermarkTextSettingFontStylePart}>

                    <div className={styles.watermarkTextSettingLayoutFontWrapper}>
                        <div>{localeService.t('univer-watermark.startX')}</div>
                        <InputNumber
                            value={config.x}
                            onChange={(val) => {
                                if (val != null) {
                                    onChange({ ...config, x: Number.parseInt(val.toString()) });
                                }
                            }}
                            min={0}
                            className={styles.watermarkInput}
                        />
                    </div>

                    <div className={styles.watermarkTextSettingLayoutFontWrapper}>
                        <div>{localeService.t('univer-watermark.startY')}</div>
                        <InputNumber
                            value={config.y}
                            onChange={(val) => {
                                if (val != null) {
                                    onChange({ ...config, y: Number.parseInt(val.toString()) });
                                }
                            }}
                            min={0}
                            className={styles.watermarkInput}
                        />
                    </div>
                </div>
            </div>

        </div>
    );
};
