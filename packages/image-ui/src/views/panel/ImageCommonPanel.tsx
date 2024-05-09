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

import type { IDrawingParam, IDrawingSearch, Nullable } from '@univerjs/core';
import { DrawingTypeEnum, ICommandService, IDrawingManagerService, LocaleService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useRef, useState } from 'react';
import { CreateCopySingle } from '@univerjs/icons';
import { Button, Checkbox, Input, InputNumber, Select } from '@univerjs/design';
import clsx from 'clsx';
import type { BaseObject } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import styles from './index.module.less';


export interface IImageCommonPanel extends IDrawingSearch {

}

enum CropType {
    FREE = '0',
    R1_1 = '1',
    R16_9 = '2',
    R9_16 = '3',
    R5_4 = '4',
    R4_5 = '5',
    R4_3 = '6',
    R3_4 = '7',
    R3_2 = '8',
    R2_3 = '9',
}

enum AlignType {
    default = '0',
    left = '1',
    center = '2',
    right = '3',
    top = '4',
    middle = '5',
    bottom = '6',
    horizon = '7',
    vertical = '8',
}


export const ImageCommonPanel = (props: IImageCommonPanel) => {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const drawingManagerService = useDependency(IDrawingManagerService);
    const renderManagerService = useDependency(IRenderManagerService);

    const { unitId, subUnitId, drawingId, drawingType } = props;

    const drawingParam = drawingManagerService.getDrawingByParam({ unitId, subUnitId, drawingId, drawingType });
    if (drawingParam == null) {
        return;
    }
    const transform = drawingParam.transform;
    if (transform == null) {
        return;
    }

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

    const [arrangeShow, setArrangeShow] = useState(true);
    const [transformShow, setTransformShow] = useState(true);
    const [alignShow, setAlignShow] = useState(false);
    const [cropShow, setCropShow] = useState(true);
    const [groupShow, setGroupShow] = useState(false);

    function getUpdateParams(objects: Map<string, BaseObject>): Nullable<IDrawingParam>[] {
        const params: Nullable<IDrawingParam>[] = [];
        objects.forEach((object) => {
            const { oKey, left, top, height, width, angle } = object;

            const searchParam = drawingManagerService.getDrawingOKey(oKey);

            if (searchParam == null) {
                params.push(null);
                return true;
            }

            const { unitId, subUnitId, drawingId } = searchParam;

            params.push({
                unitId,
                subUnitId,
                drawingId,
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                transform: {
                    left,
                    top,
                    height,
                    width,
                    angle,
                },
            });
        });

        return params;
    }

    const [alignValue, setAlignValue] = useState<string>(AlignType.default as string);
    const alignOptions = [
        {
            label: localeService.t('image-panel.align.default'),
            value: AlignType.default,
        },
        {
            options: [
                {
                    label: localeService.t('image-panel.align.left'),
                    value: AlignType.left,
                }, {
                    label: localeService.t('image-panel.align.center'),
                    value: AlignType.center,
                }, {
                    label: localeService.t('image-panel.align.right'),
                    value: AlignType.right,
                },
            ],
        },
        {
            options: [
                {
                    label: localeService.t('image-panel.align.top'),
                    value: AlignType.top,
                }, {
                    label: localeService.t('image-panel.align.middle'),
                    value: AlignType.middle,
                }, {
                    label: localeService.t('image-panel.align.bottom'),
                    value: AlignType.bottom,
                },
            ],
        }, {
            options: [
                {
                    label: localeService.t('image-panel.align.horizon'),
                    value: AlignType.horizon,
                }, {
                    label: localeService.t('image-panel.align.vertical'),
                    value: AlignType.vertical,
                },
            ],
        },


    ];

    function handleAlignChange(value: string | number | boolean) {
        setAlignValue((value as string));
    }

    const [cropValue, setCropValue] = useState<string>(CropType.FREE as string);
    const cropOptions = [
        {
            label: localeService.t('image-panel.crop.mode'),
            value: CropType.FREE,
        }, {
            label: '1:1',
            value: CropType.R1_1,
        }, {
            label: '16:9',
            value: CropType.R16_9,
        }, {
            label: '9:16',
            value: CropType.R9_16,
        }, {
            label: '5:4',
            value: CropType.R5_4,
        }, {
            label: '4:5',
            value: CropType.R4_5,
        }, {
            label: '4:3',
            value: CropType.R4_3,
        }, {
            label: '3:4',
            value: CropType.R3_4,
        }, {
            label: '3:2',
            value: CropType.R3_2,
        }, {
            label: '2:3',
            value: CropType.R2_3,
        },
    ];

    function handleCropChange(value: string | number | boolean) {
        setCropValue((value as string));
    }

    useEffect(() => {
        const onClearControlObserver = transformer.onClearControlObservable.add((changeSelf) => {
            if (changeSelf === true) {
                setArrangeShow(false);
                setTransformShow(false);
                setAlignShow(false);
                setCropShow(false);
                setGroupShow(false);
            }
        });


        const onChangeStartObserver = transformer.onChangeStartObservable.add((state) => {
            const { objects } = state;
            const params = getUpdateParams(objects);

            if (params.length === 0) {
                setArrangeShow(false);
                setTransformShow(false);
                setAlignShow(false);
                setCropShow(false);
                setGroupShow(false);
            } else if (params.length === 1) {
                setArrangeShow(true);
                setTransformShow(true);
                setAlignShow(false);
                setCropShow(true);
                setGroupShow(false);
            } else {
                setArrangeShow(true);
                setTransformShow(false);
                setAlignShow(true);
                setCropShow(false);
                setGroupShow(true);
            }
        });


        const onChangingObserver = transformer.onChangingObservable.add((state) => {
            const { objects } = state;
            const params = getUpdateParams(objects);

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
        });


        return () => {
            onChangingObserver?.dispose();
            onChangeStartObserver?.dispose();
            onClearControlObserver?.dispose();
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

        drawingManagerService.extraUpdateNotification([updateParam]);

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

        drawingManagerService.extraUpdateNotification([updateParam]);

        transformer.clearControls(false);
        transformer.refreshControls();
    };


    const handleXChange = (val: number | null) => {
        if (val == null) {
            return;
        }

        const updateParam: IDrawingParam = { unitId, subUnitId, drawingId, drawingType, transform: { left: val } };

        setXPosition(val);

        drawingManagerService.extraUpdateNotification([updateParam]);

        transformer.clearControls(false);
        transformer.refreshControls();
    };

    const handleYChange = (val: number | null) => {
        if (val == null) {
            return;
        }

        const updateParam: IDrawingParam = { unitId, subUnitId, drawingId, drawingType, transform: { top: val } };

        setYPosition(val);

        drawingManagerService.extraUpdateNotification([updateParam]);

        transformer.clearControls(false);
        transformer.refreshControls();
    };

    const handleRotationChange = (val: number | null) => {
        if (val == null) {
            return;
        }

        const updateParam: IDrawingParam = { unitId, subUnitId, drawingId, drawingType, transform: { angle: val } };

        setRotation(val);

        drawingManagerService.extraUpdateNotification([updateParam]);

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
        <div className={styles.imageCommonPanel}>
            <div className={styles.imageCommonPanelGrid} style={{ display: gridDisplay(arrangeShow) }}>
                <div className={styles.imageCommonPanelRow}>
                    <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelTitle)}>
                        <div>{localeService.t('image-panel.arrange.title')}</div>
                    </div>
                </div>
                <div className={styles.imageCommonPanelRow}>
                    <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan2)}>
                        <Button size="small">
                            <div className={clsx(styles.imageCommonPanelInline)}><CreateCopySingle /></div>
                            <div className={clsx(styles.imageCommonPanelInline)}>{localeService.t('image-panel.arrange.forward')}</div>
                        </Button>
                    </div>
                    <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan2)}>
                        <Button size="small">
                            <div className={clsx(styles.imageCommonPanelInline)}><CreateCopySingle /></div>
                            <div className={clsx(styles.imageCommonPanelInline)}>{localeService.t('image-panel.arrange.backward')}</div>
                        </Button>
                    </div>
                </div>
                <div className={styles.imageCommonPanelRow}>
                    <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan2)}>
                        <Button size="small">
                            <div className={clsx(styles.imageCommonPanelInline)}><CreateCopySingle /></div>
                            <div className={clsx(styles.imageCommonPanelInline)}>{localeService.t('image-panel.arrange.front')}</div>
                        </Button>
                    </div>
                    <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan2)}>
                        <Button size="small">
                            <div className={clsx(styles.imageCommonPanelInline)}><CreateCopySingle /></div>
                            <div className={clsx(styles.imageCommonPanelInline)}>{localeService.t('image-panel.arrange.back')}</div>
                        </Button>
                    </div>
                </div>
            </div>
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
            <div className={clsx(styles.imageCommonPanelGrid, styles.imageCommonPanelBorder)} style={{ display: gridDisplay(alignShow) }}>
                <div className={styles.imageCommonPanelRow}>
                    <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelTitle)}>
                        <div>{localeService.t('image-panel.align.title')}</div>
                    </div>
                </div>
                <div className={styles.imageCommonPanelRow}>
                    <div className={clsx(styles.imageCommonPanelColumn)}>
                        <Select value={alignValue} options={alignOptions} onChange={handleAlignChange} />
                    </div>
                </div>
            </div>
            <div className={clsx(styles.imageCommonPanelGrid, styles.imageCommonPanelBorder)} style={{ display: gridDisplay(cropShow) }}>
                <div className={styles.imageCommonPanelRow}>
                    <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelTitle)}>
                        <div>{localeService.t('image-panel.crop.title')}</div>
                    </div>
                </div>
                <div className={clsx(styles.imageCommonPanelRow, styles.imageCommonPanelRowVertical)}>
                    <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan2)}>
                        <Button size="small">
                            <div className={clsx(styles.imageCommonPanelInline)}><CreateCopySingle /></div>
                            <div className={clsx(styles.imageCommonPanelInline)}>{localeService.t('image-panel.crop.start')}</div>
                        </Button>
                    </div>
                    <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan2)}>
                        <Select value={cropValue} options={cropOptions} onChange={handleCropChange} />
                    </div>
                </div>
            </div>
            <div className={clsx(styles.imageCommonPanelGrid, styles.imageCommonPanelBorder)} style={{ display: gridDisplay(groupShow) }}>
                <div className={styles.imageCommonPanelRow}>
                    <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelTitle)}>
                        <div>{localeService.t('image-panel.group.title')}</div>
                    </div>
                </div>
                <div className={styles.imageCommonPanelRow}>
                    <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan3)}>
                        <Button size="small">
                            <div className={clsx(styles.imageCommonPanelInline)}><CreateCopySingle /></div>
                            <div className={clsx(styles.imageCommonPanelInline)}>{localeService.t('image-panel.group.group')}</div>
                        </Button>
                    </div>
                    <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan3)}>
                        <Button size="small">
                            <div className={clsx(styles.imageCommonPanelInline)}><CreateCopySingle /></div>
                            <div className={clsx(styles.imageCommonPanelInline)}>{localeService.t('image-panel.group.reGroup')}</div>
                        </Button>
                    </div>
                    <div className={clsx(styles.imageCommonPanelColumn, styles.imageCommonPanelSpan3)}>
                        <Button size="small">
                            <div className={clsx(styles.imageCommonPanelInline)}><CreateCopySingle /></div>
                            <div className={clsx(styles.imageCommonPanelInline)}>{localeService.t('image-panel.group.unGroup')}</div>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
