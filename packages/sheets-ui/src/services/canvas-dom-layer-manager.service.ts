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

import type { IPosition } from '@univerjs/core';
import { Disposable, DisposableCollection, ICommandService, IUniverInstanceService, Tools } from '@univerjs/core';
import { IRenderManagerService, Rect } from '@univerjs/engine-render';
import { getSheetCommandTarget } from '@univerjs/sheets';
import { CanvasDomLayerService } from '@univerjs/ui';
import type { IDisposable } from '@wendellhu/redi';
import { Inject } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';
import { createObjectPositionObserver } from './canvas-pop-manager.service';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';

export interface ICanvasDomLayer {
    allowTransform: boolean;
    initPosition: IPosition;
    componentKey: string;
    unitId?: string;
    subUnitId?: string;
}

export class SheetCanvasDomLayerManagerService extends Disposable {
    private _domLayerMap: Map<string, Map<string, Map<string, IDisposable>>> = new Map();

    constructor(
        @Inject(IRenderManagerService) private _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService,
        @Inject(CanvasDomLayerService) private _canvasDomLayerService: CanvasDomLayerService,
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
    addDomLayerToPosition(layer: ICanvasDomLayer) {
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
        const { scene } = renderer;
        const id = Tools.generateRandomId();

        const disposableCollection = new DisposableCollection();
        const initialTransform = {
            ...initPosition,
            rotate: 0,
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

            const observer = createObjectPositionObserver(obj, renderer, skeleton.skeleton, worksheet, this._commandService);

            const disposePosition = observer.position$.subscribe((pos) => {
                position$.next({
                    startX: pos.left,
                    startY: pos.top,
                    endX: pos.right,
                    endY: pos.bottom,
                    rotate: pos.rotate,
                });
            });

            this._canvasDomLayerService.addDomLayer({
                position$,
                id,
                componentKey,
                onClick: (evt) => {
                    obj.triggerPointerDown(evt);
                    obj.triggerPointerUp(evt);
                },
            });

            return {
                dispose: () => {
                    this._canvasDomLayerService.removeDomLayer(id);
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

    removeDomLayer(unitId: string, subUnitId: string, id: string) {
        const map = this._ensureMap(unitId, subUnitId);
        const current = map.get(id);
        current?.dispose();
    }
}
