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

import type { IDrawingSearch, Injector } from '@univerjs/core';
import type { IEventBase } from '@univerjs/core/facade';
import type { ISheetImage } from '@univerjs/sheets-drawing';
import type { IDeleteDrawingCommandParams, IInsertDrawingCommandParams, ISetDrawingCommandParams } from '@univerjs/sheets-drawing-ui';
import type { FWorkbook } from '@univerjs/sheets/facade';
import type { IBeforeOverGridImageChangeParamObject } from './f-event';
import { ICommandService } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
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

/**
 * @ignore
 */
export class FUniverDrawingMixin extends FUniver {
    /**
     * @ignore
     */
    // eslint-disable-next-line max-lines-per-function
    override _initialize(injector: Injector): void {
        const commandService = injector.get(ICommandService);

        this.registerEventHandler(
            this.Event.BeforeOverGridImageInsert,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id !== InsertSheetDrawingCommand.id) return;

                const params = commandInfo.params as IInsertDrawingCommandParams;
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
            })
        );

        this.registerEventHandler(
            this.Event.BeforeOverGridImageRemove,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id !== RemoveSheetDrawingCommand.id) return;

                const params = commandInfo.params as IDeleteDrawingCommandParams;
                const workbook = this.getActiveWorkbook();
                if (workbook == null || params == null) {
                    return;
                }

                const drawingManagerService = injector.get(IDrawingManagerService);

                const { drawings } = params;
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
            })
        );

        this.registerEventHandler(
            this.Event.BeforeOverGridImageChange,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id !== SetSheetDrawingCommand.id) return;

                const params = commandInfo.params as ISetDrawingCommandParams;
                const workbook = this.getActiveWorkbook();
                if (workbook == null || params == null) {
                    return;
                }

                const { drawings } = params;
                const drawingManagerService = injector.get(IDrawingManagerService);

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
            })
        );

        this.registerEventHandler(
            this.Event.BeforeOverGridImageSelect,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id !== SetDrawingSelectedOperation.id) return;

                const drawings = commandInfo.params as IDrawingSearch[];
                const workbook = this.getActiveWorkbook();
                if (workbook == null) {
                    return;
                }
                const drawingManagerService = injector.get(IDrawingManagerService);

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
            })
        );

        this.registerEventHandler(
            this.Event.OverGridImageInserted,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id !== InsertSheetDrawingCommand.id) return;

                const params = commandInfo.params as IInsertDrawingCommandParams;
                const workbook = this.getActiveWorkbook();
                if (workbook == null || params == null) {
                    return;
                }

                const { drawings } = params;
                this.fireEvent(this.Event.OverGridImageInserted, {
                    workbook,
                    images: this._createFOverGridImage(drawings as ISheetImage[]),
                });
            })
        );

        this.registerEventHandler(
            this.Event.OverGridImageRemoved,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id !== RemoveSheetDrawingCommand.id) return;

                const params = commandInfo.params as IDeleteDrawingCommandParams;
                const workbook = this.getActiveWorkbook();
                if (workbook == null || params == null) {
                    return;
                }

                const { drawings } = params;
                this.fireEvent(this.Event.OverGridImageRemoved, {
                    workbook,
                    removeImageParams: drawings,
                });
            })
        );

        this.registerEventHandler(
            this.Event.OverGridImageChanged,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id !== SetSheetDrawingCommand.id) return;

                const params = commandInfo.params as ISetDrawingCommandParams;
                const workbook = this.getActiveWorkbook();
                if (workbook == null || params == null) {
                    return;
                }

                const { drawings } = params;
                const drawingManagerService = injector.get(IDrawingManagerService);

                const images = drawings.map((drawing) => {
                    return this._injector.createInstance(FOverGridImage, drawingManagerService.getDrawingByParam(drawing as IDrawingSearch) as ISheetImage);
                });

                this.fireEvent(this.Event.OverGridImageChanged, {
                    workbook,
                    images,
                });
            })
        );

        this.registerEventHandler(
            this.Event.OverGridImageSelected,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id !== SetDrawingSelectedOperation.id) return;

                const drawings = commandInfo.params as IDrawingSearch[];
                const workbook = this.getActiveWorkbook();
                if (workbook == null) {
                    return;
                }
                const drawingManagerService = injector.get(IDrawingManagerService);

                const selectedDrawings = drawings.map((drawing) => {
                    return drawingManagerService.getDrawingByParam(drawing);
                }) as ISheetImage[];

                this.fireEvent(this.Event.OverGridImageSelected, {
                    workbook,
                    selectedImages: this._createFOverGridImage(selectedDrawings as ISheetImage[]),
                });
            })
        );
    }

    private _createFOverGridImage(drawings: ISheetImage[]): FOverGridImage[] {
        return drawings.map((drawing) => {
            return this._injector.createInstance(FOverGridImage, drawing);
        });
    }
}

FUniver.extend(FUniverDrawingMixin);
