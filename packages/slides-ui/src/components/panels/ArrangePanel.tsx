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

import type { Nullable } from '@univerjs/core';
import type { Image, Rect, RichText } from '@univerjs/engine-render';
import { ICommandService, LocaleService } from '@univerjs/core';
import { Button } from '@univerjs/design';
import { BottomSingle, MoveDownSingle, MoveUpSingle, TopmostSingle } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';
import { UpdateSlideElementOperation } from '../../commands/operations/update-element.operation';
import { CanvasView } from '../../controllers/canvas-view';

enum ArrangeTypeEnum {
    forward,
    backward,
    front,
    back,
}

interface IProps {
    pageId: string;
    unitId: string;
}

export default function ArrangePanel(props: IProps) {
    const { pageId, unitId } = props;

    const localeService = useDependency(LocaleService);
    const canvasView = useDependency(CanvasView);
    const commandService = useDependency(ICommandService);

    const page = canvasView.getRenderUnitByPageId(pageId, unitId);
    const scene = page?.scene;
    if (!scene) return null;

    const transformer = scene.getTransformer();
    if (!transformer) return null;

    const selectedObjects = transformer.getSelectedObjectMap();
    const object = selectedObjects.values().next().value as Nullable<Rect | RichText | Image>;
    if (!object) return null;

    const onArrangeBtnClick = (arrangeType: ArrangeTypeEnum) => {
        const allObjects = scene.getAllObjects();

        const [minZIndex, maxZIndex] = allObjects.reduce(([min, max], obj) => {
            const zIndex = obj.zIndex;
            const minZIndex = zIndex < min ? zIndex : min;
            const maxZIndex = zIndex > max ? zIndex : max;

            return [minZIndex, maxZIndex];
        }, [0, 0]);

        let zIndex = object.zIndex;
        if (arrangeType === ArrangeTypeEnum.back) {
            zIndex = minZIndex - 1;
        } else if (arrangeType === ArrangeTypeEnum.front) {
            zIndex = maxZIndex + 1;
        } else if (arrangeType === ArrangeTypeEnum.forward) {
            zIndex = object.zIndex + 1;
        } else if (arrangeType === ArrangeTypeEnum.backward) {
            zIndex = object.zIndex - 1;
        }

        object.setProps({
            zIndex,
        });

        commandService.executeCommand(UpdateSlideElementOperation.id, {
            unitId,
            oKey: object?.oKey,
            props: {
                zIndex,
            },
        });
    };

    return (
        <div className="univer-relative univer-w-full">
            <div className="univer-relative univer-mt-2.5 univer-flex univer-h-full">
                <div
                    className={`
                      univer-w-full univer-text-left univer-text-gray-600
                      dark:univer-text-gray-200
                    `}
                >
                    <div>{localeService.t('image-panel.arrange.title')}</div>
                </div>
            </div>
            <div className="univer-relative univer-mt-2.5 univer-flex univer-h-full">
                <div className="univer-w-1/2">
                    <Button onClick={() => { onArrangeBtnClick(ArrangeTypeEnum.forward); }}>
                        <span className="univer-flex univer-items-center univer-gap-1">
                            <MoveUpSingle />
                            {localeService.t('image-panel.arrange.forward')}
                        </span>

                    </Button>
                </div>
                <div className="univer-w-1/2">
                    <Button onClick={() => { onArrangeBtnClick(ArrangeTypeEnum.backward); }}>
                        <span className="univer-flex univer-items-center univer-gap-1">
                            <MoveDownSingle />
                            {localeService.t('image-panel.arrange.backward')}
                        </span>

                    </Button>
                </div>
            </div>
            <div className="univer-relative univer-mt-2.5 univer-flex univer-h-full">
                <div className="univer-w-1/2">
                    <Button onClick={() => { onArrangeBtnClick(ArrangeTypeEnum.front); }}>
                        <span className="univer-flex univer-items-center univer-gap-1">
                            <TopmostSingle />
                            {localeService.t('image-panel.arrange.front')}
                        </span>

                    </Button>
                </div>
                <div className="univer-w-1/2">
                    <Button onClick={() => { onArrangeBtnClick(ArrangeTypeEnum.back); }}>
                        <span className="univer-flex univer-items-center univer-gap-1">
                            <BottomSingle />
                            {localeService.t('image-panel.arrange.back')}
                        </span>

                    </Button>
                </div>
            </div>
        </div>
    );
}
