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

import React from 'react';

import { ArrangeTypeEnum, LocaleService, useDependency } from '@univerjs/core';
import clsx from 'clsx';
import { Button } from '@univerjs/design';
import { BottomSingle, MoveDownSingle, MoveUpSingle, TopmostSingle } from '@univerjs/icons';
import styles from './index.module.less';

export default function ArrangePanel() {
    const localeService = useDependency(LocaleService);

    const onArrangeBtnClick = (arrangeType: ArrangeTypeEnum) => {
    };

    return (
        <div className={styles.imageCommonPanelGrid}>
            <div className={styles.imageCommonPanelRow}>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelTitle)}>
                    <div>{localeService.t('image-panel.arrange.title')}</div>
                </div>
            </div>
            <div className={styles.imageCommonPanelRow}>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan2)}>
                    <Button size="small" onClick={() => { onArrangeBtnClick(ArrangeTypeEnum.forward); }}>
                        <span className={styles.imageCommonPanelInline}>
                            <MoveUpSingle />
                            {localeService.t('image-panel.arrange.forward')}
                        </span>

                    </Button>
                </div>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan2)}>
                    <Button size="small" onClick={() => { onArrangeBtnClick(ArrangeTypeEnum.backward); }}>
                        <span className={styles.imageCommonPanelInline}>
                            <MoveDownSingle />
                            {localeService.t('image-panel.arrange.backward')}
                        </span>

                    </Button>
                </div>
            </div>
            <div className={styles.imageCommonPanelRow}>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan2)}>
                    <Button size="small" onClick={() => { onArrangeBtnClick(ArrangeTypeEnum.front); }}>
                        <span className={styles.imageCommonPanelInline}>
                            <TopmostSingle />
                            {localeService.t('image-panel.arrange.front')}
                        </span>

                    </Button>
                </div>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan2)}>
                    <Button size="small" onClick={() => { onArrangeBtnClick(ArrangeTypeEnum.back); }}>
                        <span className={styles.imageCommonPanelInline}>
                            <BottomSingle />
                            {localeService.t('image-panel.arrange.back')}
                        </span>

                    </Button>
                </div>
            </div>
        </div>
    );
}
