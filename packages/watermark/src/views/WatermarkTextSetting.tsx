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

import type { ITextWatermarkConfig } from '../common/type';
import { Checkbox, ColorPicker, Dropdown, Input, InputNumber, Select } from '@univerjs/design';
import { BoldSingle, FontColor, ItalicSingle } from '@univerjs/icons';
import clsx from 'clsx';
import React from 'react';
import styles from './index.module.less';

interface IWatermarkTextSettingProps {
    config?: ITextWatermarkConfig;
    onChange: (config: ITextWatermarkConfig) => void;
}

export const WatermarkTextSetting: React.FC<IWatermarkTextSettingProps> = (props) => {
    const { config, onChange } = props;

    if (!config) return null;

    return (
        <div className={styles.watermarkTextSetting}>
            <div className={styles.watermarkTextSettingHeader}>样式设置</div>

            <div className={styles.watermarkTextSettingFontContent}>
                <div>内容</div>
                <Input
                    value={config.content}
                    onChange={(val) => onChange({ ...config, content: val })}
                    className={styles.watermarkInputContent}
                    placeholder="请输入内容"
                >
                </Input>
            </div>

            <div className={styles.watermarkTextSettingFontStyle}>
                <div className={styles.watermarkTextSettingFontStylePart}>
                    <div>
                        <div>字号</div>
                        <InputNumber
                            value={config.fontSize}
                            onChange={(val) => {
                                if (val) {
                                    onChange({ ...config, fontSize: Number.parseInt(val.toString()) });
                                }
                            }}
                            max={72}
                            min={12}
                            className={styles.watermarkInput}
                        />
                    </div>

                    <div style={{ margin: '0 8px' }}>
                        <div>方向</div>
                        <Select
                            value={config.direction}
                            onChange={(v) => onChange({ ...config, direction: v as 'ltr' | 'rtl' })}
                            options={[
                                { label: 'ltr', value: 'ltr' },
                                { label: 'rtl', value: 'rtl' },
                            ]}
                        >
                        </Select>
                    </div>

                    <div>
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
                </div>

                <div className={styles.watermarkTextSettingFontStylePart}>
                    <div className={styles.watermarkIconWrapper}>
                        <Dropdown
                            overlay={(
                                <div className={styles.watermarkColorPickerWrapper}>
                                    <ColorPicker color={config.color} onChange={(val) => onChange({ ...config, color: val })} />
                                </div>
                            )}
                        >
                            <FontColor className={styles.watermarkIcon} extend={{ colorChannel1: config.color ?? 'rgb(var(--primary-color))' }} />
                        </Dropdown>
                    </div>
                    <div className={clsx(styles.watermarkIconWrapper, { [styles.watermarkIconWrapperSelect]: config.bold })} onClick={() => { onChange({ ...config, bold: !config.bold }); }}>
                        <BoldSingle className={styles.watermarkIcon} />
                    </div>
                    <div className={clsx(styles.watermarkIconWrapper, { [styles.watermarkIconWrapperSelect]: config.italic })} onClick={() => { onChange({ ...config, italic: !config.italic }); }}>
                        <ItalicSingle className={styles.watermarkIcon} />
                    </div>
                </div>
            </div>

            <div className={styles.watermarkTextSettingHeader}>布局设置</div>

            <div className={styles.watermarkTextSettingLayout}>

                <div className={styles.watermarkTextSettingFontStylePart}>
                    <div>
                        <div>重复</div>
                        <Checkbox
                            checked={config.repeat}
                            onChange={(val) => onChange({ ...config, repeat: val as boolean })}
                        >

                        </Checkbox>
                    </div>

                    <div className={styles.watermarkTextSettingLayoutFontWrapper}>
                        <div>旋转</div>
                        <InputNumber
                            value={config.rotate}
                            onChange={(val) => {
                                if (val) {
                                    onChange({ ...config, rotate: Number.parseInt(val.toString()) });
                                }
                            }}
                            className={styles.watermarkInput}
                        />
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
