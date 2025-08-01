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
import type { IDrawingGroupUpdateParam } from '@univerjs/drawing';
import { DrawingTypeEnum, generateRandomId, LocaleService } from '@univerjs/core';
import { Button, clsx } from '@univerjs/design';
import { IDrawingManagerService } from '@univerjs/drawing';
import { getGroupState, IRenderManagerService, transformObjectOutOfGroup } from '@univerjs/engine-render';
import { GroupIcon, UngroupIcon } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { getUpdateParams } from '../../utils/get-update-params';

export interface IDrawingGroupProps {
    drawings: IDrawingParam[];
    hasGroup: boolean;
}

export const DrawingGroup = (props: IDrawingGroupProps) => {
    const localeService = useDependency(LocaleService);
    const renderManagerService = useDependency(IRenderManagerService);
    const drawingManagerService = useDependency(IDrawingManagerService);

    const { hasGroup, drawings } = props;

    const [groupShow, setGroupShow] = useState(false);

    const [groupBtnShow, setGroupBtnShow] = useState(true);
    const [ungroupBtnShow, setUngroupBtnShow] = useState(true);

    const onGroupBtnClick = () => {
        const focusDrawings = drawingManagerService.getFocusDrawings();
        const { unitId, subUnitId } = focusDrawings[0];
        const groupId = generateRandomId(10);
        const groupTransform = getGroupState(0, 0, focusDrawings.map((o) => o.transform || {}));
        const groupParam = {
            unitId,
            subUnitId,
            drawingId: groupId,
            drawingType: DrawingTypeEnum.DRAWING_GROUP,
            transform: groupTransform,
        } as IDrawingParam;

        const children = focusDrawings.map((drawing) => {
            const transform = drawing.transform || { left: 0, top: 0 };
            const { unitId, subUnitId, drawingId } = drawing;
            return {
                unitId,
                subUnitId,
                drawingId,
                transform: {
                    ...transform,
                    left: transform.left! - groupTransform.left,
                    top: transform.top! - groupTransform.top,
                },
                groupId,
            };
        }) as IDrawingParam[];

        drawingManagerService.featurePluginGroupUpdateNotification([{
            parent: groupParam,
            children,
        }]);
    };

    const ungroup = (param: IDrawingParam) => {
        if (param.drawingType !== DrawingTypeEnum.DRAWING_GROUP) {
            return;
        }

        const { unitId, subUnitId, drawingId, transform: groupTransform = { width: 0, height: 0 } } = param;

        if (groupTransform == null) {
            return;
        }

        const objects = drawingManagerService.getDrawingsByGroup({ unitId, subUnitId, drawingId });

        if (objects.length === 0) {
            return;
        }

        const children = objects.map((object) => {
            const { transform } = object;
            const { unitId, subUnitId, drawingId } = object;
            const newTransform = transformObjectOutOfGroup(transform || {}, groupTransform, groupTransform.width || 0, groupTransform.height || 0);
            return {
                unitId,
                subUnitId,
                drawingId,
                transform: {
                    ...transform,
                    ...newTransform,
                },
                groupId: undefined,
            };
        });

        return {
            parent: param,
            children,
        } as IDrawingGroupUpdateParam;
    };

    const onUngroupBtnClick = () => {
        const focusDrawings = drawingManagerService.getFocusDrawings();
        const params = focusDrawings.map((drawing) =>
            ungroup(drawing)
        ).filter((o) => o != null) as IDrawingGroupUpdateParam[];

        if (params.length === 0) {
            return;
        }

        drawingManagerService.featurePluginUngroupUpdateNotification(params);
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
