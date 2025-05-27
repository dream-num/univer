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
import { BottomIcon, MoveDownIcon, MoveUpIcon, TopmostIcon } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';

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
            className={clsx('univer-grid univer-gap-2 univer-py-2 univer-text-gray-400', {
                'univer-hidden': !arrangeShow,
            })}
        >
            <header
                className={`
                  univer-text-gray-600
                  dark:!univer-text-gray-200
                `}
            >
                <div>{localeService.t('image-panel.arrange.title')}</div>
            </header>

            <div className="univer-grid univer-grid-cols-2 univer-gap-2 univer-px-8">
                <Button onClick={() => { onArrangeBtnClick(ArrangeTypeEnum.forward); }}>
                    <MoveUpIcon />
                    {localeService.t('image-panel.arrange.forward')}
                </Button>
                <Button onClick={() => { onArrangeBtnClick(ArrangeTypeEnum.backward); }}>
                    <MoveDownIcon />
                    {localeService.t('image-panel.arrange.backward')}
                </Button>
                <Button onClick={() => { onArrangeBtnClick(ArrangeTypeEnum.front); }}>
                    <TopmostIcon />
                    {localeService.t('image-panel.arrange.front')}
                </Button>
                <Button onClick={() => { onArrangeBtnClick(ArrangeTypeEnum.back); }}>
                    <BottomIcon />
                    {localeService.t('image-panel.arrange.back')}
                </Button>
            </div>
        </div>
    );
};
