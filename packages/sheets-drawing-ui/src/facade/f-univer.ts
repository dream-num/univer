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

import type { IDisposable, IDrawingSearch, Injector } from '@univerjs/core';
import type { IInsertSheetDrawingCommandParams, IRemoveSheetDrawingCommandParams, ISetDrawingCommandParams, ISheetFloatDom } from '@univerjs/sheets-drawing';
import type { IBeforeFloatDomAddEventParams, IBeforeFloatDomDeleteEventParams, IBeforeFloatDomUpdateEventParams, IFloatDomAddedEventParams, IFloatDomDeletedEventParams, IFloatDomUpdatedEventParams } from './f-event';
import { CanceledError, DrawingTypeEnum, ICommandService, IURLImageService } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { IDrawingManagerService } from '@univerjs/drawing';
import { InsertSheetDrawingCommand, RemoveSheetDrawingCommand, SetSheetDrawingCommand } from '@univerjs/sheets-drawing';

export interface IFUniverSheetsDrawingUIMixin {
    /**
     * Register a custom image downloader for URL images
     * @param downloader The downloader function that takes a URL and returns a base64 string
     * @returns A disposable object to unregister the downloader
     * @example
     * ```ts
     * const disposable = univerAPI.registerURLImageDownloader(async (url) => {
     *   const response = await fetch(url);
     *   const blob = await response.blob();
     *   const base64 = await new Promise<string>((resolve) => {
     *     const reader = new FileReader();
     *     reader.onloadend = () => resolve(reader.result as string);
     *     reader.readAsDataURL(blob);
     *   });
     *   return base64;
     * });
     * ```
     */
    registerURLImageDownloader(downloader: (url: string) => Promise<string>): IDisposable;
}

/**
 * @ignore
 */
export class FUniverSheetsDrawingUIMixin extends FUniver implements IFUniverSheetsDrawingUIMixin {
    /**
     * @ignore
     */
    // eslint-disable-next-line max-lines-per-function
    override _initialize(injector: Injector): void {
        const commandService = injector.get(ICommandService);

        // Float DOM Add Events
        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeFloatDomAdd,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id !== InsertSheetDrawingCommand.id) return;

                    const params = commandInfo.params as IInsertSheetDrawingCommandParams;
                    const workbook = this.getActiveWorkbook();
                    if (workbook == null || params == null) {
                        return;
                    }

                    const { drawings } = params;
                    const floatDomDrawings = drawings.filter(
                        (drawing) => drawing.drawingType === DrawingTypeEnum.DRAWING_DOM
                    ) as ISheetFloatDom[];

                    if (floatDomDrawings.length === 0) {
                        return;
                    }

                    const eventParams: IBeforeFloatDomAddEventParams = {
                        workbook,
                        drawings: floatDomDrawings,
                    };

