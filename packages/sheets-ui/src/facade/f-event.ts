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

import type { IEventBase, Injector } from '@univerjs/core';
import type { ISheetPasteByShortKeyParams } from '@univerjs/sheets-ui';
import type { FRange, FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
import { FEventName, FUniver, ICommandService } from '@univerjs/core';
import { ISheetClipboardService, SheetPasteShortKeyCommand } from '@univerjs/sheets-ui';
import { CopyCommand, CutCommand, HTML_CLIPBOARD_MIME_TYPE, IClipboardInterfaceService, PasteCommand, PLAIN_TEXT_CLIPBOARD_MIME_TYPE } from '@univerjs/ui';

interface IFSheetsUIEventNameMixin {
    readonly BeforeClipboardChange: 'BeforeClipboardChange';
    readonly ClipboardChanged: 'ClipboardChanged';
    readonly BeforeClipboardPaste: 'BeforeClipboardPaste';
    readonly ClipboardPasted: 'ClipboardPasted';
}

export class FSheetsUIEventName extends FEventName implements IFSheetsUIEventNameMixin {
    override get BeforeClipboardChange(): 'BeforeClipboardChange' {
        return 'BeforeClipboardChange' as const;
    }

    override get ClipboardChanged(): 'ClipboardChanged' {
        return 'ClipboardChanged' as const;
    }

    override get BeforeClipboardPaste(): 'BeforeClipboardPaste' {
        return 'BeforeClipboardPaste' as const;
    }

    override get ClipboardPasted(): 'ClipboardPasted' {
        return 'ClipboardPasted' as const;
    }
}

interface IBeforeClipboardChangeParam extends IEventBase {
    /**
     * The workbook instance. {@link FWorkbook}
     */
    workbook: FWorkbook;
    /**
     * The worksheet instance. {@link FWorksheet}
     */
    worksheet: FWorksheet;
    /**
     * Clipboard Text String
     */
    text: string;
    /**
     * Clipboard HTML String
     */
    html: string;
    /**
     * The sheet containing the content that was (copied/cut)
     */
    fromSheet: FWorksheet;
    /**
     * The range containing the content that was (copied/cut)
     */
    fromRange: FRange;
}

type IClipboardChangedParam = IBeforeClipboardChangeParam;

interface IBeforeClipboardPasteParam extends IEventBase {
    /**
     * The workbook instance. {@link FWorkbook}
     */
    workbook: FWorkbook;
    /**
     * The workbook instance. {@link FWorkbook}
     */
    worksheet: FWorksheet;
    /**
     * Clipboard Text String
     */
    text?: string;
    /**
     * Clipboard HTML String
     */
    html?: string;
}

type IClipboardPastedParam = IBeforeClipboardPasteParam;

interface IFSheetsUIEventParamConfig {
    BeforeClipboardChange: IBeforeClipboardChangeParam;
    ClipboardChanged: IClipboardChangedParam;
    BeforeClipboardPaste: IBeforeClipboardPasteParam;
    ClipboardPasted: IClipboardPastedParam;
}

FEventName.extend(FSheetsUIEventName);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends IFSheetsUIEventNameMixin { }
    interface IEventParamConfig extends IFSheetsUIEventParamConfig { }
}

// ------------------------------------------------------

class FUniverSheetsUIEventMixin extends FUniver {
    override _initialize(injector: Injector): void {
        const commandService = injector.get(ICommandService);
        this.disposeWithMe(commandService.beforeCommandExecuted((commandInfo) => {
            switch (commandInfo.id) {
                case CopyCommand.id:
                case CutCommand.id:
                    this._beforeClipboardChange();
                    break;
                case SheetPasteShortKeyCommand.id:
                    this._beforeClipboardPaste(commandInfo.params);
                    break;
            }
        }));
        this.disposeWithMe(commandService.onCommandExecuted((commandInfo) => {
            switch (commandInfo.id) {
                case CopyCommand.id:
                case CutCommand.id:
                    this._clipboardChanged();
                    break;
                case SheetPasteShortKeyCommand.id:
                    this._clipboardPaste();
                    break;
            }
        }));
        // async listeners
        this.disposeWithMe(commandService.beforeCommandExecuted(async (commandInfo) => {
            switch (commandInfo.id) {
                case PasteCommand.id:
                    this._beforeClipboardPasteAsync();
                    break;
            }
        }));
        this.disposeWithMe(commandService.onCommandExecuted(async (commandInfo) => {
            switch (commandInfo.id) {
                case PasteCommand.id:
                    this._clipboardPasteAsync();
                    break;
            }
        }));
    }

