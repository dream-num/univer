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

import type { IImageWatermarkConfig } from '../../common/type';
import { useDependency } from '@univerjs/core';
import { Button, Checkbox, InputNumber } from '@univerjs/design';
import { ILocalFileService } from '@univerjs/ui';
import React from 'react';
import { WATERMARK_IMAGE_ALLOW_IMAGE_LIST } from '../../common/const';
import styles from './index.module.less';

interface IWatermarkImageSettingProps {
    config?: IImageWatermarkConfig;
    onChange: (config: IImageWatermarkConfig) => void;
}

export const WatermarkImageSetting: React.FC<IWatermarkImageSettingProps> = ({ config, onChange }) => {
    const fileOpenService = useDependency(ILocalFileService);

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
                onChange({ ...config, url: base64String as string });

                const img = new Image();
                img.onload = function () {
                    onChange({ ...config, width: img.width, height: img.height, originRatio: img.width / img.height });
                };

                img.src = base64String as string;
            }
        };

        reader.readAsDataURL(file);
    };

    return (
        <div className={styles.watermarkImageSetting}>

            <div className={styles.watermarkTextSettingHeader}>图片设置</div>

            <div className={styles.watermarkTextSettingLayout}>
                <span>图片</span>
                <Button
                    onClick={handleUpdateImageUrl}
                    style={{ marginLeft: 8 }}
                >
                    {config.url ? '替换图片' : '上传图片'}
                </Button>
                <div className={styles.watermarkTextSettingFontStylePart}>
                    <div className={styles.watermarkTextSettingLayoutFontWrapper}>
                        <div>透明度</div>
                        <InputNumber
                            value={config.opacity}
                            onChange={(val) => {
                                if (val !== undefined && val !== null) {
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
                        <div>保持比例</div>
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
                        <div>长度</div>
                        <InputNumber
                            value={config.width}
                            onChange={(val) => {
                                if (val) {
                                    const newWidth = Number.parseInt(val.toString());
                                    if (config.maintainAspectRatio) {
                                        onChange({ ...config, width: newWidth, height: Math.round(newWidth / config.originRatio) });
                                    } else {
                                        onChange({ ...config, width: newWidth });
                                    }
                                }
                            }}
                            min={0}
                            className={styles.watermarkInput}
                        />
                    </div>

                    <div className={styles.watermarkTextSettingLayoutFontWrapper}>
                        <div>宽度</div>
                        <InputNumber
                            value={config.height}
                            onChange={(val) => {
                                if (val) {
                                    const newHeight = Number.parseInt(val.toString());
                                    if (config.maintainAspectRatio) {
                                        onChange({ ...config, height: newHeight, width: Math.round(newHeight * config.originRatio) });
                                    } else {
                                        onChange({ ...config, height: Number.parseInt(val.toString()) });
                                    }
                                }
                            }}
                            min={0}
                            className={styles.watermarkInput}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.watermarkTextSettingHeader}>布局设置</div>

            <div className={styles.watermarkTextSettingLayout}>

                <div className={styles.watermarkTextSettingFontStylePart}>
                    <div className={styles.watermarkTextSettingLayoutFontWrapper}>
                        <div>旋转</div>
                        <InputNumber
                            value={config.rotate}
                            onChange={(val) => {
                                if (val) {
                                    onChange({ ...config, rotate: Number.parseInt(val.toString()) });
                                }
                            }}
                            max={360}
                            min={-360}
                            className={styles.watermarkInput}
                        />
                    </div>
                    <div className={styles.watermarkTextSettingLayoutFontWrapper}>
                        <div>重复</div>
                        <Checkbox
                            checked={config.repeat}
                            onChange={(val) => onChange({ ...config, repeat: val as boolean })}
                        >

                        </Checkbox>
                    </div>
                </div>
                <div className={styles.watermarkTextSettingFontStylePart}>
                    <div className={styles.watermarkTextSettingLayoutFontWrapper}>
                        <div>间距X</div>
                        <InputNumber
                            value={config.spacingX}
                            onChange={(val) => {
                                if (val !== undefined && val !== null) {
                                    onChange({ ...config, spacingX: Number.parseInt(val.toString()) });
                                }
                            }}
                            min={0}
                            className={styles.watermarkInput}
                        />
                    </div>

                    <div className={styles.watermarkTextSettingLayoutFontWrapper}>
                        <div>间距Y</div>
                        <InputNumber
                            value={config.spacingY}
                            onChange={(val) => {
                                if (val !== undefined && val !== null) {
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
                        <div>起始位置X</div>
                        <InputNumber
                            value={config.x}
                            onChange={(val) => {
                                if (val !== undefined && val !== null) {
                                    onChange({ ...config, x: Number.parseInt(val.toString()) });
                                }
                            }}
                            min={0}
                            className={styles.watermarkInput}
                        />
                    </div>

                    <div className={styles.watermarkTextSettingLayoutFontWrapper}>
                        <div>起始位置Y</div>
                        <InputNumber
                            value={config.y}
                            onChange={(val) => {
                                if (val !== undefined && val !== null) {
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
