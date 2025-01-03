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

import type { IEventBase } from '@univerjs/core';
import type { FRange, FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
import { FEventName } from '@univerjs/core';

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

export interface IBeforeClipboardChangeParam extends IEventBase {
    /**
     * The workbook instance currently being operated on. {@link FWorkbook}
     */
    workbook: FWorkbook;
    /**
     * The worksheet instance currently being operated on. {@link FWorksheet}
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

export type IClipboardChangedParam = IBeforeClipboardChangeParam;

export interface IBeforeClipboardPasteParam extends IEventBase {
    /**
     * The workbook instance currently being operated on. {@link FWorkbook}
     */
    workbook: FWorkbook;
    /**
     * The worksheet instance currently being operated on. {@link FWorkbook}
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

export type IClipboardPastedParam = IBeforeClipboardPasteParam;

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

