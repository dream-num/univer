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

import type { IDisposable } from '@univerjs/core';
import { Disposable, DisposableCollection, ICommandService, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService, pxToNum } from '@univerjs/engine-render';
import type { BaseObject, IBoundRectNoAngle, IRender } from '@univerjs/engine-render';
import type { IPopup } from '@univerjs/ui';
import { ICanvasPopupService } from '@univerjs/ui';
import { BehaviorSubject } from 'rxjs';

export interface ISlideCanvasPopup extends Pick<IPopup,
    'direction' | 'excludeOutside' | 'closeOnSelfTarget' | 'componentKey' | 'offset' | 'onClickOutside'
> {
    mask?: boolean;
    extraProps?: Record<string, any>;
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

            // const offsetBound = transformBound2OffsetBound(bound, scene);
            const { top: topOffset, left: leftOffset, width: domWidth } = canvasClientRect;
            const scaleAdjust = domWidth / widthOfCanvas;

            const position = {
                left: (bound.left * scaleAdjust * scaleX) + leftOffset,
                right: (bound.right * scaleAdjust * scaleX) + leftOffset,
                top: (bound.top * scaleAdjust * scaleY) + topOffset,
                bottom: (bound.bottom * scaleAdjust * scaleY) + topOffset,
            };
            return position;
        };

        const position = calc();
        const position$ = new BehaviorSubject(position);
        const disposable = new DisposableCollection();

        // disposable.add(this._commandService.onCommandExecuted((commandInfo) => {
        //     if (commandInfo.id === SetDocZoomRatioOperation.id) {
        //         position$.next(calc());
        //     }
        // }));

        // const viewMain = currentRender.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        // if (viewMain) {
        //     disposable.add(viewMain.onScrollAfter$.subscribeEvent(() => {
        //         position$.next(calc());
        //     }));
        // }

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
