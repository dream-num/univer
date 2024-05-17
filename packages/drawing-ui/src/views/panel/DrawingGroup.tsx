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

import type { IDrawingGroupUpdateParam, IDrawingParam } from '@univerjs/core';
import { DrawingTypeEnum, ICommandService, IDrawingManagerService, LocaleService, Tools } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';
import { CreateCopySingle } from '@univerjs/icons';
import { Button } from '@univerjs/design';
import clsx from 'clsx';
import { getGroupState, IRenderManagerService, transformObjectOutOfGroup } from '@univerjs/engine-render';
import { getUpdateParams } from '../../utils/get-update-params';
import styles from './index.module.less';

export interface IDrawingGroupProps {
    drawings: IDrawingParam[];
    hasGroup: boolean;
}

export const DrawingGroup = (props: IDrawingGroupProps) => {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const renderManagerService = useDependency(IRenderManagerService);
    const drawingManagerService = useDependency(IDrawingManagerService);

    const { hasGroup, drawings } = props;

    const [groupShow, setGroupShow] = useState(false);

    const [groupBtnShow, setGroupBtnShow] = useState(true);
    const [ungroupBtnShow, setUngroupBtnShow] = useState(true);

    const gridDisplay = (isShow: boolean) => {
        return isShow ? 'block' : 'none';
    };

    const onGroupBtnClick = () => {
        const focusDrawings = drawingManagerService.getFocusDrawings();
        const { unitId, subUnitId } = focusDrawings[0];
        const groupId = Tools.generateRandomId(10);
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
                unitId, subUnitId, drawingId,
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
                unitId, subUnitId, drawingId,
                transform: newTransform,
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

        const onClearControlObserver = transformer.onClearControlObservable.add((changeSelf) => {
            if (changeSelf === true) {
                setGroupShow(false);
            }
        });

        const onChangeStartObserver = transformer.onChangeStartObservable.add((state) => {
            const { objects } = state;
            const params = getUpdateParams(objects, drawingManagerService);

            if (params.length === 0) {
                setGroupShow(false);
            } else if (params.length === 1) {
                setGroupShow(true);
                setGroupBtnShow(false);
                setUngroupBtnShow(true);
            } else {
                setGroupShow(true);
                setGroupBtnShow(true);
                setUngroupBtnShow(true);
            }
        });

        return () => {
            onChangeStartObserver?.dispose();
            onClearControlObserver?.dispose();
        };
    }, []);

    return (
        <div className={clsx(styles.imageCommonPanelGrid, styles.imageCommonPanelBorder)} style={{ display: gridDisplay(hasGroup === true ? groupShow : false) }}>
            <div className={styles.imageCommonPanelRow}>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelTitle)}>
                    <div>{localeService.t('image-panel.group.title')}</div>
                </div>
            </div>
            <div className={styles.imageCommonPanelRow}>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan2, styles.imageCommonPanelColumnCenter)}>
                    <Button size="small" onClick={() => { onGroupBtnClick(); }} style={{ display: gridDisplay(groupBtnShow) }}>
                        <div className={clsx(styles.imageCommonPanelInline)}><CreateCopySingle /></div>
                        <div className={clsx(styles.imageCommonPanelInline)}>{localeService.t('image-panel.group.group')}</div>
                    </Button>
                </div>
                {/* <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan3)}>
                    <Button size="small" onClick={() => { onGroupBtnClick(GroupType.regroup); }} style={{ display: gridDisplay(groupBtnShow) }}>
                        <div className={clsx(styles.imageCommonPanelInline)}><CreateCopySingle /></div>
                        <div className={clsx(styles.imageCommonPanelInline)}>{localeService.t('image-panel.group.reGroup')}</div>
                    </Button>
                </div> */}
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan2, styles.imageCommonPanelColumnCenter)}>
                    <Button size="small" onClick={() => { onUngroupBtnClick(); }} style={{ display: gridDisplay(ungroupBtnShow) }}>
                        <div className={clsx(styles.imageCommonPanelInline)}><CreateCopySingle /></div>
                        <div className={clsx(styles.imageCommonPanelInline)}>{localeService.t('image-panel.group.unGroup')}</div>
                    </Button>
                </div>
            </div>
        </div>
    );
};
