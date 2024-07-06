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

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import { Disposable, ICommandService, IResourceManagerService, IUniverInstanceService, LifecycleService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import type { IDrawingMapItem, IDrawingMapItemData } from '@univerjs/drawing';
import { IDrawingManagerService } from '@univerjs/drawing';
import { Inject } from '@wendellhu/redi';
import { filter, first } from 'rxjs/operators';
import { type IDocDrawing, IDocDrawingService } from '../services/doc-drawing.service';
import { SetDocDrawingApplyMutation } from '../commands/mutations/set-drawing-apply.mutation';

export const DOCS_DRAWING_PLUGIN = 'DOC_DRAWING_PLUGIN';
export interface IDocDrawingModel { drawings?: IDocumentData['drawings']; drawingsOrder?: IDocumentData['drawingsOrder'] };

@OnLifecycle(LifecycleStages.Starting, DocDrawingLoadController)
export class DocDrawingLoadController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this.disposeWithMe(this._commandService.registerCommand(SetDocDrawingApplyMutation));
    }
}

@OnLifecycle(LifecycleStages.Starting, DocDrawingController)
export class DocDrawingController extends Disposable {
    constructor(
        @IDocDrawingService private readonly _docDrawingService: IDocDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IResourceManagerService private _resourceManagerService: IResourceManagerService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService,
        @Inject(LifecycleService) private _lifecycleService: LifecycleService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._initSnapshot();
        this._drawingInitializeListener();
    }

    private _initSnapshot() {
        const toJson = (unitId: string) => {
            const map = this._docDrawingService.getDrawingDataForUnit(unitId);
            if (map) {
                return JSON.stringify(map);
            }
            return '';
        };
        const parseJson = (json: string): IDocDrawingModel => {
            if (!json) {
                return { drawings: {}, drawingsOrder: [] };
            }
            try {
                return JSON.parse(json);
            } catch (err) {
                return { drawings: {}, drawingsOrder: [] };
            }
        };

        this.disposeWithMe(
            this._resourceManagerService.registerPluginResource<IDocDrawingModel>({
                pluginName: DOCS_DRAWING_PLUGIN,
                businesses: [UniverInstanceType.UNIVER_DOC],
                toJson: (unitId) => toJson(unitId),
                parseJson: (json) => parseJson(json),
                onUnLoad: (unitId) => {
                    this._setDrawingDataForUnit(unitId, { data: {}, order: [] });
                },
                onLoad: (unitId, value) => {
                    this._setDrawingDataForUnit(unitId, { data: value.drawings ?? {}, order: value.drawingsOrder ?? [] });
                },
            })
        );
    }

    private _setDrawingDataForUnit(unitId: string, drawingMapItem: IDrawingMapItem<IDocDrawing>) {
        const documentDataModel = this._univerInstanceService.getUnit<DocumentDataModel>(unitId);
        if (documentDataModel == null) {
            return;
        }
        documentDataModel.resetDrawing(drawingMapItem.data, drawingMapItem.order);
        this._initDataLoader();
    }

    private _initDataLoader(): boolean {
        const dataModel = this._univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        if (!dataModel) {
            return false;
        }

        const unitId = dataModel.getUnitId();
        const subUnitId = unitId;

        const drawingDataModels = dataModel.getDrawings();
        const drawingOrderModel = dataModel.getDrawingsOrder();

        if (!drawingDataModels || !drawingOrderModel) {
            return false;
        }

        // TODO@wzhudev: should move to docs-drawing.

        Object.keys(drawingDataModels).forEach((drawingId) => {
            const drawingDataModel = drawingDataModels[drawingId];
            // const docTransform = drawingDataModel.docTransform;
            // const transform = docDrawingPositionToTransform(docTransform);

            drawingDataModels[drawingId] = { ...drawingDataModel } as IDocDrawing;
        });

        const subDrawings = {
            [subUnitId]: {
                unitId,
                subUnitId,
                data: drawingDataModels as IDrawingMapItemData<IDocDrawing>,
                order: drawingOrderModel,
            },
        };

        this._docDrawingService.registerDrawingData(unitId, subDrawings);
        this._drawingManagerService.registerDrawingData(unitId, subDrawings);
        return true;
    }

    private _drawingInitializeListener() {
        this._lifecycleService.lifecycle$.pipe(filter((stage) => stage === LifecycleStages.Rendered), first()).subscribe((stage) => {
            const unitId = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_DOC)?.getUnitId();
            if (!unitId) {
                return;
            }
            this._docDrawingService.initializeNotification(unitId);
            this._drawingManagerService.initializeNotification(unitId);
        });
    }
}
