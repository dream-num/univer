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

import { LocaleService, useDependency } from '@univerjs/core';
import { Button } from '@univerjs/design';
import { IClipboardInterfaceService, ISidebarService } from '@univerjs/ui';
import { IWatermarkTypeEnum, WatermarkService, WatermarkTextBaseConfig } from '@univerjs/watermark';
import React from 'react';
import styles from './index.module.less';

export const WatermarkPanelFooter: React.FC = () => {
    const sidebarService = useDependency(ISidebarService);
    const watermarkService = useDependency(WatermarkService);
    const localeService = useDependency(LocaleService);
    const clipboardService = useDependency(IClipboardInterfaceService);

    return (
        <div className={styles.watermarkPanelFooter}>
            <div
                className={styles.watermarkPanelFooterReset}
                onClick={() => {
                    watermarkService.updateWatermarkConfig({
                        type: IWatermarkTypeEnum.Text,
                        config: { text: WatermarkTextBaseConfig },
                    });
                    watermarkService.refresh();
                }}
            >
                {localeService.t('univer-watermark.cancel')}
            </div>

            <div className={styles.watermarkPanelFooterButtonWrapper}>
                <Button
                    style={{ marginRight: 8 }}
                    onClick={async () => {
                        const watermarkConfig = await watermarkService.getWatermarkConfig();
                        let config;
                        if (watermarkConfig?.type === IWatermarkTypeEnum.Text) {
                            config = watermarkConfig.config.text;
                        } else if (watermarkConfig?.type === IWatermarkTypeEnum.Image) {
                            config = watermarkConfig.config.image;
                        }
                        clipboardService.writeText(JSON.stringify(config));
                    }}
                >
                    {localeService.t('univer-watermark.copy')}
                </Button>
                <Button onClick={async () => {
                    const watermarkConfig = await watermarkService.getWatermarkConfig();
                    if (watermarkConfig?.type === IWatermarkTypeEnum.Text && !watermarkConfig.config.text?.content) {
                        watermarkService.deleteWatermarkConfig();
                    } else if (watermarkConfig?.type === IWatermarkTypeEnum.Image && !watermarkConfig.config.image?.url) {
                        watermarkService.deleteWatermarkConfig();
                    }
                    sidebarService.close();
                }}
                >
                    {localeService.t('univer-watermark.close')}
                </Button>
            </div>
        </div>
    );
};
