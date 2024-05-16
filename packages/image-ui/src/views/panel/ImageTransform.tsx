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
import { Checkbox, InputNumber } from '@univerjs/design';
import clsx from 'clsx';
import type { BaseObject, IChangeObserverConfig } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { getUpdateParams } from '../../utils/get-update-params';
import styles from './index.module.less';


export interface IImageTransformProps {
    transformShow: boolean;
    drawings: IDrawingParam[];
}

export const ImageTransform = (props: IImageTransformProps) => {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const drawingManagerService = useDependency(IDrawingManagerService);
    const renderManagerService = useDependency(IRenderManagerService);

    const { drawings, transformShow } = props;

    const drawingParam = drawings[0];

    if (drawingParam == null) {
        return;
    }

    const transform = drawingParam.transform;
    if (transform == null) {
        return;
    }

    const { unitId, subUnitId, drawingId, drawingType } = drawingParam;

    const renderObject = renderManagerService.getRenderById(unitId);
    const scene = renderObject?.scene;
    if (scene == null) {
        return;
    }
    const transformer = scene.getTransformerByCreate();

    const {
        width: originWidth = 0,
        height: originHeight = 0,
        left: originX = 0,
        top: originY = 0,
        angle: originRotation = 0,
    } = transform;


    const [width, setWidth] = useState<number>(originWidth);
    const [height, setHeight] = useState(originHeight);
    const [xPosition, setXPosition] = useState(originX);
    const [yPosition, setYPosition] = useState(originY);
    const [rotation, setRotation] = useState(originRotation);
    const [lockRatio, setLockRatio] = useState(transformer.keepRatio);

    const changeObs = (state: IChangeObserverConfig) => {
        const { objects } = state;
        const params = getUpdateParams(objects, drawingManagerService);

        if (params.length !== 1) {
            return;
        }

        const drawingParam = params[0];

        if (drawingParam == null) {
            return;
        }

        const transform = drawingParam.transform;

        if (transform == null) {
            return;
        }

        const {
            width: originWidth,
            height: originHeight,
            left: originX,
            top: originY,
            angle: originRotation,
        } = transform;

        if (originWidth != null) {
            setWidth(originWidth);
        }

        if (originHeight != null) {
            setHeight(originHeight);
        }

        if (originX != null) {
            setXPosition(originX);
        }

        if (originY != null) {
            setYPosition(originY);
        }

        if (originRotation != null) {
            setRotation(originRotation);
        }
    };


    useEffect(() => {
        const onChangeStartObserver = transformer.onChangeStartObservable.add((state) => {
            changeObs(state);
        });

        const onChangingObserver = transformer.onChangingObservable.add((state) => {
            changeObs(state);
        });


        return () => {
            onChangingObserver?.dispose();
            onChangeStartObserver?.dispose();
        };
    }, []);


    const handleWidthChange = (val: number | null) => {
        if (val == null) {
            return;
        }

        const updateParam: IDrawingParam = { unitId, subUnitId, drawingId, drawingType, transform: { width: val } };

        if (lockRatio) {
            const heightFix = (val / width) * height;
            setHeight(heightFix);
            updateParam.transform!.height = heightFix;
        }

        setWidth(val);

        drawingManagerService.featurePluginUpdateNotification([updateParam]);

        transformer.clearControls(false);
        transformer.refreshControls();
    };

    const handleHeightChange = (val: number | null) => {
        if (val == null) {
            return;
        }

        const updateParam: IDrawingParam = { unitId, subUnitId, drawingId, drawingType, transform: { height: val } };

        if (lockRatio) {
            const widthFix = (val / height) * width;
            setWidth(widthFix);
            updateParam.transform!.width = widthFix;
        }

        setHeight(val);

        drawingManagerService.featurePluginUpdateNotification([updateParam]);

        transformer.clearControls(false);
        transformer.refreshControls();
    };


    const handleXChange = (val: number | null) => {
        if (val == null) {
            return;
        }

        const updateParam: IDrawingParam = { unitId, subUnitId, drawingId, drawingType, transform: { left: val } };

        setXPosition(val);

        drawingManagerService.featurePluginUpdateNotification([updateParam]);

        transformer.clearControls(false);
        transformer.refreshControls();
    };

    const handleYChange = (val: number | null) => {
        if (val == null) {
            return;
        }

        const updateParam: IDrawingParam = { unitId, subUnitId, drawingId, drawingType, transform: { top: val } };

        setYPosition(val);

        drawingManagerService.featurePluginUpdateNotification([updateParam]);

        transformer.clearControls(false);
        transformer.refreshControls();
    };

    const handleRotationChange = (val: number | null) => {
        if (val == null) {
            return;
        }

        const updateParam: IDrawingParam = { unitId, subUnitId, drawingId, drawingType, transform: { angle: val } };

        setRotation(val);

        drawingManagerService.featurePluginUpdateNotification([updateParam]);

        transformer.clearControls(false);
        transformer.refreshControls();
    };

    const handleLockRatioChange = (val: string | number | boolean) => {
        setLockRatio(val as boolean);
        transformer.keepRatio = val as boolean;
    };

    const gridDisplay = (isShow: boolean) => {
        return isShow ? 'block' : 'none';
    };

    return (
        <div className={clsx(styles.imageCommonPanelGrid, styles.imageCommonPanelBorder)} style={{ display: gridDisplay(transformShow) }}>
            <div className={styles.imageCommonPanelRow}>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelTitle)}>
                    <div>{localeService.t('image-panel.transform.title')}</div>
                </div>
            </div>
            <div className={styles.imageCommonPanelRow}>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan3)}>
                    <label>
                        <div className={styles.imageCommonPanelRow}>
                            <div className={styles.imageCommonPanelColumn}>
                                {localeService.t('image-panel.transform.width')}
                            </div>
                        </div>
                        <div className={styles.imageCommonPanelRow}>
                            <div className={styles.imageCommonPanelColumn}>
                                <InputNumber precision={1} value={width} onChange={handleWidthChange} className={styles.imageCommonPanelInput} />
                            </div>
                        </div>
                    </label>
                </div>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan3)}>
                    <label>
                        <div className={styles.imageCommonPanelRow}>
                            <div className={styles.imageCommonPanelColumn}>
                                {localeService.t('image-panel.transform.height')}
                            </div>
                        </div>
                        <div className={styles.imageCommonPanelRow}>
                            <div className={styles.imageCommonPanelColumn}>
                                <InputNumber precision={1} value={height} onChange={handleHeightChange} className={styles.imageCommonPanelInput} />
                            </div>
                        </div>
                    </label>
                </div>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan3)}>
                    <label>
                        <div className={styles.imageCommonPanelRow}>
                            <div className={styles.imageCommonPanelColumn}>
                                {localeService.t('image-panel.transform.lock')}
                            </div>
                        </div>
                        <div className={clsx(styles.imageCommonPanelRow, styles.imageCommonPanelRowVertical)}>
                            <div className={styles.imageCommonPanelColumn}>
                                <Checkbox checked={lockRatio} onChange={handleLockRatioChange}></Checkbox>
                            </div>
                        </div>
                    </label>
                </div>
            </div>
            <div className={styles.imageCommonPanelRow}>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan3)}>
                    <label>
                        <div className={styles.imageCommonPanelRow}>
                            <div className={styles.imageCommonPanelColumn}>
                                {localeService.t('image-panel.transform.x')}
                            </div>
                        </div>
                        <div className={styles.imageCommonPanelRow}>
                            <div className={styles.imageCommonPanelColumn}>
                                <InputNumber precision={1} value={xPosition} onChange={handleXChange} className={styles.imageCommonPanelInput} />
                            </div>
                        </div>
                    </label>
                </div>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan3)}>
                    <label>
                        <div className={styles.imageCommonPanelRow}>
                            <div className={styles.imageCommonPanelColumn}>
                                {localeService.t('image-panel.transform.y')}
                            </div>
                        </div>
                        <div className={styles.imageCommonPanelRow}>
                            <div className={styles.imageCommonPanelColumn}>
                                <InputNumber precision={1} value={yPosition} onChange={handleYChange} className={styles.imageCommonPanelInput} />
                            </div>
                        </div>
                    </label>
                </div>
                <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan3)}>
                    <label>
                        <div className={styles.imageCommonPanelRow}>
                            <div className={styles.imageCommonPanelColumn}>
                                {localeService.t('image-panel.transform.rotate')}
                            </div>
                        </div>
                        <div className={styles.imageCommonPanelRow}>
                            <div className={styles.imageCommonPanelColumn}>
                                <InputNumber precision={1} value={rotation} onChange={handleRotationChange} className={styles.imageCommonPanelInput} />
                            </div>
                        </div>
                    </label>
                </div>
            </div>
        </div>

    );
};
