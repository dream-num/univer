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
import { LocaleService } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useDependency } from '@univerjs/ui';
import React, { useEffect, useState } from 'react';
import { getUpdateParams } from '../../utils/get-update-params';
import { DrawingAlign } from './DrawingAlign';
import { DrawingArrange } from './DrawingArrange';
import { DrawingGroup } from './DrawingGroup';
import { DrawingTransform } from './DrawingTransform';
import { ImageCropper } from './ImageCropper';

export interface IDrawingCommonPanelProps {
    drawings: IDrawingParam[];
    hasArrange?: boolean;
    hasTransform?: boolean;
    hasAlign?: boolean;
    hasCropper?: boolean;
    hasGroup?: boolean;
}

export const DrawingCommonPanel = (props: IDrawingCommonPanelProps) => {
    const drawingManagerService = useDependency(IDrawingManagerService);
    const renderManagerService = useDependency(IRenderManagerService);
    const localeService = useDependency(LocaleService);

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
    const [nullShow, setNullShow] = useState(false);
    // const [groupShow, setGroupShow] = useState(false);

    useEffect(() => {
        const clearControlSub = transformer.clearControl$.subscribe((changeSelf) => {
            if (changeSelf === true) {
                setArrangeShow(false);
                setTransformShow(false);
                setAlignShow(false);
                setCropperShow(false);
                setNullShow(true);
            }
        });

        const changeStartSub = transformer.changeStart$.subscribe((state) => {
            const { objects } = state;
            const params = getUpdateParams(objects, drawingManagerService);

            if (params.length === 0) {
                setArrangeShow(false);
                setTransformShow(false);
                setAlignShow(false);
                setCropperShow(false);
                setNullShow(true);
            } else if (params.length === 1) {
                setArrangeShow(true);
                setTransformShow(true);
                setAlignShow(false);
                setCropperShow(true);
                setNullShow(false);
            } else {
                setArrangeShow(true);
                setTransformShow(false);
                setAlignShow(true);
                setCropperShow(false);
                setNullShow(false);
            }
        });

        const focusSub = drawingManagerService.focus$.subscribe((drawings) => {
            if (drawings.length === 0) {
                setArrangeShow(false);
                setTransformShow(false);
                setAlignShow(false);
                setCropperShow(false);
                setNullShow(true);
            } else if (drawings.length === 1) {
                setArrangeShow(true);
                setTransformShow(true);
                setAlignShow(false);
                setCropperShow(true);
                setNullShow(false);
            } else {
                setArrangeShow(true);
                setTransformShow(false);
                setAlignShow(true);
                setCropperShow(false);
                setNullShow(false);
            }
        });

        return () => {
            changeStartSub.unsubscribe();
            clearControlSub.unsubscribe();
            focusSub.unsubscribe();
        };
    }, []);

    // TODO@siam-ese: use the new Form component to refactor this dialog panel.
    return (
        <>
            <div style={{ display: nullShow === true ? 'block' : 'none', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', top: '50%', marginTop: '-100px' }}>
                    <span>
                        {localeService.t('image-panel.null')}
                    </span>
                </div>
            </div>
            <DrawingArrange arrangeShow={hasArrange === true ? arrangeShow : false} drawings={drawings} />
            <DrawingTransform transformShow={hasTransform === true ? transformShow : false} drawings={drawings} />
            <DrawingAlign alignShow={hasAlign === true ? alignShow : false} drawings={drawings} />
            <ImageCropper cropperShow={hasCropper === true ? cropperShow : false} drawings={drawings} />
            <DrawingGroup hasGroup={hasGroup} drawings={drawings} />
        </>
    );
};
