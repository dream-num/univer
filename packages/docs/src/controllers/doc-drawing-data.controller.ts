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

import type { DocumentDataModel, IDrawingMapItem, IDrawingSubunitMap } from '@univerjs/core';
import { Disposable, IDrawingManagerService, IResourceManagerService, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { type IDocDrawing, IDocDrawingService } from '../services/doc-drawing.service';

export const DOC_DRAWING_PLUGIN = 'DOC_DRAWING_PLUGIN';
@OnLifecycle(LifecycleStages.Rendered, DocDrawingDataController)
export class DocDrawingDataController extends Disposable {
    constructor(
        @IDocDrawingService private readonly _docDrawingService: IDocDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IResourceManagerService private _resourceManagerService: IResourceManagerService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._initSnapshot();
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
                pluginName: DOC_DRAWING_PLUGIN,
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
}
