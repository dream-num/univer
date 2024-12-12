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

import type { IDrawingSubunitMap } from '@univerjs/drawing';
import type { ISheetDrawing } from '../services/sheet-drawing.service';
import { Disposable, ICommandService, IResourceManagerService, UniverInstanceType } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { DeleteDrawingsCommand } from '../commands/commands/delete-drawings.command';
import { GroupSheetDrawingCommand } from '../commands/commands/group-sheet-drawing.command';
import { InsertSheetDrawingCommand } from '../commands/commands/insert-sheet-drawing.command';
import { RemoveSheetDrawingCommand } from '../commands/commands/remove-sheet-drawing.command';
import { SetDrawingArrangeCommand } from '../commands/commands/set-drawing-arrange.command';
import { SetSheetDrawingCommand } from '../commands/commands/set-sheet-drawing.command';
import { UngroupSheetDrawingCommand } from '../commands/commands/ungroup-sheet-drawing.command';
import { SetDrawingApplyMutation } from '../commands/mutations/set-drawing-apply.mutation';
import { ISheetDrawingService } from '../services/sheet-drawing.service';

export const SHEET_DRAWING_PLUGIN = 'SHEET_DRAWING_PLUGIN';

export class SheetsDrawingLoadController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @ISheetDrawingService private readonly _sheetDrawingService: ISheetDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IResourceManagerService private _resourceManagerService: IResourceManagerService
    ) {
        super();
        this._initSnapshot();
        this._initCommands();
    }

    private _initCommands() {
        [
            SetDrawingApplyMutation,
            DeleteDrawingsCommand,
            GroupSheetDrawingCommand,
            InsertSheetDrawingCommand,
            RemoveSheetDrawingCommand,
            SetDrawingArrangeCommand,
            SetSheetDrawingCommand,
            UngroupSheetDrawingCommand,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _initSnapshot() {
        const toJson = (unitId: string, model?: IDrawingSubunitMap<ISheetDrawing>) => {
            const map = model || this._sheetDrawingService.getDrawingDataForUnit(unitId);
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
                toJson: (unitId, model) => toJson(unitId, model),
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
