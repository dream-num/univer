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

import type { DocumentDataModel, Injector } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IEditorBridgeServiceVisibleParam } from '@univerjs/sheets-ui';
import type { IBeforeSheetEditEndEventParams, IBeforeSheetEditStartEventParams, ISheetEditChangingEventParams, ISheetEditEndedEventParams, ISheetEditStartedEventParams } from '@univerjs/sheets-ui/facade';
import { CanceledError, DOCS_ZEN_EDITOR_UNIT_ID_KEY, ICommandService, IUniverInstanceService, RichTextValue } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { RichTextEditingMutation } from '@univerjs/docs';

import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { CancelZenEditCommand, ConfirmZenEditCommand, OpenZenEditorCommand } from '@univerjs/sheets-zen-editor';

/**
 * @ignore
 */
export interface IFUniverSheetsZenEditorMixin {}

export class FUniverSheetsZenEditorMixin extends FUniver implements IFUniverSheetsZenEditorMixin {
    // eslint-disable-next-line max-lines-per-function
    private _initSheetZenEditorEvent(injector: Injector): void {
        const commandService = injector.get(ICommandService);

        // Register before command execution handlers
        this.registerEventHandler(
            this.Event.BeforeSheetEditStart,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (commandInfo.id === OpenZenEditorCommand.id) {
                    const target = this.getCommandSheetTarget(commandInfo);
                    if (!target) {
                        return;
                    }
                    const { workbook, worksheet } = target;
                    const editorBridgeService = injector.get(IEditorBridgeService);
                    const params = commandInfo.params as IEditorBridgeServiceVisibleParam;
                    const { keycode, eventType } = params;
                    const loc = editorBridgeService.getEditLocation()!;

                    const eventParams: IBeforeSheetEditStartEventParams = {
                        row: loc.row,
                        column: loc.column,
                        eventType,
                        keycode,
                        workbook,
                        worksheet,
                        isZenEditor: true,
                    };
                    this.fireEvent(this.Event.BeforeSheetEditStart, eventParams);
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                }
            })
        );

        this.registerEventHandler(
            this.Event.BeforeSheetEditEnd,
            () => commandService.beforeCommandExecuted((commandInfo) => {
                if (
                    commandInfo.id === CancelZenEditCommand.id ||
                    commandInfo.id === ConfirmZenEditCommand.id
                ) {
                    const target = this.getCommandSheetTarget(commandInfo);
                    if (!target) {
                        return;
                    }
                    const { workbook, worksheet } = target;
                    const editorBridgeService = injector.get(IEditorBridgeService);
                    const univerInstanceService = injector.get(IUniverInstanceService);
                    const params = commandInfo.params as IEditorBridgeServiceVisibleParam;
                    const { keycode, eventType } = params;
                    const loc = editorBridgeService.getEditLocation()!;

                    const eventParams: IBeforeSheetEditEndEventParams = {
                        row: loc.row,
                        column: loc.column,
                        eventType,
                        keycode,
                        workbook,
                        worksheet,
                        isZenEditor: true,
                        value: RichTextValue.create(univerInstanceService.getUnit<DocumentDataModel>(DOCS_ZEN_EDITOR_UNIT_ID_KEY)!.getSnapshot()),
                        isConfirm: commandInfo.id === ConfirmZenEditCommand.id,
                    };
                    this.fireEvent(this.Event.BeforeSheetEditEnd, eventParams);
                    if (eventParams.cancel) {
                        throw new CanceledError();
                    }
                }
            })
        );

        // Register command execution handlers
        this.registerEventHandler(
            this.Event.SheetEditStarted,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === OpenZenEditorCommand.id) {
                    const target = this.getCommandSheetTarget(commandInfo);
                    if (!target) {
                        return;
                    }
                    const { workbook, worksheet } = target;

                    const editorBridgeService = injector.get(IEditorBridgeService);
                    const params = commandInfo.params as IEditorBridgeServiceVisibleParam;
                    const { keycode, eventType } = params;
                    const loc = editorBridgeService.getEditLocation()!;
                    const eventParams: ISheetEditStartedEventParams = {
                        row: loc.row,
                        column: loc.column,
                        eventType,
                        keycode,
                        workbook,
                        worksheet,
                        isZenEditor: true,
                    };
                    this.fireEvent(this.Event.SheetEditStarted, eventParams);
                }
            })
        );

        this.registerEventHandler(
            this.Event.SheetEditEnded,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (
                    commandInfo.id === CancelZenEditCommand.id ||
                    commandInfo.id === ConfirmZenEditCommand.id
                ) {
                    const target = this.getCommandSheetTarget(commandInfo);
                    if (!target) {
                        return;
                    }
                    const { workbook, worksheet } = target;

                    const editorBridgeService = injector.get(IEditorBridgeService);
                    const params = commandInfo.params as IEditorBridgeServiceVisibleParam;
                    const { keycode, eventType } = params;
                    const loc = editorBridgeService.getEditLocation()!;

                    const eventParams: ISheetEditEndedEventParams = {
                        row: loc.row,
                        column: loc.column,
                        eventType,
                        keycode,
                        workbook,
                        worksheet,
                        isZenEditor: true,
                        isConfirm: commandInfo.id === ConfirmZenEditCommand.id,
                    };
                    this.fireEvent(this.Event.SheetEditEnded, eventParams);
                }
            })
        );

        // Register rich text editing mutation handler
        this.registerEventHandler(
            this.Event.SheetEditChanging,
            () => commandService.onCommandExecuted((commandInfo) => {
                if (commandInfo.id === RichTextEditingMutation.id) {
                    const target = this.getActiveSheet();
                    if (!target) {
                        return;
                    }
                    const { workbook, worksheet } = target;
                    const editorBridgeService = injector.get(IEditorBridgeService);
                    const univerInstanceService = injector.get(IUniverInstanceService);
                    const params = commandInfo.params as IRichTextEditingMutationParams;
                    if (!editorBridgeService.isVisible().visible) return;
                    const { unitId } = params;
                    if (unitId === DOCS_ZEN_EDITOR_UNIT_ID_KEY) {
                        const { row, column } = editorBridgeService.getEditLocation()!;
                        const eventParams: ISheetEditChangingEventParams = {
                            workbook,
                            worksheet,
                            row,
                            column,
                            value: RichTextValue.create(univerInstanceService.getUnit<DocumentDataModel>(DOCS_ZEN_EDITOR_UNIT_ID_KEY)!.getSnapshot()),
                            isZenEditor: true,
                        };
                        this.fireEvent(this.Event.SheetEditChanging, eventParams);
                    }
                }
            })
        );
    }

    /**
     * @ignore
     */
    override _initialize(injector: Injector): void {
        this._initSheetZenEditorEvent(injector);
    }
}

FUniver.extend(FUniverSheetsZenEditorMixin);

declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverSheetsZenEditorMixin { }
}
