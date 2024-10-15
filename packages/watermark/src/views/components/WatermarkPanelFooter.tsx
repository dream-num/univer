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
import { ISidebarService } from '@univerjs/ui';
import React from 'react';
import { WatermarkTextBaseConfig } from '../../common/const';
import { IWatermarkTypeEnum } from '../../common/type';
import { UniverWatermarkService } from '../../services/watermarkService';
import styles from './index.module.less';

export const WatermarkPanelFooter: React.FC = () => {
    const sidebarService = useDependency(ISidebarService);
    const watermarkService = useDependency(UniverWatermarkService);
    const localeService = useDependency(LocaleService);

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
    );
};
