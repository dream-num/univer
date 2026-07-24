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

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import type { IDrawingMapItem, IDrawingMapItemData } from '@univerjs/drawing';
import type { IDocDrawing } from '../services/doc-drawing.service';
import { BooleanNumber, Disposable, ICommandService, IResourceManagerService, IUniverInstanceService, PositionedObjectLayoutType, UniverInstanceType } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { InsertDocDrawingCommand } from '../commands/commands/insert-doc-drawing.command';
import { RemoveDocDrawingCommand } from '../commands/commands/remove-doc-drawing.command';
import { SetDocDrawingArrangeCommand } from '../commands/commands/set-drawing-arrange.command';
import { UpdateDrawingDocTransformCommand } from '../commands/commands/update-doc-drawing-transform.command';
import { UpdateDocDrawingWrappingStyleCommand } from '../commands/commands/update-doc-drawing-wrapping-style.command';
import { IDocDrawingService } from '../services/doc-drawing.service';

export const DOCS_DRAWING_PLUGIN = 'DOC_DRAWING_PLUGIN';
export interface IDocDrawingModel {
    drawings?: IDocumentData['drawings'];
    drawingsOrder?: IDocumentData['drawingsOrder'];
};

export function getDocDrawingRenderOrder(order: string[], drawings: IDocumentData['drawings'] = {}): string[] {
    return order
        .map((drawingId, index) => ({ drawingId, index }))
        .sort((a, b) => {
            const aBehind = isDocDrawingBehindText(drawings[a.drawingId]);
            const bBehind = isDocDrawingBehindText(drawings[b.drawingId]);

            if (aBehind !== bBehind) {
                return aBehind ? -1 : 1;
            }

            return a.index - b.index;
        })
        .map(({ drawingId }) => drawingId);
}

function isDocDrawingBehindText(drawing: NonNullable<IDocumentData['drawings']>[string] | undefined): boolean {
    return drawing?.layoutType === PositionedObjectLayoutType.WRAP_NONE && drawing.behindDoc === BooleanNumber.TRUE;
}

export class DocDrawingController extends Disposable {
    constructor(
        @IDocDrawingService private readonly _docDrawingService: IDocDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IResourceManagerService private _resourceManagerService: IResourceManagerService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._initSnapshot();
        this._initCommands();
    }

    private _initSnapshot() {
        const toJson = (unitId: string) => {
            const doc = this._univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
            if (doc) {
                const drawings = doc.getSnapshot().drawings;
                const drawingOrder = doc.getSnapshot().drawingsOrder;
                const data: IDrawingMapItem<IDocDrawing> = {
                    data: drawings ?? {},
                    order: drawingOrder ?? [],

                };
                return JSON.stringify(data);
            }
            return '';
        };
        const parseJson = (json: string): IDrawingMapItem<IDocDrawing> => {
            if (!json) {
                return { data: {}, order: [] };
            }
            try {
                return JSON.parse(json);
            } catch (err) {
                return { data: {}, order: [] };
            }
        };

        this.disposeWithMe(
            this._resourceManagerService.registerPluginResource<IDrawingMapItem<IDocDrawing>>({
                pluginName: DOCS_DRAWING_PLUGIN,
                businesses: [UniverInstanceType.UNIVER_DOC],
                toJson: (unitId) => toJson(unitId),
                parseJson: (json) => parseJson(json),
                onUnLoad: (unitId) => {
                    this._setDrawingDataForUnit(unitId, { data: {}, order: [] });
                },
                onLoad: (unitId, value) => {
                    this._setDrawingDataForUnit(unitId, { data: value.data ?? {}, order: value.order ?? [] });
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
        this.loadDrawingDataForUnit(unitId);
    }

    loadDrawingDataForUnit(unitId: string): boolean {
        const dataModel = this._univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        if (!dataModel) {
            return false;
        }

        const subUnitId = unitId;

        const drawingDataModels = dataModel.getDrawings();
        const drawingOrderModel = dataModel.getDrawingsOrder();

        if (!drawingDataModels || !drawingOrderModel) {
            return false;
        }

        // TODO@wzhudev: should move to docs-drawing.

        const subDrawings = {
            [subUnitId]: {
                unitId,
                subUnitId,
                data: drawingDataModels as IDrawingMapItemData<IDocDrawing>,
                order: drawingOrderModel,
            },
        };
        const renderSubDrawings = {
            [subUnitId]: {
                ...subDrawings[subUnitId],
                order: getDocDrawingRenderOrder(drawingOrderModel, drawingDataModels),
            },
        };

        this._docDrawingService.registerDrawingData(unitId, subDrawings);
        this._drawingManagerService.registerDrawingData(unitId, renderSubDrawings);
        return true;
    }

    private _initCommands() {
        [
            InsertDocDrawingCommand,
            RemoveDocDrawingCommand,
            UpdateDrawingDocTransformCommand,
            UpdateDocDrawingWrappingStyleCommand,
            SetDocDrawingArrangeCommand,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }
}
