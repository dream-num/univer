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

import type { DocumentDataModel } from '@univerjs/core';
import { Disposable, ICommandService, IResourceManagerService, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { ITextSelectionRenderManager } from '@univerjs/engine-render';
import { docDrawingPositionToTransform } from '@univerjs/docs-ui';
import type { IDrawingMapItem, IDrawingMapItemData, IDrawingSubunitMap } from '@univerjs/drawing';
import { IDrawingManagerService } from '@univerjs/drawing';
import { type IDocDrawing, IDocDrawingService } from '../services/doc-drawing.service';
import { SetDocDrawingApplyMutation } from '../commands/mutations/set-drawing-apply.mutation';

export const DOCS_DRAWING_PLUGIN = 'DOC_DRAWING_PLUGIN';

@OnLifecycle(LifecycleStages.Starting, DocDrawingLoadController)
export class DocDrawingLoadController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this.disposeWithMe(this._commandService.registerCommand(SetDocDrawingApplyMutation));
    }
}

@OnLifecycle(LifecycleStages.Rendered, DocDrawingController)
export class DocDrawingController extends Disposable {
    constructor(
        @IDocDrawingService private readonly _docDrawingService: IDocDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IResourceManagerService private _resourceManagerService: IResourceManagerService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._initSnapshot();
        this._initDataLoader();
    }

    private _initSnapshot() {
        const toJson = (unitId: string) => {
            const map = this._docDrawingService.getDrawingDataForUnit(unitId);
            if (map) {
                return JSON.stringify(map);
            }
            return '';
        };
        const parseJson = (json: string): IDrawingSubunitMap<IDocDrawing> => {
            if (!json) {
                return {};
            }
            try {
                return JSON.parse(json);
            } catch (err) {
                return {};
            }
        };
        this.disposeWithMe(
            this._resourceManagerService.registerPluginResource<IDrawingSubunitMap<IDocDrawing>>({
                pluginName: DOCS_DRAWING_PLUGIN,
                businesses: [UniverInstanceType.UNIVER_DOC],
                toJson: (unitId) => toJson(unitId),
                parseJson: (json) => parseJson(json),
                onUnLoad: (unitId) => {
                    this._docDrawingService.removeDrawingDataForUnit(unitId);
                    this._drawingManagerService.removeDrawingDataForUnit(unitId);
                    this._setDrawingDataForUnit(unitId, { data: {}, order: [] });
                },
                onLoad: (unitId, value) => {
                    this._docDrawingService.registerDrawingData(unitId, value);
                    this._drawingManagerService.registerDrawingData(unitId, value);
                    this._setDrawingDataForUnit(unitId, value[unitId]);
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
            const docTransform = drawingDataModel.docTransform;
            const transform = docDrawingPositionToTransform(docTransform);

            drawingDataModels[drawingId] = { ...drawingDataModel, transform } as IDocDrawing;
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
}
