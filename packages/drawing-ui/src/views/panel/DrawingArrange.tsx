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
import { ArrangeTypeEnum, LocaleService, useDependency } from '@univerjs/core';
import { Button } from '@univerjs/design';
import { IDrawingManagerService } from '@univerjs/drawing';
import { BottomSingle, MoveDownSingle, MoveUpSingle, TopmostSingle } from '@univerjs/icons';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import styles from './index.module.less';

export interface IDrawingArrangeProps {
    arrangeShow: boolean;
    drawings: IDrawingParam[];
}

export const DrawingArrange = (props: IDrawingArrangeProps) => {
    const { arrangeShow, drawings: focusDrawings } = props;

    const localeService = useDependency(LocaleService);
    const drawingManagerService = useDependency(IDrawingManagerService);

    const gridDisplay = (isShow: boolean) => {
        return isShow ? 'block' : 'none';
    };

    const [drawings, setDrawings] = useState<IDrawingParam[]>(focusDrawings);

    useEffect(() => {
        const focusDispose = drawingManagerService.focus$.subscribe((drawings) => {
            setDrawings(drawings);
        });

        return () => {
            focusDispose.unsubscribe();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onArrangeBtnClick = (arrangeType: ArrangeTypeEnum) => {
        // commandService.executeCommand(SetDrawingArrangeCommand.id, {
        //     unitId: drawings[0].unitId,
        //     subUnitId: drawings[0].subUnitId,
        //     drawingIds: drawings.map((drawing) => drawing.drawingId),
        //     arrangeType,
        // });

        const unitId = drawings[0].unitId;
        const subUnitId = drawings[0].subUnitId;
        const drawingIds = drawings.map((drawing) => drawing.drawingId);

        drawingManagerService.featurePluginOrderUpdateNotification({ unitId, subUnitId, drawingIds, arrangeType });

        // if (arrangeType === ArrangeType.forward) {
        //     drawingManagerService.forwardDrawings(unitId, subUnitId, drawingIds);
        // } else if (arrangeType === ArrangeType.backward) {
        //     drawingManagerService.backwardDrawing(unitId, subUnitId, drawingIds);
        // } else if (arrangeType === ArrangeType.front) {
        //     drawingManagerService.frontDrawing(unitId, subUnitId, drawingIds);
        // } else if (arrangeType === ArrangeType.back) {
        //     drawingManagerService.backDrawing(unitId, subUnitId, drawingIds);
        // }
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
};
