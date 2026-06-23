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
import type { LocaleKey } from '../../locale/types';
import { ArrangeTypeEnum, ICommandService, LocaleService } from '@univerjs/core';
import { Button, clsx } from '@univerjs/design';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IconManager, useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { SetDrawingArrangeOperation } from '../../commands/operations/drawing-arrange.operation';

export interface IDrawingArrangeProps {
    arrangeShow: boolean;
    drawings: IDrawingParam[];
}

export const DrawingArrange = (props: IDrawingArrangeProps) => {
    const { arrangeShow, drawings: focusDrawings } = props;

    const localeService = useDependency(LocaleService);
    const drawingManagerService = useDependency(IDrawingManagerService);
    const commandService = useDependency(ICommandService);
    const iconManager = useDependency(IconManager);

    const MoveUpIcon = iconManager.get('MoveUpIcon');
    const MoveDownIcon = iconManager.get('MoveDownIcon');
    const TopmostIcon = iconManager.get('TopmostIcon');
    const BottomIcon = iconManager.get('BottomIcon');

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
        commandService.syncExecuteCommand(SetDrawingArrangeOperation.id, { arrangeType, drawings });
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
                <div>{localeService.t<LocaleKey>('drawing-ui.image-panel.arrange.title')}</div>
            </header>

            <div className="univer-grid univer-grid-cols-2 univer-gap-2">
                <Button onClick={() => { onArrangeBtnClick(ArrangeTypeEnum.forward); }}>
                    <MoveUpIcon />
                    {localeService.t<LocaleKey>('drawing-ui.image-panel.arrange.forward')}
                </Button>
                <Button onClick={() => { onArrangeBtnClick(ArrangeTypeEnum.backward); }}>
                    <MoveDownIcon />
                    {localeService.t<LocaleKey>('drawing-ui.image-panel.arrange.backward')}
                </Button>
                <Button onClick={() => { onArrangeBtnClick(ArrangeTypeEnum.front); }}>
                    <TopmostIcon />
                    {localeService.t<LocaleKey>('drawing-ui.image-panel.arrange.front')}
                </Button>
                <Button onClick={() => { onArrangeBtnClick(ArrangeTypeEnum.back); }}>
                    <BottomIcon />
                    {localeService.t<LocaleKey>('drawing-ui.image-panel.arrange.back')}
                </Button>
            </div>
        </div>
    );
};
