/**
 * Copyright 2023-present DreamNum Co., Ltd.
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
import { ArrangeTypeEnum, LocaleService } from '@univerjs/core';
import { Button, clsx } from '@univerjs/design';
import { IDrawingManagerService } from '@univerjs/drawing';
import { BottomSingle, MoveDownSingle, MoveUpSingle, TopmostSingle } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { columnTitleClassName, inlineClassName, rowClassName } from '../utils/classnames';

export interface IDrawingArrangeProps {
    arrangeShow: boolean;
    drawings: IDrawingParam[];
}

export const DrawingArrange = (props: IDrawingArrangeProps) => {
    const { arrangeShow, drawings: focusDrawings } = props;

    const localeService = useDependency(LocaleService);
    const drawingManagerService = useDependency(IDrawingManagerService);

    const [drawings, setDrawings] = useState<IDrawingParam[]>(focusDrawings);

    useEffect(() => {
        const focusDispose = drawingManagerService.focus$.subscribe((drawings) => {
            setDrawings(drawings);
        });

        return () => {
            focusDispose.unsubscribe();
        };
    }, []);

    const onArrangeBtnClick = (arrangeType: ArrangeTypeEnum) => {
        const unitId = drawings[0].unitId;
        const subUnitId = drawings[0].subUnitId;
        const drawingIds = drawings.map((drawing) => drawing.drawingId);

        drawingManagerService.featurePluginOrderUpdateNotification({ unitId, subUnitId, drawingIds, arrangeType });
    };

    return (
        <div
            className={clsx('univer-relative univer-mt-5 univer-w-full', {
                'univer-hidden': !arrangeShow,
            })}
        >
            <div className={rowClassName}>
                <div className={columnTitleClassName}>
                    <div>{localeService.t('image-panel.arrange.title')}</div>
                </div>
            </div>
            <div className={rowClassName}>
                <div className="univer-w-1/2">
                    <Button onClick={() => { onArrangeBtnClick(ArrangeTypeEnum.forward); }}>
                        <span className={inlineClassName}>
                            <MoveUpSingle />
                            {localeService.t('image-panel.arrange.forward')}
                        </span>

                    </Button>
                </div>
                <div className="univer-w-1/2">
                    <Button onClick={() => { onArrangeBtnClick(ArrangeTypeEnum.backward); }}>
                        <span className={inlineClassName}>
                            <MoveDownSingle />
                            {localeService.t('image-panel.arrange.backward')}
                        </span>

                    </Button>
                </div>
            </div>
            <div className={rowClassName}>
                <div className="univer-w-1/2">
                    <Button onClick={() => { onArrangeBtnClick(ArrangeTypeEnum.front); }}>
                        <span className={inlineClassName}>
                            <TopmostSingle />
                            {localeService.t('image-panel.arrange.front')}
                        </span>
                    </Button>
                </div>
                <div className="univer-w-1/2">
                    <Button onClick={() => { onArrangeBtnClick(ArrangeTypeEnum.back); }}>
                        <span className={inlineClassName}>
                            <BottomSingle />
                            {localeService.t('image-panel.arrange.back')}
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
};
