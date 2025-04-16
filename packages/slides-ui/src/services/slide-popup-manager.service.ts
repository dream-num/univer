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

import type { IDisposable } from '@univerjs/core';
import type { BaseObject, IBoundRectNoAngle, IRender, Scene } from '@univerjs/engine-render';
import type { IPopup } from '@univerjs/ui';
import { Disposable, DisposableCollection, ICommandService, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService, pxToNum } from '@univerjs/engine-render';
import { SLIDE_KEY } from '@univerjs/slides';
import { ICanvasPopupService } from '@univerjs/ui';
import { BehaviorSubject } from 'rxjs';

export interface ISlideCanvasPopup extends Pick<IPopup, 'direction' | 'excludeOutside' | 'componentKey' | 'offset' | 'onClickOutside' | 'hideOnInvisible'> {
    mask?: boolean;
    extraProps?: Record<string, any>;
}

export function transformBound2OffsetBound(originBound: IBoundRectNoAngle, scene: Scene): IBoundRectNoAngle {
    const topLeft = transformPosition2Offset(originBound.left, originBound.top, scene);
    const bottomRight = transformPosition2Offset(originBound.right, originBound.bottom, scene);

    return {
        left: topLeft.x,
        top: topLeft.y,
        right: bottomRight.x,
        bottom: bottomRight.y,
    };
}

export function transformPosition2Offset(x: number, y: number, scene: Scene) {
    const { scaleX, scaleY } = scene.getAncestorScale();
    const viewMain = scene.getViewport(SLIDE_KEY.VIEW);
    if (!viewMain) {
        return {
            x,
            y,
        };
    }

    const { viewportScrollX: actualScrollX, viewportScrollY: actualScrollY } = viewMain;

    const offsetX = (x - actualScrollX) * scaleX;

    const offsetY = (y - actualScrollY) * scaleY;

    return {
        x: offsetX,
        y: offsetY,
    };
}

export class SlideCanvasPopMangerService extends Disposable {
    constructor(
        @Inject(ICanvasPopupService) private readonly _globalPopupManagerService: ICanvasPopupService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
    }

    private _createObjectPositionObserver(
        targetObject: BaseObject,
        currentRender: IRender
    ) {
        const calc = () => {
            const { scene, engine } = currentRender;
            const { left, top, width, height } = targetObject;

            const horizontalOffset = (scene.width - (currentRender.mainComponent?.width ?? 0)) / 2;
            const verticalOffset = (scene.height - (currentRender.mainComponent?.height ?? 0)) / 2;

            const bound: IBoundRectNoAngle = {
                left,
                right: left + width,
                top,
                bottom: top + height,
            };
            const canvasElement = engine.getCanvasElement();
            const canvasClientRect = canvasElement.getBoundingClientRect();
            const widthOfCanvas = pxToNum(canvasElement.style.width); // declared width

            const { scaleX, scaleY } = scene.getAncestorScale();

            const offsetBound = transformBound2OffsetBound(bound, scene);
            const { top: topOffset, left: leftOffset, width: domWidth } = canvasClientRect;
            const scaleAdjust = domWidth / widthOfCanvas;

            const position = {
                left: (offsetBound.left * scaleAdjust * scaleX) + leftOffset + horizontalOffset,
                right: (offsetBound.right * scaleAdjust * scaleX) + leftOffset + horizontalOffset,
                top: (offsetBound.top * scaleAdjust * scaleY) + topOffset + verticalOffset,
                bottom: (offsetBound.bottom * scaleAdjust * scaleY) + topOffset + verticalOffset,
            };
            return position;
        };

        const position = calc();
        const position$ = new BehaviorSubject(position);
        const disposable = new DisposableCollection();

        return {
            position,
            position$,
            disposable,
        };
    }

    attachPopupToObject(targetObject: BaseObject, popup: ISlideCanvasPopup): IDisposable {
        const workbook = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_SLIDE)!;
        const unitId = workbook.getUnitId();
        // const subUnitId =

        const currentRender = this._renderManagerService.getRenderById(unitId);
        if (!currentRender) {
            return {
                dispose: () => {
                    // empty
                },
            };
        }

        const { position, position$, disposable } = this._createObjectPositionObserver(targetObject, currentRender);

        const id = this._globalPopupManagerService.addPopup({
            ...popup,
            unitId,
            subUnitId: 'default',
            anchorRect: position,
            anchorRect$: position$,
            canvasElement: currentRender.engine.getCanvasElement(),
        });

        return {
            dispose: () => {
                this._globalPopupManagerService.removePopup(id);
                position$.complete();
                disposable.dispose();
            },
        };
    }
}
