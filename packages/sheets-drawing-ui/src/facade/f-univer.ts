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

import type { IDrawingSearch, IEventBase, Injector } from '@univerjs/core';
import type { ISheetImage } from '@univerjs/sheets-drawing';
import type { IDeleteDrawingCommandParams, IInsertDrawingCommandParams, ISetDrawingCommandParams } from '@univerjs/sheets-drawing-ui';
import type { FWorkbook } from '@univerjs/sheets/facade';
import type { IBeforeOverGridImageChangeParamObject } from './f-event';
import { FUniver, ICommandService } from '@univerjs/core';
import { IDrawingManagerService, SetDrawingSelectedOperation } from '@univerjs/drawing';
import { InsertSheetDrawingCommand, RemoveSheetDrawingCommand, SetSheetDrawingCommand } from '@univerjs/sheets-drawing-ui';
import { FOverGridImage } from './f-over-grid-image';

interface IBeforeOverGridImageInsertParam extends IEventBase {
    workbook: FWorkbook;
    insertImageParams: ISheetImage[];
}

interface IBeforeOverGridImageRemoveParam extends IEventBase {
    workbook: FWorkbook;
    images: FOverGridImage[];
}

interface IBeforeOverGridImageChangeParam extends IEventBase {
    workbook: FWorkbook;
    images: IBeforeOverGridImageChangeParamObject[];
}

interface IBeforeOverGridImageSelectParam extends IEventBase {
    workbook: FWorkbook;
    selectedImages: FOverGridImage[];
    oldSelectedImages: FOverGridImage[];
}

export class FUniverDrawingMixin extends FUniver {
    override _initialize(injector: Injector): void {
        const commandService = injector.get(ICommandService);
        this.disposeWithMe(commandService.beforeCommandExecuted((commandInfo) => {
            switch (commandInfo.id) {
                case InsertSheetDrawingCommand.id:
                    this._beforeOverGridImageInsert(commandInfo.params as IInsertDrawingCommandParams);
                    break;
                case RemoveSheetDrawingCommand.id:
                    this._beforeOverGridImageRemove(commandInfo.params as IDeleteDrawingCommandParams);
                    break;
                case SetSheetDrawingCommand.id:
                    this._beforeOverGridImageChange(commandInfo.params as ISetDrawingCommandParams);
                    break;
                case SetDrawingSelectedOperation.id:
                    this._beforeOverGridImageSelect(commandInfo.params as IDrawingSearch[]);
                    break;
            }
        }));
        this.disposeWithMe(commandService.onCommandExecuted((commandInfo) => {
            switch (commandInfo.id) {
                case InsertSheetDrawingCommand.id:
                    this._overGridImageInserted(commandInfo.params as IInsertDrawingCommandParams);
                    break;
                case RemoveSheetDrawingCommand.id:
                    this._overGridImageRemoved(commandInfo.params as IDeleteDrawingCommandParams);
                    break;
                case SetSheetDrawingCommand.id:
                    this._overGridImageChanged(commandInfo.params as ISetDrawingCommandParams);
                    break;
                case SetDrawingSelectedOperation.id:
                    this._overGridImageSelected(commandInfo.params as IDrawingSearch[]);
                    break;
            }
        }));
    }

    private _beforeOverGridImageInsert(params?: IInsertDrawingCommandParams): void {
        if (!this.hasEventCallback(this.Event.BeforeOverGridImageInsert)) {
            return;
        }

        const workbook = this.getActiveWorkbook();
        if (workbook == null || params == null) {
            return;
        }

        const { drawings } = params;

        const eventParams: IBeforeOverGridImageInsertParam = {
            workbook,
            insertImageParams: drawings as ISheetImage[],
        };

        this.fireEvent(this.Event.BeforeOverGridImageInsert, eventParams);

        if (eventParams.cancel) {
            throw new Error('Canceled by BeforeOverGridImageInsert event');
        }
    }

    private _overGridImageInserted(params?: IInsertDrawingCommandParams): void {
        if (!this.hasEventCallback(this.Event.OverGridImageInserted)) {
            return;
        }

        const workbook = this.getActiveWorkbook();
        if (workbook == null || params == null) {
            return;
        }

        const { drawings } = params;

        this.fireEvent(this.Event.OverGridImageInserted, {
            workbook,
            images: this._createFOverGridImage(drawings as ISheetImage[]),
        });
    }

