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

import type { IDrawingSearch, Injector } from '@univerjs/core';
import type { ISheetImage } from '@univerjs/sheets-drawing';
import type { IDeleteDrawingCommandParams, IInsertDrawingCommandParams, ISetDrawingCommandParams } from '@univerjs/sheets-drawing-ui';
import type { IBeforeOverGridImageChangeParamObject } from './f-event';
import { FUniver, ICommandService } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { InsertSheetDrawingCommand, RemoveSheetDrawingCommand, SetSheetDrawingCommand } from '@univerjs/sheets-drawing-ui';
import { FOverGridImage } from './f-over-grid-image';

export interface IFUniverDrawingMixin {

}

export class FUniverDrawingMixin extends FUniver implements IFUniverDrawingMixin {
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
            }
        }));

        this._initializeDrawingSelected();
    }

    private _beforeOverGridImageInsert(params?: IInsertDrawingCommandParams): void {
        if (!this.hasEventCallback(this.Event.BeforeOverGridImageInsert)) {
            return;
        }

        const workbook = this.getActiveUniverSheet();
        if (workbook == null || params == null) {
            return;
        }

        const { drawings } = params;

        this.fireEvent(this.Event.BeforeOverGridImageInsert, {
            workbook,
            insertImageParams: drawings as ISheetImage[],
        });
    }

    private _overGridImageInserted(params?: IInsertDrawingCommandParams): void {
        if (!this.hasEventCallback(this.Event.OverGridImageInserted)) {
            return;
        }

        const workbook = this.getActiveUniverSheet();
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

        const workbook = this.getActiveUniverSheet();
        if (workbook == null || params == null) {
            return;
        }

        const { drawings } = params;

        const drawingManagerService = this._injector.get(IDrawingManagerService);
        const willRemoveDrawings = drawings.map((drawing) => {
            return drawingManagerService.getDrawingByParam(drawing);
        }) as ISheetImage[];

        this.fireEvent(this.Event.BeforeOverGridImageRemove, {
            workbook,
            images: this._createFOverGridImage(willRemoveDrawings),
        });
    }

    private _overGridImageRemoved(params: IDeleteDrawingCommandParams): void {
        if (!this.hasEventCallback(this.Event.OverGridImageRemoved)) {
            return;
        }

        const workbook = this.getActiveUniverSheet();
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

        const workbook = this.getActiveUniverSheet();
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

        this.fireEvent(this.Event.BeforeOverGridImageChange, {
            workbook,
            images,
        });
    }

    private _overGridImageChanged(params: ISetDrawingCommandParams): void {
        if (!this.hasEventCallback(this.Event.OverGridImageChanged)) {
            return;
        }

        const workbook = this.getActiveUniverSheet();
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

    private _initializeDrawingSelected(): void {
        const drawingManagerService = this._injector.get(IDrawingManagerService);

        drawingManagerService.beforeFocus$.subscribe((param) => {
            const { selectedDrawings, oldSelectedDrawings } = param;

            const workbook = this.getActiveUniverSheet();

            if (workbook == null) {
                return;
            }

            this.fireEvent(this.Event.BeforeOverGridImageSelect, {
                workbook,
                selectedImages: this._createFOverGridImage(selectedDrawings as ISheetImage[]),
                oldSelectedImages: this._createFOverGridImage(oldSelectedDrawings as ISheetImage[]),
            });
        });

        drawingManagerService.focus$.subscribe((drawings) => {
            const workbook = this.getActiveUniverSheet();

            if (workbook == null) {
                return;
            }

            this.fireEvent(this.Event.OverGridImageSelected, {
                workbook,
                selectedImages: this._createFOverGridImage(drawings as ISheetImage[]),
            });
        });
    }

    private _createFOverGridImage(drawings: ISheetImage[]): FOverGridImage[] {
        return drawings.map((drawing) => {
            return this._injector.createInstance(FOverGridImage, drawing);
        });
    }
}

FUniver.extend(FUniverDrawingMixin);

declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverDrawingMixin { }
}
