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

import { Disposable, DisposableCollection, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { BaseObject, IBoundRectNoAngle, IRender, Scene } from '@univerjs/engine-render';
import type { IPopup } from '@univerjs/ui';
import { ICanvasPopupService } from '@univerjs/ui';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';
import { SetDocZoomRatioOperation, VIEWPORT_KEY } from '@univerjs/docs';

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
    const viewMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
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

export interface IDocCanvasPopup extends Pick<IPopup,
    'direction' | 'excludeOutside' | 'closeOnSelfTarget' | 'componentKey' | 'offset' | 'onClickOutside'
> {
    mask?: boolean;
    extraProps?: Record<string, any>;
}

export class DocCanvasPopManagerService extends Disposable {
    constructor(
        @Inject(ICanvasPopupService) private readonly _globalPopupManagerService: ICanvasPopupService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
    }

    // #region attach to object

    private _createObjectPositionObserver(
        targetObject: BaseObject,
        currentRender: IRender
    ) {
        const calc = () => {
            const { scene } = currentRender;
            const { left, top, width, height } = targetObject;

            const bound: IBoundRectNoAngle = {
                left,
                right: left + width,
                top,
                bottom: top + height,
            };

            const offsetBound = transformBound2OffsetBound(bound, scene);

            const position = {
                left: offsetBound.left,
                right: offsetBound.right,
                top: offsetBound.top,
                bottom: offsetBound.bottom,
            };
            return position;
        };

        const position = calc();
        const position$ = new BehaviorSubject(position);
        const disposable = new DisposableCollection();

        disposable.add(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetDocZoomRatioOperation.id) {
                position$.next(calc());
            }
        }));

        const viewMain = currentRender.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        disposable.add(viewMain?.onScrollAfterObserver.add(() => {
            position$.next(calc());
        }));

        return {
            position,
            position$,
            disposable,
        };
    }

    /**
     * attach a popup to canvas object
     * @param targetObject target canvas object
     * @param popup popup item
     * @returns disposable
     */
    attachPopupToObject(targetObject: BaseObject, popup: IDocCanvasPopup): IDisposable {
        const workbook = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_DOC)!;
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
