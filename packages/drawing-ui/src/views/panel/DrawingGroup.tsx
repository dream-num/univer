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
import { DrawingTypeEnum, ICommandService, LocaleService } from '@univerjs/core';
import { Button, clsx } from '@univerjs/design';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IconManager, useDependency, useObservable } from '@univerjs/ui';
import { filter, map, merge } from 'rxjs';
import {
    CancelDrawingGroupOperation,
    SetDrawingGroupOperation,
} from '../../commands/operations/drawing-group.operation';
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
    const iconManager = useDependency(IconManager);

    const { hasGroup, drawings } = props;
    const GroupIcon = iconManager.get('GroupIcon');
    const UngroupIcon = iconManager.get('UngroupIcon');

    const drawingParam = drawings[0];
    const transformer = drawingParam
        ? renderManagerService.getRenderUnitById(drawingParam.unitId)?.scene?.getTransformerByCreate()
        : undefined;
    const groupState = useObservable(
        transformer
            ? () => merge(
                transformer.clearControl$.pipe(
                    filter((changeSelf) => changeSelf === true),
                    map(() => ({ groupShow: false, groupBtnShow: false, ungroupBtnShow: false }))
                ),
                transformer.changeStart$.pipe(map((state) => {
                    const params = getUpdateParams(state.objects, drawingManagerService);
                    const groupBtnShow = params.length > 1;
                    const ungroupBtnShow = params.some((item) => item?.drawingType === DrawingTypeEnum.DRAWING_GROUP);
                    return {
                        groupShow: groupBtnShow || ungroupBtnShow,
                        groupBtnShow,
                        ungroupBtnShow,
                    };
                }))
            )
            : null,
        { groupShow: false, groupBtnShow: true, ungroupBtnShow: true },
        false,
        [drawingManagerService, transformer]
    );
    const { groupShow, groupBtnShow, ungroupBtnShow } = groupState;

    const onGroupBtnClick = () => {
        commandService.syncExecuteCommand(SetDrawingGroupOperation.id, { drawings });
    };

    const onUngroupBtnClick = () => {
        commandService.syncExecuteCommand(CancelDrawingGroupOperation.id, { drawings });
    };

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
                <div>{localeService.t<LocaleKey>('drawing-ui.image-panel.group.title')}</div>
            </header>

            <div className="univer-flex univer-items-center univer-justify-center univer-gap-2">
                <Button
                    className={clsx({
                        'univer-hidden': !groupBtnShow,
                    })}
                    onClick={onGroupBtnClick}
                >
                    <GroupIcon />
                    {localeService.t<LocaleKey>('drawing-ui.image-panel.group.group')}
                </Button>
                <Button
                    className={clsx({
                        'univer-hidden': !ungroupBtnShow,
                    })}
                    onClick={onUngroupBtnClick}
                >
                    <UngroupIcon />
                    {localeService.t<LocaleKey>('drawing-ui.image-panel.group.unGroup')}
                </Button>
            </div>
        </div>
    );
};
