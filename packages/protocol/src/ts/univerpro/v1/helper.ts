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
import type { UniverType } from '../../univer/constants/univer';
import type { IEnsureSnapshotRequest, IEnsureSnapshotResponse } from './apply';

export interface ICreateLatestSnapshotInBackgroundRequest {
    unitID: string;
    type: UniverType;
}

export interface ICreateLatestSnapshotInBackgroundResponse {
    error: IError | undefined;
}

export interface ICollaborationHelperService {
    /**
     * Ensure the snapshot at a given number would be saved to the snapshot service
     * without fetching it back. Normally used for background saving.
     */
    CreateLatestSnapshotInBackground(
        request: ICreateLatestSnapshotInBackgroundRequest,
        metadata?: Metadata,
    ): Observable<ICreateLatestSnapshotInBackgroundResponse>;
    /** from IApplyService */
    EnsureSnapshot(request: IEnsureSnapshotRequest, metadata?: Metadata): Observable<IEnsureSnapshotResponse>;
}
