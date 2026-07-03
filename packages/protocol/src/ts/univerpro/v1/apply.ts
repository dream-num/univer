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

import type { IChangeset, ICommand, IMutation } from '../../univer/changeset';
import type { IError } from '../../univer/constants/errors';
import type { UniverType } from '../../univer/constants/univer';
import type { IInitialSheet } from '../../univer/initial-sheet';
import type { ISnapshot } from '../../univer/snapshot';
import type { ICustomCellTemplate } from '../../univer/unit-template';

export interface IForkUnitRequest {
    sourceUnitId: string;
    targetUnitId: string;
    type: UniverType;
}

export interface IForkUnitResponse {
    error: IError | undefined;
    snapshot: ISnapshot | undefined;
}

export interface IGetUnitRawContentRequest {
    unitID: string;
    type: UniverType;
    subUnitID: string;
}

export interface IGetUnitRawContentResponse {
    error: IError | undefined;
    initialSheet: IInitialSheet | undefined;
    dataStream: string;
}

/** The meta required to create a new unit. */
export interface IWorkbookCreateMeta {
    /**
     * If you want to create an empty sheet, make this undefined or a empty
     * string.
     */
    templateID?:
    | string
    | undefined;
    /** Name of the unit. It should be localized. */
    name: string;
    /** Locale of the unit. */
    locale: string;
    customCell?:
    | ICustomCellTemplate
    | undefined;
    /** Other meta in the future. */
    docContent: string;
}

export interface ICreateUnitRequest {
    unitID: string;
    type: UniverType;
    name: string;
    creator: string;
    /** If `type` is UniverType.UNIVER_SHEEET, this is requried. */
    workbookMeta?:
    | IWorkbookCreateMeta
    | undefined;
    /** Other meta for other types of univer. */
    initialSheets: IInitialSheet[];
    workbookDataJson: string;
    /** two types: traditional and modern, default is modern */
    docType?: string | undefined;
}

export interface ICreateUnitResponse {
    error: IError | undefined;
    sheetOrder: string[];
}

/**
 * IApplyRequest is almost the same as a IChangeset.
 * See `changeset.proto` for details.
 */
export interface IApplyRequest {
    unitID: string;
    type: UniverType;
    /** changeset to apply */
    changeset:
    | IChangeset
    | undefined;
    /** changsetset to fast forward to, these cs has been applied to the document */
    fastForward: IChangeset[];
}

export interface IApplyResponse {
    error:
    | IError
    | undefined;
    /** The revision of the document right now */
    revision: number;
}

export interface IDirectWriteRequest {
    unitID: string;
    type: UniverType;
    body: IDirectWriteBody | undefined;
    userID: string;
}

interface IDirectWriteBody {
    unitID: string;
    type: UniverType;
    userID: string;
    /** ICommand to be executed. Not that you must provide a on of commands or mutations, not both. */
    commands: ICommand[];
    /** ICommand to be executed. Not that you must provide a on of commands or mutations, not both. */
    mutations: IMutation[];
}

export interface IDirectWriteResponse {
    error: IError | undefined;
    revision: number;
}

export interface IDisposeRequest {
    unitID: string;
}

export interface IDisposeResponse {
    error: IError | undefined;
}

export interface IEnsureSnapshotRequest {
    unitID: string;
    type: UniverType;
    revision: number;
}

export interface IEnsureSnapshotResponse {
    error: IError | undefined;
    snapshot: ISnapshot | undefined;
}

export interface IPreloadUnitRequest {
    unitID: string;
    type: UniverType;
}

export interface IPreloadUnitResponse {
    error: IError | undefined;
}
