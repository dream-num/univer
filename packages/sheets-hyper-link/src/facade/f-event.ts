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

import type { ICellLinkContent, ISheetHyperLink } from '@univerjs/sheets-hyper-link';
import type { FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
import { FEventName, type IEventBase } from '@univerjs/core';

interface IFSheetLinkEvent {
    /**
     * Event triggered before adding a link
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.BeforeSheetLinkAdd, (params) => {
     *     const { workbook, worksheet, row, col, link } = params;
     *     console.log('before sheet link add', params);
     * });
     * ```
     */
    readonly BeforeSheetLinkAdd: 'BeforeSheetLinkAdd';
    /**
     * Event triggered before canceling a link
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.BeforeSheetLinkCancel, (params) => {
     *     const { workbook, worksheet, row, column, id } = params;
     *     console.log('before sheet link cancel', params);
     * });
     * ```
     */
    readonly BeforeSheetLinkCancel: 'BeforeSheetLinkCancel';
    /**
     * Event triggered before updating a link
     * @example
     * ```ts
     * univerAPI.addEvent(univerAPI.Event.BeforeSheetLinkUpdate, (params) => {
     *     const { workbook, worksheet, row, column, id, payload } = params;
     *     console.log('before sheet link update', params);
     * });
     * ```
     */
    readonly BeforeSheetLinkUpdate: 'BeforeSheetLinkUpdate';
}

export class FSheetLinkEvent implements IFSheetLinkEvent {
    get BeforeSheetLinkAdd(): 'BeforeSheetLinkAdd' {
        return 'BeforeSheetLinkAdd' as const;
    }

    get BeforeSheetLinkCancel(): 'BeforeSheetLinkCancel' {
        return 'BeforeSheetLinkCancel' as const;
    }

    get BeforeSheetLinkUpdate(): 'BeforeSheetLinkUpdate' {
        return 'BeforeSheetLinkUpdate' as const;
    }
}

export interface IBeforeSheetLinkAddEvent extends IEventBase {
    /** The workbook instance */
    workbook: FWorkbook;
    /** The worksheet where the link will be added */
    worksheet: FWorksheet;
    /** The row index of the target cell */
    row: number;
    /** The column index of the target cell */
    col: number;
    /** The hyperlink information to be added */
    link: ISheetHyperLink;
}

export interface IBeforeSheetLinkCancelEvent extends IEventBase {
    /** The workbook instance */
    workbook: FWorkbook;
    /** The worksheet containing the link */
    worksheet: FWorksheet;
    /** The row index of the cell */
    row: number;
    /** The column index of the cell */
    column: number;
    /** The unique identifier of the hyperlink */
    id: string;
}

export interface IBeforeSheetLinkUpdateEvent extends IEventBase {
    /** The workbook instance */
    workbook: FWorkbook;
    /** The worksheet containing the link */
    worksheet: FWorksheet;
    /** The row index of the cell */
    row: number;
    /** The column index of the cell */
    column: number;
    /** The unique identifier of the hyperlink */
    id: string;
    /** The new hyperlink content/information */
    payload: ICellLinkContent;
}

export interface ISheetLinkEventConfig {
    BeforeSheetLinkAdd: IBeforeSheetLinkAddEvent;
    BeforeSheetLinkCancel: IBeforeSheetLinkCancelEvent;
    BeforeSheetLinkUpdate: IBeforeSheetLinkUpdateEvent;
}

FEventName.extend(FSheetLinkEvent);

declare module '@univerjs/core' {
    // eslint-disable-next-line ts/naming-convention
    interface FEventName extends IFSheetLinkEvent {
    }

    interface IEventParamConfig extends ISheetLinkEventConfig {
    }
}
