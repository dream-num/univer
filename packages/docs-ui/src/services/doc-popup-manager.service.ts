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

import type { INeedCheckDisposable, ITextRangeParam } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { BaseObject, Documents, IBoundRectNoAngle, IRender, Scene } from '@univerjs/engine-render';
import type { IPopup } from '@univerjs/ui';
import { Disposable, DisposableCollection, ICommandService, Inject, IUniverInstanceService } from '@univerjs/core';
import { DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { IRenderManagerService, pxToNum } from '@univerjs/engine-render';
import { ICanvasPopupService } from '@univerjs/ui';
import { BehaviorSubject, map } from 'rxjs';
import { VIEWPORT_KEY } from '../basics/docs-view-key';
import { SetDocZoomRatioOperation } from '../commands/operations/set-doc-zoom-ratio.operation';
import { NodePositionConvertToCursor } from './selection/convert-text-range';
import { getLineBounding } from './selection/text-range';

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

export function transformOffset2Bound(offsetX: number, offsetY: number, scene: Scene) {
    const { scaleX, scaleY } = scene.getAncestorScale();
    const viewMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
    if (!viewMain) {
        return {
            x: offsetX,
            y: offsetY,
        };
    }

    const { viewportScrollX: actualScrollX, viewportScrollY: actualScrollY } = viewMain;

    const x = offsetX / scaleX + actualScrollX;

    const y = offsetY / scaleY + actualScrollY;

    return {
        x,
        y,
    };
}

export interface IDocCanvasPopup extends Omit<IPopup, 'anchorRect$' | 'children' | 'unitId' | 'subUnitId' | 'canvasElement'> {
    mask?: boolean;
    extraProps?: Record<string, any>;
    multipleDirection?: IPopup['direction'];
}

export const calcDocRangePositions = (range: ITextRangeParam, currentRender: IRender): IBoundRectNoAngle[] | undefined => {
    const { scene, mainComponent, engine } = currentRender;
    const skeleton = currentRender.with(DocSkeletonManagerService).getSkeleton();
    const startPosition = skeleton.findNodePositionByCharIndex(range.startOffset, true, range.segmentId, range.segmentPage);
    const endIndex = range.collapsed ? range.startOffset : range.endOffset - 1;
    const endPosition = skeleton.findNodePositionByCharIndex(endIndex, true, range.segmentId, range.segmentPage);
    const document = mainComponent as Documents;

    if (!endPosition || !startPosition) {
        return;
    }

    const documentOffsetConfig = document.getOffsetConfig();
    const { docsLeft, docsTop } = documentOffsetConfig;
    const canvasElement = engine.getCanvasElement();
    const canvasClientRect = canvasElement.getBoundingClientRect();
    const widthOfCanvas = pxToNum(canvasElement.style.width); // declared width
    const { top, left, width } = canvasClientRect; // real width affected by scale
    const scaleAdjust = width / widthOfCanvas;

    const { scaleX, scaleY } = scene.getAncestorScale();
    const convertor = new NodePositionConvertToCursor(documentOffsetConfig, skeleton);
    const { borderBoxPointGroup } = convertor.getRangePointData(startPosition, endPosition);
    const bounds = getLineBounding(borderBoxPointGroup);
    const res = bounds.map((bound) => transformBound2OffsetBound(bound, scene)).map((i) => ({
        left: (i.left + docsLeft * scaleX) * scaleAdjust + left,
        right: (i.right + docsLeft * scaleX) * scaleAdjust + left,
        top: (i.top + docsTop * scaleY) * scaleAdjust + top,
        bottom: (i.bottom + docsTop * scaleY) * scaleAdjust + top,
    }));

    return res;
};

export class DocCanvasPopManagerService extends Disposable {
    constructor(
        @Inject(ICanvasPopupService) private readonly _globalPopupManagerService: ICanvasPopupService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
    }

    private _createRectPositionObserver(rect: IBoundRectNoAngle | (() => IBoundRectNoAngle), currentRender: IRender) {
        const calc = () => {
            const { scene, engine } = currentRender;
            const bound: IBoundRectNoAngle = typeof rect === 'function' ? rect() : rect;
            const canvasElement = engine.getCanvasElement();
            const canvasClientRect = canvasElement.getBoundingClientRect();
            const widthOfCanvas = pxToNum(canvasElement.style.width); // declared width

            const offsetBound = transformBound2OffsetBound(bound, scene);
            const { top: topOffset, left: leftOffset, width: domWidth } = canvasClientRect;
            const scaleAdjust = domWidth / widthOfCanvas;

            const position = {
                left: (offsetBound.left * scaleAdjust) + leftOffset,
                right: (offsetBound.right * scaleAdjust) + leftOffset,
                top: (offsetBound.top * scaleAdjust) + topOffset,
                bottom: (offsetBound.bottom * scaleAdjust) + topOffset,
            };
            return position;
        };

        const position = calc();
        const position$ = new BehaviorSubject(position);
        const disposable = new DisposableCollection();

        disposable.add(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetDocZoomRatioOperation.id || commandInfo.id === RichTextEditingMutation.id) {
                const newPosition = calc();
                if (newPosition) {
                    position$.next(newPosition);
                }
            }
        }));

        const viewMain = currentRender.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (viewMain) {
            disposable.add(viewMain.onScrollAfter$.subscribeEvent(() => {
                position$.next(calc());
            }));
        }

        return {
            position,
            position$,
            disposable,
        };
    }

    private _createObjectPositionObserver(
        targetObject: BaseObject,
        currentRender: IRender
    ) {
        const getBound = () => {
            const { left, top, width, height } = targetObject;
            const bound: IBoundRectNoAngle = {
                left,
                right: left + width,
                top,
                bottom: top + height,
            };
            return bound;
        };

        return this._createRectPositionObserver(getBound, currentRender);
    }

    private _createRangePositionObserver(range: ITextRangeParam, currentRender: IRender) {
        const positions = calcDocRangePositions(range, currentRender) ?? [];
        const positions$ = new BehaviorSubject(positions);
        const disposable = new DisposableCollection();

        disposable.add(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetDocZoomRatioOperation.id || commandInfo.id === RichTextEditingMutation.id) {
                const params = commandInfo.params as IRichTextEditingMutationParams;
                if (params.unitId === currentRender.unitId) {
                    const position = calcDocRangePositions(range, currentRender);
                    if (position) {
                        positions$.next(position);
                    }
                }
            }
        }));

        const viewMain = currentRender.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (viewMain) {
            disposable.add(viewMain.onScrollAfter$.subscribeEvent(() => {
                const position = calcDocRangePositions(range, currentRender);
                if (position) {
                    positions$.next(position);
                }
            }));
        }

        return {
            positions,
            positions$,
            disposable,
        };
    }

    attachPopupToRect(rect: IBoundRectNoAngle, popup: IDocCanvasPopup, unitId: string): INeedCheckDisposable {
        const currentRender = this._renderManagerService.getRenderById(unitId);
        if (!currentRender) {
            throw new Error(`Current render not found, unitId: ${unitId}`);
        }

        const { position, position$, disposable } = this._createRectPositionObserver(rect, currentRender);
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
            canDispose: () => this._globalPopupManagerService.activePopupId !== id,
        };
    }

    // #region attach to object
    /**
     * attach a popup to canvas object
     * @param targetObject target canvas object
     * @param popup popup item
     * @returns disposable
     */
    attachPopupToObject(targetObject: BaseObject, popup: IDocCanvasPopup, unitId: string): INeedCheckDisposable {
        const currentRender = this._renderManagerService.getRenderById(unitId);
        if (!currentRender) {
            throw new Error(`Current render not found, unitId: ${unitId}`);
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
            canDispose: () => this._globalPopupManagerService.activePopupId !== id,
        };
    }

    // #endregion
    // #region attach to range
    /**
     * attach a popup to doc range
     * @param range doc range
     * @param popup popup item
     * @param unitId unit id
     * @returns disposable
     */
    attachPopupToRange(range: ITextRangeParam, popup: IDocCanvasPopup, unitId: string): INeedCheckDisposable {
        const doc = this._univerInstanceService.getUnit(unitId);
        if (!doc) {
            throw new Error(`Document not found, unitId: ${unitId}`);
        }
        const { direction = 'top', multipleDirection } = popup;
        const currentRender = this._renderManagerService.getRenderById(unitId);
        if (!currentRender) {
            throw new Error(`Current render not found, unitId: ${unitId}`);
        }

        const { positions: bounds, positions$: bounds$, disposable } = this._createRangePositionObserver(range, currentRender);
        const position$ = bounds$.pipe(map((bounds) => direction.includes('top') ? bounds[0] : bounds[bounds.length - 1]));

        const id = this._globalPopupManagerService.addPopup({
            ...popup,
            unitId,
            subUnitId: 'default',
            anchorRect: direction.includes('top') ? bounds[0] : bounds[bounds.length - 1],
            anchorRect$: position$,
            excludeRects: bounds,
            excludeRects$: bounds$,
            direction: (['top', 'bottom', 'horizontal'].some((i) => direction.includes(i)))
                ? bounds.length > 1
                    ? multipleDirection ?? direction
                    : direction
                : direction,
            canvasElement: currentRender.engine.getCanvasElement(),
        });

        return {
            dispose: () => {
                this._globalPopupManagerService.removePopup(id);
                bounds$.complete();
                disposable.dispose();
            },
            canDispose: () => this._globalPopupManagerService.activePopupId !== id,
        };
    }
    // #endregion
}
