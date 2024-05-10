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

import type { IDrawingParam } from '@univerjs/core';
import { ICommandService, LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React from 'react';
import { CreateCopySingle } from '@univerjs/icons';
import { Button } from '@univerjs/design';
import clsx from 'clsx';
import { ArrangeType, SetDrawingArrangeCommand } from '@univerjs/drawing';
import styles from './index.module.less';


export interface IImageArrangeProps {
    arrangeShow: boolean;
    drawings: IDrawingParam[];
}

export const ImageArrange = (props: IImageArrangeProps) => {
    const { arrangeShow, drawings } = props;

    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);

    const gridDisplay = (isShow: boolean) => {
        return isShow ? 'block' : 'none';
    };

    const onArrangeBtnClick = (arrangeType: ArrangeType) => {
        commandService.executeCommand(SetDrawingArrangeCommand.id, {
            unitId: drawings[0].unitId,
            subUnitId: drawings[0].subUnitId,
            drawingIds: drawings.map((drawing) => drawing.drawingId),
            arrangeType,
        });
    };

    return (
        <div className={styles.imageCommonPanelGrid} style={{ display: gridDisplay(arrangeShow) }}>
            <div className={styles.imageCommonPanelRow}>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelTitle)}>
                    <div>{localeService.t('image-panel.arrange.title')}</div>
                </div>
            </div>
            <div className={styles.imageCommonPanelRow}>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan2)}>
                    <Button size="small" onClick={() => { onArrangeBtnClick(ArrangeType.forward); }}>
                        <div className={clsx(styles.imageCommonPanelInline)}><CreateCopySingle /></div>
                        <div className={clsx(styles.imageCommonPanelInline)}>{localeService.t('image-panel.arrange.forward')}</div>
                    </Button>
                </div>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan2)}>
                    <Button size="small" onClick={() => { onArrangeBtnClick(ArrangeType.backward); }}>
                        <div className={clsx(styles.imageCommonPanelInline)}><CreateCopySingle /></div>
                        <div className={clsx(styles.imageCommonPanelInline)}>{localeService.t('image-panel.arrange.backward')}</div>
                    </Button>
                </div>
            </div>
            <div className={styles.imageCommonPanelRow}>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan2)}>
                    <Button size="small" onClick={() => { onArrangeBtnClick(ArrangeType.front); }}>
                        <div className={clsx(styles.imageCommonPanelInline)}><CreateCopySingle /></div>
                        <div className={clsx(styles.imageCommonPanelInline)}>{localeService.t('image-panel.arrange.front')}</div>
                    </Button>
                </div>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan2)}>
                    <Button size="small" onClick={() => { onArrangeBtnClick(ArrangeType.back); }}>
                        <div className={clsx(styles.imageCommonPanelInline)}><CreateCopySingle /></div>
                        <div className={clsx(styles.imageCommonPanelInline)}>{localeService.t('image-panel.arrange.back')}</div>
                    </Button>
                </div>
            </div>
        </div>

    );
};
