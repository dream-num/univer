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
import { DrawingTypeEnum, IDrawingManagerService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useEffect, useState } from 'react';
import type { BaseObject } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ImageArrange } from './ImageArrange';
import { ImageTransform } from './ImageTransform';
import { ImageAlign } from './ImageAlign';
import { ImageCropper } from './ImageCropper';
import { ImageGroup } from './ImageGroup';

export interface IImageCommonPanelProps {
    drawings: IDrawingParam[];
    hasArrange?: boolean;
    hasTransform?: boolean;
    hasAlign?: boolean;
    hasCropper?: boolean;
    hasGroup?: boolean;
}

export const ImageCommonPanel = (props: IImageCommonPanelProps) => {
    const drawingManagerService = useDependency(IDrawingManagerService);
    const renderManagerService = useDependency(IRenderManagerService);

    const { drawings, hasArrange = true, hasTransform = true, hasAlign = true, hasCropper = true, hasGroup = true } = props;

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


    const [arrangeShow, setArrangeShow] = useState(true);
    const [transformShow, setTransformShow] = useState(true);
    const [alignShow, setAlignShow] = useState(false);
    const [cropperShow, setCropperShow] = useState(true);
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

    useEffect(() => {
        const onClearControlObserver = transformer.onClearControlObservable.add((changeSelf) => {
            if (changeSelf === true) {
                setArrangeShow(false);
                setTransformShow(false);
                setAlignShow(false);
                setCropperShow(false);
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
                setCropperShow(false);
                setGroupShow(false);
            } else if (params.length === 1) {
                setArrangeShow(true);
                setTransformShow(true);
                setAlignShow(false);
                setCropperShow(true);
                setGroupShow(false);
            } else {
                setArrangeShow(true);
                setTransformShow(false);
                setAlignShow(true);
                setCropperShow(false);
                setGroupShow(true);
            }
        });

        return () => {
            onChangeStartObserver?.dispose();
            onClearControlObserver?.dispose();
        };
    }, []);


    return (
        <>
            <ImageArrange arrangeShow={hasArrange === true ? arrangeShow : false} drawings={drawings} />
            <ImageTransform transformShow={hasTransform === true ? transformShow : false} drawings={drawings} />
            <ImageAlign alignShow={hasAlign === true ? alignShow : false} drawings={drawings} />
            <ImageCropper cropperShow={hasCropper === true ? cropperShow : false} drawings={drawings} />
            <ImageGroup groupShow={hasGroup === true ? groupShow : false} drawings={drawings} />
        </>
    );
};
