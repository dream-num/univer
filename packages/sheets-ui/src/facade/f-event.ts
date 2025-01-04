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

import type { DeviceInputEventType } from '@univerjs/engine-render';
import type { FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
import type { KeyCode } from '@univerjs/ui';
import { FEventName, type IEventBase, type RichTextValue } from '@univerjs/core';

export interface ISheetUIEvent {
    /**
     * BeforeSheetEditStart event
     * @see {@link IBeforeSheetEditStartEventParams}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.BeforeSheetEditStart, (params) => {
     * });
     * ```
     */
    readonly BeforeSheetEditStart: 'BeforeSheetEditStart';
    /**
     * SheetEditStarted event
     * @see {@link ISheetEditStartedEventParams}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.SheetEditStarted, (params) => {
     * });
     * ```
     */
    readonly SheetEditStarted: 'SheetEditStarted';
    /**
     * SheetEditChanging event
     * @see {@link ISheetEditChangingEventParams}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.SheetEditChanging, (params) => {
     * });
     * ```
     */
    readonly SheetEditChanging: 'SheetEditChanging';
    /**
     * BeforeSheetEditEnd event
     * @see {@link IBeforeSheetEditEndEventParams}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.BeforeSheetEditEnd, (params) => {
     * });
     * ```
     */
    readonly BeforeSheetEditEnd: 'BeforeSheetEditEnd';
    /**
     * SheetEditEnded event
     * @see {@link ISheetEditEndedEventParams}
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.event.SheetEditEnded, (params) => {
     * });
     * ```
     */
    readonly SheetEditEnded: 'SheetEditEnded';
}

export interface ISheetEditStartedEventParams extends IEventBase {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    column: number;
    eventType: DeviceInputEventType;
    keycode?: KeyCode;
    isZenEditor: boolean;
}

export interface ISheetEditEndedEventParams extends IEventBase {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    column: number;
    eventType: DeviceInputEventType;
    keycode?: KeyCode;
    isZenEditor: boolean;
}

export interface ISheetEditChangingEventParams extends IEventBase {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    column: number;
    value: RichTextValue;
    isZenEditor: boolean;
}

export interface IBeforeSheetEditStartEventParams extends IEventBase {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    column: number;
    eventType: DeviceInputEventType;
    keycode?: KeyCode;
    isZenEditor: boolean;
}

export interface IBeforeSheetEditEndEventParams extends IEventBase {
    workbook: FWorkbook;
    worksheet: FWorksheet;
    row: number;
    column: number;
    value: RichTextValue;
    eventType: DeviceInputEventType;
    keycode?: KeyCode;
    isZenEditor: boolean;
}

export interface ISheetUIEventConfig {
    BeforeSheetEditStart: IBeforeSheetEditStartEventParams;
    SheetEditStarted: ISheetEditStartedEventParams;
    SheetEditChanging: ISheetEditChangingEventParams;
    BeforeSheetEditEnd: IBeforeSheetEditEndEventParams;
    SheetEditEnded: ISheetEditEndedEventParams;
}

class FSheetUIEventName extends FEventName implements ISheetUIEvent {
    override get BeforeSheetEditStart(): 'BeforeSheetEditStart' {
        return 'BeforeSheetEditStart';
    }

    override get SheetEditStarted(): 'SheetEditStarted' {
        return 'SheetEditStarted';
    }

    override get SheetEditChanging(): 'SheetEditChanging' {
        return 'SheetEditChanging';
    }

    override get BeforeSheetEditEnd(): 'BeforeSheetEditEnd' {
        return 'BeforeSheetEditEnd';
    }

    override get SheetEditEnded(): 'SheetEditEnded' {
        return 'SheetEditEnded';
    }
}

FEventName.extend(FSheetUIEventName);
declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends ISheetUIEvent {}
    interface IEventParamConfig extends ISheetUIEventConfig {}
}
