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

import type { Metadata } from '@grpc/grpc-js';
import type { Observable } from 'rxjs';
import type { IError } from '../../univer/constants/errors';

export enum FileSource {
    Undefined = 0,
    /** HttpImport - assign UserID */
    HttpImport = 1,
    /** HttpExport - assign UserID */
    HttpExport = 2,
    /** UnitEmbedded - assign UnitID */
    UnitEmbedded = 3,
    /** UnitSnapshot - assign UnitID */
    UnitSnapshot = 4,
    /** UserProfileImg - assign UserID */
    UserProfileImg = 5,
    /** ClipsheetFragments - assign UserID, fragmented file will be deleted after 30 days */
    ClipsheetFragments = 6,
    /** LLMInputData - assign UserID */
    LLMInputData = 7,
    UNRECOGNIZED = -1,
}

enum DownloadUrlMode {
    Default = 0,
    UseProxy = 1,
    UseDirect = 2,
    UNRECOGNIZED = -1,
}

interface ISignUrlRequest {
    fileID: string;
}

interface ISignUrlResponse {
    error: IError | undefined;
    url: string;
    mode: DownloadUrlMode;
}

interface IUploadFileRequestMeta {
    fileName: string;
    fileHash: string;
    fileSize: number;
    source: FileSource;
    assign: string;
}

export interface IFileUploadRequest {
    data?: Uint8Array | undefined;
    meta?: IUploadFileRequestMeta | undefined;
}

interface IUploadResponse {
    error: IError | undefined;
    fileID: string;
}

interface ISetUniverGoJsonRequest {
    jsonObj: string;
}

interface ISetUniverGoJsonResponse {
    error: IError | undefined;
}

interface IGetUniverGoJsonRequest {
}

interface IGetUniverGoJsonResponse {
    error: IError | undefined;
    jsonObj: string;
}

interface IPutTemplateResourceRequest {
    fileName: string;
}

interface IPutTemplateResourceResponse {
    error: IError | undefined;
    signUrl: string;
}

interface IPutFileByIdRequest {
    data?: Uint8Array | undefined;
    meta?: IPutFileByIdMeta | undefined;
}

interface IPutFileByIdMeta {
    fileId: string;
    fileSize: number;
}

interface IPutFileByIdResponse {
    error: IError | undefined;
    fileId: string;
}

interface ISignPutUrlRequest {
    fileSize: number;
    name?: string | undefined;
    source: FileSource;
}

interface ISignPutUrlResponse {
    error: IError | undefined;
    fileId: string;
    putUrl: string;
}

interface IDeleteFileByIdRequest {
    fileId: string;
}

interface IDeleteFileByIdResponse {
    error: IError | undefined;
}

export interface IFileService {
    SignUrl(request: ISignUrlRequest, metadata?: Metadata): Observable<ISignUrlResponse>;
    SignPutUrl(request: ISignPutUrlRequest, metadata?: Metadata): Observable<ISignPutUrlResponse>;
    Upload(request: Observable<IFileUploadRequest>, metadata?: Metadata): Observable<IUploadResponse>;
    SetUniverGoJson(request: ISetUniverGoJsonRequest, metadata?: Metadata): Observable<ISetUniverGoJsonResponse>;
    GetUniverGoJson(request: IGetUniverGoJsonRequest, metadata?: Metadata): Observable<IGetUniverGoJsonResponse>;
    PutTemplateResouce(request: IPutTemplateResourceRequest, metadata?: Metadata): Observable<IPutTemplateResourceResponse>;
    PutFileById(request: Observable<IPutFileByIdRequest>, metadata?: Metadata): Observable<IPutFileByIdResponse>;
    DeleteFileById(request: IDeleteFileByIdRequest, metadata?: Metadata): Observable<IDeleteFileByIdResponse>;
}
