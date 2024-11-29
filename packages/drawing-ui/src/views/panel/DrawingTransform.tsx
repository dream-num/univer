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

import type { IDrawingParam, Nullable } from '@univerjs/core';
import type { IChangeObserverConfig, Scene } from '@univerjs/engine-render';
import { debounce, LocaleService, useDependency } from '@univerjs/core';
import { Checkbox, InputNumber } from '@univerjs/design';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { MIN_DRAWING_HEIGHT_LIMIT, MIN_DRAWING_WIDTH_LIMIT, RANGE_DRAWING_ROTATION_LIMIT } from '../../utils/config';
import { getUpdateParams } from '../../utils/get-update-params';
import styles from './index.module.less';

export interface IDrawingTransformProps {
    transformShow: boolean;
    drawings: IDrawingParam[];
}

const INPUT_DEBOUNCE_TIME = 300;

export const DrawingTransform = (props: IDrawingTransformProps) => {
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

    const topScene = scene.getEngine()?.activeScene as Nullable<Scene>;
    if (topScene == null) {
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

    const checkMoveBoundary = (left: number, top: number, width: number, height: number) => {
        const { width: topSceneWidth, height: topSceneHeight } = topScene;
        const { ancestorLeft, ancestorTop } = scene;

        let limitLeft = left;
        let limitTop = top;
        let limitWidth = width;
        let limitHeight = height;

        if (left + ancestorLeft < 0) {
            limitLeft = -ancestorLeft;
        }

        if (top + ancestorTop < 0) {
            limitTop = -ancestorTop;
        }

        limitWidth = topSceneWidth - limitLeft - ancestorLeft;

        if (limitWidth < MIN_DRAWING_WIDTH_LIMIT) {
            limitWidth = MIN_DRAWING_WIDTH_LIMIT;
        }

        limitHeight = topSceneHeight - limitTop - ancestorTop;

        if (limitHeight < MIN_DRAWING_WIDTH_LIMIT) {
            limitHeight = MIN_DRAWING_WIDTH_LIMIT;
        }

        if (left + limitWidth + ancestorLeft > topSceneWidth) {
            limitLeft = topSceneWidth - width - ancestorLeft;
        }

        if (top + limitHeight + ancestorTop > topSceneHeight) {
            limitTop = topSceneHeight - height - ancestorTop;
        }

        return {
            limitLeft,
            limitTop,
            limitWidth,
            limitHeight,
        };
    };

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

        const { transform } = drawingParam;

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
        const subscriptions = [
            transformer.changeStart$.subscribe((state) => {
                changeObs(state);
            }),
            transformer.changing$.subscribe((state) => {
                changeObs(state);
            }),
            transformer.changeEnd$.subscribe((state) => {
                changeObs(state);
            }),
            drawingManagerService.focus$.subscribe((drawings) => {
                if (drawings.length !== 1) {
                    return;
                }

                const drawingParam = drawingManagerService.getDrawingByParam(drawings[0]);

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
            }),
        ];

        return () => {
            subscriptions.forEach((sub) => sub.unsubscribe());
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleWidthChange = debounce((val: number | null) => {
        if (val == null) {
            return;
        }

        val = Math.max(val, MIN_DRAWING_WIDTH_LIMIT);

        const { limitWidth, limitHeight } = checkMoveBoundary(xPosition, yPosition, val, height);

        val = Math.min(val, limitWidth);

        const updateParam: IDrawingParam = { unitId, subUnitId, drawingId, drawingType, transform: { width: val } };

        if (lockRatio) {
            let heightFix = (val / width) * height;
            heightFix = Math.max(heightFix, MIN_DRAWING_HEIGHT_LIMIT);
            if (heightFix > limitHeight) {
                return;
            }
            setHeight(heightFix);
            updateParam.transform!.height = heightFix;
        }

        setWidth(val);

        drawingManagerService.featurePluginUpdateNotification([updateParam]);

        transformer.refreshControls().changeNotification();
    }, INPUT_DEBOUNCE_TIME);

    const handleHeightChange = debounce((val: number | null) => {
        if (val == null) {
            return;
        }
        val = Math.max(val, MIN_DRAWING_WIDTH_LIMIT);

        const { limitHeight, limitWidth } = checkMoveBoundary(xPosition, yPosition, width, val);

        val = Math.min(val, limitHeight); ;

        const updateParam: IDrawingParam = { unitId, subUnitId, drawingId, drawingType, transform: { height: val } };

        if (lockRatio) {
            let widthFix = (val / height) * width;
            widthFix = Math.max(widthFix, MIN_DRAWING_WIDTH_LIMIT);
            if (widthFix > limitWidth) {
                return;
            }
            setWidth(widthFix);
            updateParam.transform!.width = widthFix;
        }

        setHeight(val);

        drawingManagerService.featurePluginUpdateNotification([updateParam]);

        transformer.refreshControls().changeNotification();
    }, INPUT_DEBOUNCE_TIME);

    const handleXChange = debounce((val: number | null) => {
        if (val == null) {
            return;
        }

        const { limitLeft } = checkMoveBoundary(val, yPosition, width, height);

        val = limitLeft;

        const updateParam: IDrawingParam = { unitId, subUnitId, drawingId, drawingType, transform: { left: val } };

        setXPosition(val);

        drawingManagerService.featurePluginUpdateNotification([updateParam]);

        transformer.refreshControls().changeNotification();
    }, INPUT_DEBOUNCE_TIME);

    const handleYChange = debounce((val: number | null) => {
        if (val == null) {
            return;
        }

        const { limitTop } = checkMoveBoundary(xPosition, val, width, height);

        val = limitTop;

        const updateParam: IDrawingParam = { unitId, subUnitId, drawingId, drawingType, transform: { top: val } };

        setYPosition(val);

        drawingManagerService.featurePluginUpdateNotification([updateParam]);

        transformer.refreshControls().changeNotification();
    }, INPUT_DEBOUNCE_TIME);

    const handleRotationChange = (val: number | null) => {
        if (val == null) {
            return;
        }

        const [min, max] = RANGE_DRAWING_ROTATION_LIMIT;

        if (val < min) {
            val = min;
        }

        if (val > max) {
            val = max;
        }

        const updateParam: IDrawingParam = { unitId, subUnitId, drawingId, drawingType, transform: { angle: val } };

        setRotation(val);

        drawingManagerService.featurePluginUpdateNotification([updateParam]);

        transformer.refreshControls().changeNotification();
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
                                <InputNumber precision={1} value={width} onChange={(val) => { handleWidthChange(val); }} className={styles.imageCommonPanelInput} />
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
                                <InputNumber precision={1} value={height} onChange={(val) => { handleHeightChange(val); }} className={styles.imageCommonPanelInput} />
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
                                <InputNumber precision={1} value={xPosition} onChange={(val) => { handleXChange(val); }} className={styles.imageCommonPanelInput} />
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
                                <InputNumber precision={1} value={yPosition} onChange={(val) => { handleYChange(val); }} className={styles.imageCommonPanelInput} />
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
