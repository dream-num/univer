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

import type { IPosition, Worksheet } from '@univerjs/core';
import { Disposable, DisposableCollection, ICommandService, IUniverInstanceService, Tools } from '@univerjs/core';
import type { BaseObject, IBoundRectNoAngle, IRender, SpreadsheetSkeleton } from '@univerjs/engine-render';
import { IRenderManagerService, Rect } from '@univerjs/engine-render';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { CanvasFloatDomService } from '@univerjs/ui';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';
import { SetScrollOperation } from '../commands/operations/scroll.operation';
import { SetZoomRatioOperation } from '../commands/operations/set-zoom-ratio.operation';
import { transformBound2DOMBound } from '../common/utils';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';

export interface ICanvasFloatDom {
    allowTransform: boolean;
    initPosition: IPosition;
    componentKey: string;
    unitId?: string;
    subUnitId?: string;
}

export function createObjectDOMPositionObserver(
    targetObject: BaseObject,
    currentRender: IRender,
    skeleton: SpreadsheetSkeleton,
    worksheet: Worksheet,
    commandService: ICommandService
) {
    const calc = () => {
        const { scene } = currentRender;
        const { left, top, width, height, angle } = targetObject;

        const bound: IBoundRectNoAngle = {
            left,
            right: left + width,
            top,
            bottom: top + height,
        };

        const offsetBound = transformBound2DOMBound(bound, scene, skeleton, worksheet);

        const position = {
            left: offsetBound.left,
            right: offsetBound.right,
            top: offsetBound.top,
            bottom: offsetBound.bottom,
            rotate: angle,
            width,
            height,
            absolute: offsetBound.absolute,
        };
        return position;
    };

    const position = calc();

    const position$ = new BehaviorSubject(position);
    const disposable = new DisposableCollection();

    disposable.add(commandService.onCommandExecuted((commandInfo) => {
        if (commandInfo.id === SetScrollOperation.id || commandInfo.id === SetZoomRatioOperation.id) {
            position$.next(calc());
        }
    }));

    targetObject.onTransformChangeObservable.add(() => {
        position$.next(calc());
    });

    return {
        position,
        position$,
        disposable,
    };
}

export class SheetCanvasFloatDomManagerService extends Disposable {
    private _domLayerMap: Map<string, Map<string, Map<string, IDisposable>>> = new Map();

    constructor(
        @Inject(IRenderManagerService) private _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService,
        @Inject(CanvasFloatDomService) private _canvasFloatDomService: CanvasFloatDomService,
        @Inject(SheetSkeletonManagerService) private _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(ICommandService) private _commandService: ICommandService
    ) {
        super();
    }

    private _ensureMap(unitId: string, subUnitId: string) {
        let unitMap = this._domLayerMap.get(unitId);
        if (!unitMap) {
            unitMap = new Map();
            this._domLayerMap.set(unitId, unitMap);
        }

        let subUnitMap = unitMap.get(subUnitId);
        if (!subUnitMap) {
            subUnitMap = new Map();
            unitMap.set(subUnitId, subUnitMap);
        }

        return subUnitMap;
    }

    // eslint-disable-next-line max-lines-per-function
    addFloatDomToPosition(layer: ICanvasFloatDom) {
        const target = getSheetCommandTarget(this._univerInstanceService, {
            unitId: layer.unitId,
            subUnitId: layer.subUnitId,
        });
        if (!target) {
            throw new Error('cannot find current target!');
        }

        const { unitId, subUnitId, workbook, worksheet } = target;
        const renderer = this._renderManagerService.getRenderById(unitId);
        const skeleton = this._sheetSkeletonManagerService.getUnitSkeleton(unitId, subUnitId);
        if (!renderer || !skeleton) {
            throw new Error('cannot find current renderer!');
        }

        const { allowTransform, initPosition, componentKey } = layer;
        const { scene, engine } = renderer;
        const id = Tools.generateRandomId();
        const canvas = engine.getCanvasElement();
        const disposableCollection = new DisposableCollection();
        const initialTransform = {
            ...initPosition,
            rotate: 0,
            width: initPosition.endX - initPosition.startX,
            height: initPosition.endY - initPosition.startY,
            absolute: {
                left: true,
                top: true,
            },
        };
        const position$ = new BehaviorSubject(initialTransform);

        const createLayer = () => {
            const obj = new Rect(id, {
                left: initPosition.startX,
                top: initPosition.startY,
                width: initPosition.endX - initPosition.startX + 2,
                height: initPosition.endY - initPosition.startY + 2,
            });
            scene.addObject(obj);

            if (allowTransform) {
                scene.attachTransformerTo(obj);
            }
            scene.makeDirty();

            const observer = createObjectDOMPositionObserver(obj, renderer, skeleton.skeleton, worksheet, this._commandService);

            const disposePosition = observer.position$.subscribe((pos) => {
                position$.next({
                    startX: pos.left,
                    startY: pos.top,
                    endX: pos.right,
                    endY: pos.bottom,
                    rotate: pos.rotate,
                    width: pos.width,
                    height: pos.height,
                    absolute: pos.absolute,
                });
            });

            this._canvasFloatDomService.addFloatDom({
                position$,
                id,
                componentKey,
                onPointerDown: (evt) => {
                    canvas.dispatchEvent(new PointerEvent(evt.type, evt));
                },
                onPointerMove: (evt: PointerEvent | MouseEvent) => {
                    canvas.dispatchEvent(new PointerEvent(evt.type, evt));
                },
                onPointerUp: (evt: PointerEvent | MouseEvent) => {
                    canvas.dispatchEvent(new PointerEvent(evt.type, evt));
                },
            });

            return {
                dispose: () => {
                    this._canvasFloatDomService.removeFloatDom(id);
                    observer.disposable.dispose();
                    observer.position$.complete();
                    disposePosition.unsubscribe();
                    scene.removeObject(obj);
                    obj.dispose();
                },
            };
        };

        let layerDisposable: IDisposable | undefined;
        if (subUnitId === workbook.getActiveSheet().getSheetId()) {
            layerDisposable = createLayer();
        }

        workbook.activeSheet$.subscribe((sheet) => {
            if (sheet?.getSheetId() === subUnitId) {
                layerDisposable?.dispose();
                layerDisposable = createLayer();
            } else {
                layerDisposable?.dispose();
                layerDisposable = undefined;
            }
        });

        const map = this._ensureMap(unitId, subUnitId);

        disposableCollection.add({
            dispose: () => {
                position$.complete();
                layerDisposable?.dispose();
                map.delete(id);
            },
        });

        map.set(id, disposableCollection);

        return {
            id,
            disposable: disposableCollection,
            position$,
        };
    }

    removeFloatDom(unitId: string, subUnitId: string, id: string) {
        const map = this._ensureMap(unitId, subUnitId);
        const current = map.get(id);
        current?.dispose();
    }
}
