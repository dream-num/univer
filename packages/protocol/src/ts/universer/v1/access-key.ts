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

interface IAccessKey {
    recordId: string;
    accessKey: string;
    createdAt: number;
    agent: boolean;
    description: string;
}

interface ICreateAccessKeyRequest {
    agent: boolean;
    description?: string | undefined;
}

interface ICreateAccessKeyResponse {
    error: IError | undefined;
    accessKey: IAccessKey | undefined;
}

interface IListAccessKeysRequest {
}

interface IListAccessKeysResponse {
    error: IError | undefined;
    accessKeys: IAccessKey[];
}

interface IDeleteAccessKeyRequest {
    recordId: string;
}

interface IDeleteAccessKeyResponse {
    error: IError | undefined;
}

export interface IAccessKeyService {
    CreateAccessKey(request: ICreateAccessKeyRequest, metadata?: Metadata): Observable<ICreateAccessKeyResponse>;
    ListAccessKeys(request: IListAccessKeysRequest, metadata?: Metadata): Observable<IListAccessKeysResponse>;
    DeleteAccessKey(request: IDeleteAccessKeyRequest, metadata?: Metadata): Observable<IDeleteAccessKeyResponse>;
}