                    this.fireEvent(this.Event.BeforeFloatDomAdd, eventParams);

                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.FloatDomAdded,
                () => commandService.onCommandExecuted((commandInfo) => {
                    if (commandInfo.id !== InsertSheetDrawingCommand.id) return;

                    const params = commandInfo.params as IInsertSheetDrawingCommandParams;
                    const workbook = this.getActiveWorkbook();
                    if (workbook == null || params == null) {
                        return;
                    }

                    const { drawings } = params;
                    const floatDomDrawings = drawings.filter(
                        (drawing) => drawing.drawingType === DrawingTypeEnum.DRAWING_DOM
                    ) as ISheetFloatDom[];

                    if (floatDomDrawings.length === 0) {
                        return;
                    }

                    const eventParams: IFloatDomAddedEventParams = {
                        workbook,
                        drawings: floatDomDrawings,
                    };
                    this.fireEvent(this.Event.FloatDomAdded, eventParams);
                })
            )
        );

        // Float DOM Update Events
        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeFloatDomUpdate,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id !== SetSheetDrawingCommand.id) return;

                    const params = commandInfo.params as ISetDrawingCommandParams;
                    const workbook = this.getActiveWorkbook();
                    if (workbook == null || params == null) {
                        return;
                    }

                    const { drawings } = params;
                    const drawingManagerService = injector.get(IDrawingManagerService);

                    const floatDomDrawings: ISheetFloatDom[] = [];
                    drawings.forEach((drawing) => {
                        const dom = drawingManagerService.getDrawingByParam(drawing as IDrawingSearch) as ISheetFloatDom;
                        if (dom?.drawingType === DrawingTypeEnum.DRAWING_DOM) {
                            floatDomDrawings.push(dom);
                        }
                    });

                    if (floatDomDrawings.length === 0) {
                        return;
                    }

                    const eventParams: IBeforeFloatDomUpdateEventParams = {
                        workbook,
                        drawings: floatDomDrawings,
                    };

                    this.fireEvent(this.Event.BeforeFloatDomUpdate, eventParams);

                    if (eventParams.cancel) {
                        drawingManagerService.updateNotification(drawings as IDrawingSearch[]);
                        throw new CanceledError();
                    }
                })
            )
        );

        // Float DOM Update Events
        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.FloatDomUpdated,
                () => commandService.onCommandExecuted((commandInfo) => {
                    if (commandInfo.id !== SetSheetDrawingCommand.id) return;

                    const params = commandInfo.params as ISetDrawingCommandParams;
                    const workbook = this.getActiveWorkbook();
                    if (workbook == null || params == null) {
                        return;
                    }

                    const { drawings } = params;
                    const drawingManagerService = injector.get(IDrawingManagerService);

                    const floatDomDrawings: ISheetFloatDom[] = [];
                    drawings.forEach((drawing) => {
                        const dom = drawingManagerService.getDrawingByParam(drawing as IDrawingSearch) as ISheetFloatDom;
                        if (dom?.drawingType === DrawingTypeEnum.DRAWING_DOM) {
                            floatDomDrawings.push(dom);
                        }
                    });

                    if (floatDomDrawings.length === 0) {
                        return;
                    }

                    const eventParams: IFloatDomUpdatedEventParams = {
                        workbook,
                        drawings: floatDomDrawings,
                    };
                    this.fireEvent(this.Event.FloatDomUpdated, eventParams);
                })
            )
        );

        // Float DOM Delete Events
        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.BeforeFloatDomDelete,
                () => commandService.beforeCommandExecuted((commandInfo) => {
                    if (commandInfo.id !== RemoveSheetDrawingCommand.id) return;

                    const params = commandInfo.params as IRemoveSheetDrawingCommandParams;
                    const workbook = this.getActiveWorkbook();
                    if (workbook == null || params == null) {
                        return;
                    }

                    const drawingManagerService = injector.get(IDrawingManagerService);

                    const { drawings } = params;
                    const floatDomDrawings = drawings
                        .map((drawing) => drawingManagerService.getDrawingByParam(drawing))
                        .filter((drawing): drawing is ISheetFloatDom =>
                            drawing?.drawingType === DrawingTypeEnum.DRAWING_DOM
                        );

                    if (floatDomDrawings.length === 0) {
                        return;
                    }

                    const eventParams: IBeforeFloatDomDeleteEventParams = {
                        workbook,
                        drawings: floatDomDrawings,
                    };

                    this.fireEvent(this.Event.BeforeFloatDomDelete, eventParams);

                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                })
            )
        );

        this.disposeWithMe(
            this.registerEventHandler(
                this.Event.FloatDomDeleted,
                () => commandService.onCommandExecuted((commandInfo) => {
                    if (commandInfo.id !== RemoveSheetDrawingCommand.id) return;

                    const params = commandInfo.params as IRemoveSheetDrawingCommandParams;
                    const workbook = this.getActiveWorkbook();
                    if (workbook == null || params == null) {
                        return;
                    }

                    const { drawings } = params;
                    const floatDomDrawingIds: string[] = [];
                    for (let i = 0; i < drawings.length; i++) {
                        const drawing = drawings[i];
                        if (drawing.drawingType === DrawingTypeEnum.DRAWING_DOM) {
                            floatDomDrawingIds.push(drawing.drawingId);
                        }
                    }

                    if (floatDomDrawingIds.length === 0) {
                        return;
                    }

                    const eventParams: IFloatDomDeletedEventParams = {
                        workbook,
                        drawings: floatDomDrawingIds,
                    };
                    this.fireEvent(this.Event.FloatDomDeleted, eventParams);
                })
            )
        );
    }

    override registerURLImageDownloader(downloader: (url: string) => Promise<string>): IDisposable {
        const urlImageService = this._injector.get(IURLImageService);
        return urlImageService.registerURLImageDownloader(downloader);
    }
}

FUniver.extend(FUniverSheetsDrawingUIMixin);
declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverSheetsDrawingUIMixin { }
}
