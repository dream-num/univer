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
import { ICommandService, IDrawingManagerService, LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';
import { CreateCopySingle } from '@univerjs/icons';
import { Button } from '@univerjs/design';
import clsx from 'clsx';
import { IRenderManagerService } from '@univerjs/engine-render';
import { GroupType, SetImageGroupOperation } from '../../commands/operations/image-group.operation';
import { getUpdateParams } from '../../utils/get-update-params';
import styles from './index.module.less';


export interface IImageGroupProps {
    drawings: IDrawingParam[];
    hasGroup: boolean;
}

export const ImageGroup = (props: IImageGroupProps) => {
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

    const onGroupBtnClick = (groupType: GroupType) => {
        commandService.executeCommand(SetImageGroupOperation.id, {
            groupType,
        });
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
                    <Button size="small" onClick={() => { onGroupBtnClick(GroupType.group); }} style={{ display: gridDisplay(groupBtnShow) }}>
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
                    <Button size="small" onClick={() => { onGroupBtnClick(GroupType.ungroup); }} style={{ display: gridDisplay(ungroupBtnShow) }}>
                        <div className={clsx(styles.imageCommonPanelInline)}><CreateCopySingle /></div>
                        <div className={clsx(styles.imageCommonPanelInline)}>{localeService.t('image-panel.group.unGroup')}</div>
                    </Button>
                </div>
            </div>
        </div>
    );
};
