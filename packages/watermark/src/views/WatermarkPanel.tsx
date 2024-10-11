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

import type { IWatermarkConfig } from '../common/type';
import { Select } from '@univerjs/design';
import React, { useState } from 'react';
import { WatermarkTextBaseConfig } from '../common/const';
import { IWatermarkTypeEnum } from '../common/type';
import styles from './index.module.less';
import { WatermarkTextSetting } from './WatermarkTextSetting';

export const WatermarkPanel: React.FC = () => {
    const [watermarkType, setWatermarkType] = useState<IWatermarkTypeEnum>(IWatermarkTypeEnum.Text);
    const [config, setConfig] = useState<IWatermarkConfig>({
        text: WatermarkTextBaseConfig,
    });

    function handleConfigChange(config: IWatermarkConfig) {
        setConfig(config);
        // TODO: update service
    }

    return (
        <div className={styles.watermarkPanel}>
            <div className={styles.watermarkPanelTypeTitle}>水印类型</div>
            <Select
                value={watermarkType}
                onChange={(v) => setWatermarkType(v as IWatermarkTypeEnum)}
                options={[
                    { label: '文本', value: IWatermarkTypeEnum.Text },
                    { label: '图片', value: IWatermarkTypeEnum.Image },
                ]}
                className={styles.watermarkPanelTypeSelect}
            >
            </Select>
            <div className={styles.watermarkPanelSetting}>
                {watermarkType === IWatermarkTypeEnum.Text && <WatermarkTextSetting config={config.text} onChange={(v) => handleConfigChange({ text: v })} />}
                {watermarkType === IWatermarkTypeEnum.Image && <div>图片水印设置</div>}
            </div>
        </div>
    );
};

