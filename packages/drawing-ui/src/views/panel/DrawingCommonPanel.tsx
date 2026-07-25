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
import { LocaleService } from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useDependency, useObservable } from '@univerjs/ui';
import { filter, map, merge } from 'rxjs';
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

function getPanelShowState(drawings: IDrawingParam[]) {
    if (drawings.length === 0) {
        return {
            arrangeShow: false,
            transformShow: false,
            alignShow: false,
            cropperShow: false,
            nullShow: true,
        };
    }

    if (drawings.length === 1) {
        return {
            arrangeShow: true,
            transformShow: true,
            alignShow: false,
            cropperShow: true,
            nullShow: false,
        };
    }

    return {
        arrangeShow: true,
        transformShow: false,
        alignShow: true,
        cropperShow: false,
        nullShow: false,
    };
}

export const DrawingCommonPanel = (props: IDrawingCommonPanelProps) => {
    const drawingManagerService = useDependency(IDrawingManagerService);
    const renderManagerService = useDependency(IRenderManagerService);
    const localeService = useDependency(LocaleService);

    const { drawings, hasArrange = true, hasTransform = true, hasAlign = true, hasCropper = true, hasGroup = true } = props;

    const drawingParam = drawings[0];
    const renderObject = drawingParam ? renderManagerService.getRenderUnitById(drawingParam.unitId) : undefined;
    const scene = renderObject?.scene;
    const transformer = scene?.getTransformerByCreate();

    const panelState = useObservable(
        () => merge(
            drawingManagerService.focus$.pipe(map(getPanelShowState)),
            ...(transformer
                ? [
                    transformer.clearControl$.pipe(
                        filter((changeSelf) => changeSelf === true),
                        map(() => getPanelShowState([]))
                    ),
                    transformer.changeStart$.pipe(
                        map((state) => getPanelShowState(
                            getUpdateParams(state.objects, drawingManagerService) as IDrawingParam[]
                        ))
                    ),
                ]
                : [])
        ),
        getPanelShowState(drawings),
        false,
        [drawingManagerService, transformer]
    );
    const { arrangeShow, transformShow, alignShow, cropperShow, nullShow } = panelState;

    if (!drawingParam || !scene || !transformer) {
        return null;
    }

    return (
        <>
            <div
                className={clsx('univer-h-full', {
                    'univer-hidden': !nullShow,
                })}
            >
                <div className="univer-flex univer-h-full univer-items-center univer-justify-center">
                    <span>
                        {localeService.t<LocaleKey>('drawing-ui.image-panel.null')}
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
