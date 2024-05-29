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

import type { IDrawingSubunitMap } from '@univerjs/core';
import { Disposable, IDrawingManagerService, IResourceManagerService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { type ISheetDrawing, ISheetDrawingService } from '../services/sheet-drawing.service';

export const SHEET_DRAWING_PLUGIN = 'SHEET_DRAWING_PLUGIN';
@OnLifecycle(LifecycleStages.Ready, SheetDrawingDataController)
export class SheetDrawingDataController extends Disposable {
    constructor(
        @ISheetDrawingService private readonly _sheetDrawingService: ISheetDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IResourceManagerService private _resourceManagerService: IResourceManagerService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._initSnapshot();
    }

    private _initSnapshot() {
        const toJson = (unitId: string) => {
            const map = this._sheetDrawingService.getDrawingDataForUnit(unitId);
            if (map) {
                return JSON.stringify(map);
            }
            return '';
        };
        const parseJson = (json: string): IDrawingSubunitMap<ISheetDrawing> => {
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
            this._resourceManagerService.registerPluginResource<IDrawingSubunitMap<ISheetDrawing>>({
                pluginName: SHEET_DRAWING_PLUGIN,
                businesses: [UniverInstanceType.UNIVER_SHEET],
                toJson: (unitId) => toJson(unitId),
                parseJson: (json) => parseJson(json),
                onUnLoad: (unitId) => {
                    this._sheetDrawingService.removeDrawingDataForUnit(unitId);
                    this._drawingManagerService.removeDrawingDataForUnit(unitId);
                },
                onLoad: (unitId, value) => {
                    this._sheetDrawingService.registerDrawingData(unitId, value);
                    this._drawingManagerService.registerDrawingData(unitId, value);
                },
            })
        );
    }
}