    private _beforeOverGridImageRemove(params: IDeleteDrawingCommandParams): void {
        if (!this.hasEventCallback(this.Event.BeforeOverGridImageRemove)) {
            return;
        }

        const workbook = this.getActiveWorkbook();
        if (workbook == null || params == null) {
            return;
        }

        const { drawings } = params;

        const drawingManagerService = this._injector.get(IDrawingManagerService);
        const willRemoveDrawings = drawings.map((drawing) => {
            return drawingManagerService.getDrawingByParam(drawing);
        }) as ISheetImage[];

        const eventParams: IBeforeOverGridImageRemoveParam = {
            workbook,
            images: this._createFOverGridImage(willRemoveDrawings),
        };

        this.fireEvent(this.Event.BeforeOverGridImageRemove, eventParams);

        if (eventParams.cancel) {
            throw new Error('Canceled by BeforeOverGridImageRemove event');
        }
    }

    private _overGridImageRemoved(params: IDeleteDrawingCommandParams): void {
        if (!this.hasEventCallback(this.Event.OverGridImageRemoved)) {
            return;
        }

        const workbook = this.getActiveWorkbook();
        if (workbook == null || params == null) {
            return;
        }

        const { drawings } = params;

        this.fireEvent(this.Event.OverGridImageRemoved, {
            workbook,
            removeImageParams: drawings,
        });
    }

    private _beforeOverGridImageChange(params: ISetDrawingCommandParams): void {
        if (!this.hasEventCallback(this.Event.BeforeOverGridImageChange)) {
            return;
        }

        const workbook = this.getActiveWorkbook();
        if (workbook == null || params == null) {
            return;
        }

        const { drawings } = params;

        const drawingManagerService = this._injector.get(IDrawingManagerService);

        const images: IBeforeOverGridImageChangeParamObject[] = [];
        drawings.forEach((drawing) => {
            const image = drawingManagerService.getDrawingByParam(drawing as IDrawingSearch) as ISheetImage;
            if (image == null) {
                return;
            }

            images.push({
                changeParam: drawing,
                image: this._injector.createInstance(FOverGridImage, image),
            });
        });

        const eventParams: IBeforeOverGridImageChangeParam = {
            workbook,
            images,
        };

        this.fireEvent(this.Event.BeforeOverGridImageChange, eventParams);

        if (eventParams.cancel) {
            drawingManagerService.updateNotification(drawings as IDrawingSearch[]);
            throw new Error('Canceled by BeforeOverGridImageChange event');
        }
    }

    private _overGridImageChanged(params: ISetDrawingCommandParams): void {
        if (!this.hasEventCallback(this.Event.OverGridImageChanged)) {
            return;
        }

        const workbook = this.getActiveWorkbook();
        if (workbook == null || params == null) {
            return;
        }

        const { drawings } = params;

        const drawingManagerService = this._injector.get(IDrawingManagerService);

        const images = drawings.map((drawing) => {
            return this._injector.createInstance(FOverGridImage, drawingManagerService.getDrawingByParam(drawing as IDrawingSearch) as ISheetImage);
        });

        this.fireEvent(this.Event.OverGridImageChanged, {
            workbook,
            images,
        });
    }

    private _beforeOverGridImageSelect(drawings: IDrawingSearch[]): void {
        if (!this.hasEventCallback(this.Event.BeforeOverGridImageSelect)) {
            return;
        }

        const drawingManagerService = this._injector.get(IDrawingManagerService);

        const workbook = this.getActiveWorkbook();

        if (workbook == null) {
            return;
        }

        const oldSelectedDrawings = drawingManagerService.getFocusDrawings() as ISheetImage[];

        const selectedDrawings = drawings.map((drawing) => {
            return drawingManagerService.getDrawingByParam(drawing);
        }) as ISheetImage[];

        const eventParams: IBeforeOverGridImageSelectParam = {
            workbook,
            selectedImages: this._createFOverGridImage(selectedDrawings),
            oldSelectedImages: this._createFOverGridImage(oldSelectedDrawings),
        };

        this.fireEvent(this.Event.BeforeOverGridImageSelect, eventParams);

        if (eventParams.cancel) {
            throw new Error('Canceled by BeforeOverGridImageSelect event');
        }
    }

    private _overGridImageSelected(drawings: IDrawingSearch[]): void {
        if (!this.hasEventCallback(this.Event.OverGridImageSelected)) {
            return;
        }

        const workbook = this.getActiveWorkbook();
        const drawingManagerService = this._injector.get(IDrawingManagerService);

        if (workbook == null) {
            return;
        }

        const selectedDrawings = drawings.map((drawing) => {
            return drawingManagerService.getDrawingByParam(drawing);
        }) as ISheetImage[];

        this.fireEvent(this.Event.OverGridImageSelected, {
            workbook,
            selectedImages: this._createFOverGridImage(selectedDrawings as ISheetImage[]),
        });
    }

    private _createFOverGridImage(drawings: ISheetImage[]): FOverGridImage[] {
        return drawings.map((drawing) => {
            return this._injector.createInstance(FOverGridImage, drawing);
        });
    }
}

FUniver.extend(FUniverDrawingMixin);
