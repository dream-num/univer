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
import { DrawingTypeEnum, ICommandService, LocaleService } from '@univerjs/core';
import { Button, clsx } from '@univerjs/design';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ComponentManager, useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { CancelDrawingGroupOperation, SetDrawingGroupOperation } from '../../commands/operations/drawing-group.operation';
import { getUpdateParams } from '../../utils/get-update-params';

export interface IDrawingGroupProps {
    drawings: IDrawingParam[];
    hasGroup: boolean;
}

export const DrawingGroup = (props: IDrawingGroupProps) => {
    const localeService = useDependency(LocaleService);
    const renderManagerService = useDependency(IRenderManagerService);
    const drawingManagerService = useDependency(IDrawingManagerService);
    const commandService = useDependency(ICommandService);
    const componentManager = useDependency(ComponentManager);

    const { hasGroup, drawings } = props;
    const GroupIcon = componentManager.get('GroupIcon');
    const UngroupIcon = componentManager.get('UngroupIcon');

    const [groupShow, setGroupShow] = useState(false);
    const [groupBtnShow, setGroupBtnShow] = useState(true);
    const [ungroupBtnShow, setUngroupBtnShow] = useState(true);

    const onGroupBtnClick = () => {
        commandService.syncExecuteCommand(SetDrawingGroupOperation.id, { drawings });
    };

    const onUngroupBtnClick = () => {
        commandService.syncExecuteCommand(CancelDrawingGroupOperation.id, { drawings });
    };

    useEffect(() => {
        const drawingParam = drawings[0];

        if (drawingParam == null) {
            return;
        }

        const { unitId } = drawingParam;

        const renderObject = renderManagerService.getRenderById(unitId);
        const scene = renderObject?.scene;
        if (scene == null) {
            return;
        }
        const transformer = scene.getTransformerByCreate();

        const onClearControlObserver = transformer.clearControl$.subscribe((changeSelf) => {
            if (changeSelf === true) {
                setGroupShow(false);
            }
        });

        const onChangeStartObserver = transformer.changeStart$.subscribe((state) => {
            const { objects } = state;
            const params = getUpdateParams(objects, drawingManagerService);
            const groupParams = params.filter((o) => o?.drawingType === DrawingTypeEnum.DRAWING_GROUP) as IDrawingParam[];

            let groupBtnShow = false;
            let ungroupBtnShow = false;

            if (params.length > 1) {
                groupBtnShow = true;
            }

            if (groupParams.length > 0) {
                ungroupBtnShow = true;
            }

            const groupShow = groupBtnShow || ungroupBtnShow;

            setGroupShow(groupShow);
            setGroupBtnShow(groupBtnShow);
            setUngroupBtnShow(ungroupBtnShow);
        });

        return () => {
            onChangeStartObserver.unsubscribe();
            onClearControlObserver.unsubscribe();
        };
    }, []);

    return (
        <div
            className={clsx('univer-grid univer-gap-2 univer-py-2 univer-text-gray-400', {
                'univer-hidden': (hasGroup === true && groupShow === false) || hasGroup === false,
            })}
        >
            <header
                className={`
                  univer-text-gray-600
                  dark:!univer-text-gray-200
                `}
            >
                <div>{localeService.t('image-panel.group.title')}</div>
            </header>

            <div className="univer-flex univer-items-center univer-justify-center univer-gap-2">
                <Button
                    className={clsx({
                        'univer-hidden': !groupBtnShow,
                    })}
                    onClick={onGroupBtnClick}
                >
                    <GroupIcon />
                    {localeService.t('image-panel.group.group')}
                </Button>
                <Button
                    className={clsx({
                        'univer-hidden': !ungroupBtnShow,
                    })}
                    onClick={onUngroupBtnClick}
                >
                    <UngroupIcon />
                    {localeService.t('image-panel.group.unGroup')}
                </Button>
            </div>
        </div>
    );
};
