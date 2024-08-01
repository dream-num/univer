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

import React, { useEffect, useState } from 'react';

import type { ArrangeTypeEnum, Nullable } from '@univerjs/core';
import { LocaleService, useDependency } from '@univerjs/core';
import clsx from 'clsx';
import { Button, Checkbox, InputNumber } from '@univerjs/design';
import type { BaseObject, IChangeObserverConfig } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { CanvasView } from '@univerjs/slides';
import styles from './index.module.less';

interface IProps {
    unitId: string;
}

export default function TransformPanel(props: IProps) {
    const { unitId } = props;

    const localeService = useDependency(LocaleService);
    const canvasView = useDependency(CanvasView);

    const page = canvasView.getRenderUnitByPageId(unitId);
    const scene = page?.scene;
    if (!scene) return null;

    const transformer = scene.getTransformer();
    if (!transformer) return null;

    const selectedObjects = transformer.getSelectedObjectMap();
    const object = selectedObjects.values().next().value as Nullable<BaseObject>;
    if (!object) return null;

    const {
        width: originWidth = 0,
        height: originHeight = 0,
        left: originX = 0,
        top: originY = 0,
        angle: originRotation = 0,
    } = object;

    const [width, setWidth] = useState<number>(originWidth);
    const [height, setHeight] = useState(originHeight);
    const [xPosition, setXPosition] = useState(originX);
    const [yPosition, setYPosition] = useState(originY);
    const [rotation, setRotation] = useState(originRotation);
    // const [lockRatio, setLockRatio] = useState(transformer.keepRatio);

    // const handleLockRatioChange = (val: string | number | boolean) => {
    //     setLockRatio(val as boolean);
    //     transformer.keepRatio = val as boolean;
    // };

    const changeObs = (state: IChangeObserverConfig) => {
        const { objects } = state;
        // console.log(objects);
        // const params = getUpdateParams(objects, drawingManagerService);

        // if (params.length !== 1) {
        //     return;
        // }

        // const drawingParam = params[0];

        // if (drawingParam == null) {
        //     return;
        // }

        // const { transform } = drawingParam;

        // if (transform == null) {
        //     return;
        // }

        // const {
        //     width: originWidth,
        //     height: originHeight,
        //     left: originX,
        //     top: originY,
        //     angle: originRotation,
        // } = transform;

        // if (originWidth != null) {
        //     setWidth(originWidth);
        // }

        // if (originHeight != null) {
        //     setHeight(originHeight);
        // }

        // if (originX != null) {
        //     setXPosition(originX);
        // }

        // if (originY != null) {
        //     setYPosition(originY);
        // }

        // if (originRotation != null) {
        //     setRotation(originRotation);
        // }
    };
    useEffect(() => {
        const changeStartSub = transformer.changeStart$.subscribe((state) => {
            changeObs(state);
        });

        const changingSub = transformer.changing$.subscribe((state) => {
            changeObs(state);
        });

        // const focusSub = drawingManagerService.focus$.subscribe((drawings) => {
        //     if (drawings.length !== 1) {
        //         return;
        //     }

        //     const drawingParam = drawingManagerService.getDrawingByParam(drawings[0]);

        //     if (drawingParam == null) {
        //         return;
        //     }

        //     const transform = drawingParam.transform;

        //     if (transform == null) {
        //         return;
        //     }

        //     const {
        //         width: originWidth,
        //         height: originHeight,
        //         left: originX,
        //         top: originY,
        //         angle: originRotation,
        //     } = transform;

        //     if (originWidth != null) {
        //         setWidth(originWidth);
        //     }

        //     if (originHeight != null) {
        //         setHeight(originHeight);
        //     }

        //     if (originX != null) {
        //         setXPosition(originX);
        //     }

        //     if (originY != null) {
        //         setYPosition(originY);
        //     }

        //     if (originRotation != null) {
        //         setRotation(originRotation);
        //     }
        // });

        return () => {
            changingSub.unsubscribe();
            changeStartSub.unsubscribe();
            // focusSub.unsubscribe();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            className={clsx(styles.imageCommonPanelGrid, styles.imageCommonPanelBorder)}
        >
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
                                {/* <InputNumber precision={1} value={width} onChange={(val) => { handleWidthChange(val); }} className={styles.imageCommonPanelInput} /> */}
                                <InputNumber className={styles.imageCommonPanelInput} precision={1} value={width} />
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
                                {/* <InputNumber precision={1} value={height} onChange={(val) => { handleHeightChange(val); }} className={styles.imageCommonPanelInput} /> */}
                                <InputNumber className={styles.imageCommonPanelInput} precision={1} value={height} />
                            </div>
                        </div>
                    </label>
                </div>
                {/* <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan3)}>
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
                </div> */}
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
                                {/* <InputNumber precision={1} value={xPosition} onChange={(val) => { handleXChange(val); }} className={styles.imageCommonPanelInput} /> */}
                                <InputNumber className={styles.imageCommonPanelInput} precision={1} value={xPosition} />
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
                                {/* <InputNumber precision={1} value={yPosition} onChange={(val) => { handleYChange(val); }} className={styles.imageCommonPanelInput} /> */}
                                <InputNumber className={styles.imageCommonPanelInput} precision={1} value={yPosition} />
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
                                {/* <InputNumber precision={1} value={rotation} onChange={handleRotationChange} className={styles.imageCommonPanelInput} /> */}
                                <InputNumber className={styles.imageCommonPanelInput} precision={1} value={rotation} />
                            </div>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
}
