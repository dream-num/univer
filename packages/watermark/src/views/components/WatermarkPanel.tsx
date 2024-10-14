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

import type { IWatermarkConfig, IWatermarkConfigWithType } from '../../common/type';
import { ILocalStorageService, useDependency } from '@univerjs/core';
import { Select } from '@univerjs/design';
import React, { useEffect, useState } from 'react';
import { UNIVER_WATERMARK_STORAGE_KEY, WatermarkTextBaseConfig } from '../../common/const';
import { IWatermarkTypeEnum } from '../../common/type';
import { UniverWatermarkService } from '../../services/watermarkService';
import styles from './index.module.less';
import { WatermarkImageSetting } from './WatermarkImageSetting';
import { WatermarkTextSetting } from './WatermarkTextSetting';

export const WatermarkPanel: React.FC = () => {
    const [watermarkType, setWatermarkType] = useState<IWatermarkTypeEnum>(IWatermarkTypeEnum.Text);
    const [config, setConfig] = useState<IWatermarkConfig>();
    const watermarkService = useDependency(UniverWatermarkService);
    const localStorageService = useDependency(ILocalStorageService);

    function handleConfigChange(config: IWatermarkConfig) {
        setConfig(config);
        watermarkService.updateWatermarkConfig({ type: watermarkType, config });
    }

    useEffect(() => {
        async function getWatermarkConfig() {
            const watermarkConfig = await localStorageService.getItem<IWatermarkConfigWithType>(UNIVER_WATERMARK_STORAGE_KEY);
            if (watermarkConfig) {
                setWatermarkType(watermarkConfig.type);
                setConfig(watermarkConfig.config);
            } else {
                setConfig({ text: WatermarkTextBaseConfig });
            }
        }

        getWatermarkConfig();
    }, []);

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
                {watermarkType === IWatermarkTypeEnum.Text && <WatermarkTextSetting config={config?.text} onChange={(v) => handleConfigChange({ text: v })} />}
                {watermarkType === IWatermarkTypeEnum.Image && <WatermarkImageSetting config={config?.image} onChange={(v) => handleConfigChange({ image: v })} />}
            </div>
        </div>
    );
};