    private _generateClipboardCopyParam(): IBeforeClipboardChangeParam | undefined {
        const workbook = this.getActiveUniverSheet();
        const worksheet = workbook?.getActiveSheet();
        const range = workbook?.getActiveRange();
        if (!workbook || !worksheet || !range) {
            return;
        }

        const clipboardService = this._injector.get(ISheetClipboardService);
        const content = clipboardService.generateCopyContent(workbook.getId(), worksheet.getSheetId(), range.getRange());
        if (!content) {
            return;
        }
        const { html, plain } = content;
        const eventParams: IBeforeClipboardChangeParam = {
            workbook,
            worksheet,
            text: plain,
            html,
            fromSheet: worksheet,
            fromRange: range,
        };
        return eventParams;
    }

    private _beforeClipboardChange(): void {
        const eventParams = this._generateClipboardCopyParam();
        if (!eventParams) return;

        this.fireEvent(this.Event.BeforeClipboardChange, eventParams);
        if (eventParams.cancel) {
            throw new Error('Before clipboard change is canceled');
        }
    }

    private _clipboardChanged(): void {
        const eventParams = this._generateClipboardCopyParam();
        if (!eventParams) return;

        this.fireEvent(this.Event.ClipboardChanged, eventParams);
        if (eventParams.cancel) {
            throw new Error('Clipboard changed is canceled');
        }
    }

    private _generateClipboardPasteParam(params?: ISheetPasteByShortKeyParams): IBeforeClipboardPasteParam | undefined {
        if (!params) {
            return;
        }
        const { htmlContent, textContent } = params as ISheetPasteByShortKeyParams;
        const workbook = this.getActiveUniverSheet();
        const worksheet = workbook?.getActiveSheet();
        if (!workbook || !worksheet) {
            return;
        }
        const eventParams: IBeforeClipboardPasteParam = {
            workbook,
            worksheet,
            text: textContent,
            html: htmlContent,
        };
        return eventParams;
    }

    private async _generateClipboardPasteParamAsync(): Promise<IBeforeClipboardPasteParam | undefined> {
        const workbook = this.getActiveUniverSheet();
        const worksheet = workbook?.getActiveSheet();
        if (!workbook || !worksheet) {
            return;
        }
        const clipboardInterfaceService = this._injector.get(IClipboardInterfaceService);
        const clipboardItems = await clipboardInterfaceService.read();
        const item = clipboardItems[0];
        let eventParams;
        if (item) {
            const types = item.types;
            const text =
                types.indexOf(PLAIN_TEXT_CLIPBOARD_MIME_TYPE) !== -1
                    ? await item.getType(PLAIN_TEXT_CLIPBOARD_MIME_TYPE).then((blob) => blob && blob.text())
                    : '';
            const html =
                types.indexOf(HTML_CLIPBOARD_MIME_TYPE) !== -1
                    ? await item.getType(HTML_CLIPBOARD_MIME_TYPE).then((blob) => blob && blob.text())
                    : '';
            eventParams = {
                workbook,
                worksheet,
                text,
                html,
            };
        }
        return eventParams;
    }

    private _beforeClipboardPaste(params?: ISheetPasteByShortKeyParams): void {
        const eventParams = this._generateClipboardPasteParam(params);
        if (!eventParams) return;
        this.fireEvent(this.Event.BeforeClipboardPaste, eventParams);
        if (eventParams.cancel) {
            throw new Error('Before clipboard paste is canceled');
        }
    }

    private _clipboardPaste(params?: ISheetPasteByShortKeyParams): void {
        const eventParams = this._generateClipboardPasteParam(params);
        if (!eventParams) return;
        this.fireEvent(this.Event.BeforeClipboardPaste, eventParams);
        if (eventParams.cancel) {
            throw new Error('Clipboard pasted is canceled');
        }
    }

    private async _beforeClipboardPasteAsync(): Promise<void> {
        const eventParams = await this._generateClipboardPasteParamAsync();
        if (!eventParams) return;
        this.fireEvent(this.Event.BeforeClipboardPaste, eventParams);
        if (eventParams.cancel) {
            throw new Error('Before clipboard paste is canceled');
        }
    }

    private async _clipboardPasteAsync(): Promise<void> {
        const eventParams = await this._generateClipboardPasteParamAsync();
        if (!eventParams) return;
        this.fireEvent(this.Event.ClipboardPasted, eventParams);
        if (eventParams.cancel) {
            throw new Error('Clipboard pasted is canceled');
        }
    }
}

FUniver.extend(FUniverSheetsUIEventMixin);
