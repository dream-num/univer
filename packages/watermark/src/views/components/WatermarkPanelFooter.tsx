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

import { useDependency } from '@univerjs/core';
import { Button } from '@univerjs/design';
import { ISidebarService } from '@univerjs/ui';
import React from 'react';
import { UniverWatermarkService } from '../../services/watermarkService';
import styles from './index.module.less';

export const WatermarkPanelFooter: React.FC = () => {
    const sidebarService = useDependency(ISidebarService);
    const watermarkService = useDependency(UniverWatermarkService);

    return (
        <div className={styles.watermarkPanelFooter}>
            <div
                className={styles.watermarkPanelFooterReset}
                onClick={() => {
                    watermarkService.deleteWatermarkConfig();
                }}
            >
                取消水印
            </div>
            <Button onClick={() => sidebarService.close()}>关闭面板</Button>
        </div>
    );
};
