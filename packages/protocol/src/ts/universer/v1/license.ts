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

interface IStartFormulaTaskRequest {
    /** Task ID */
    taskId: string;
}

interface IStartFormulaTaskResponse {
    error: IError | undefined;
    limitInfo: IFormulaLimitInfo | undefined;
}

interface IGetFormulaLimitStatusRequest {
    /** Task ID */
    taskId: string;
}

interface IGetFormulaLimitStatusResponse {
    error: IError | undefined;
    limitInfo: IFormulaLimitInfo | undefined;
}

interface IReleaseFormulaTaskRequest {
    /** Task ID, used to identify the task to be released */
    taskId: string;
}

interface IReleaseFormulaTaskResponse {
    error: IError | undefined;
    limitInfo: IFormulaLimitInfo | undefined;
}

interface IFormulaLimitInfo {
    /** Maximum limit */
    maxFormulaLimit: number;
    /** Current usage */
    currentUsage: number;
    /** Available slots (maxFormulaLimit - currentUsage) */
    availableSlots: number;
    /** Whether execution permission has been granted */
    granted: boolean;
}

interface IGetLicenseQuotasRequest {
    data: string;
}

interface IGetLicenseQuotasResponse {
    error: IError | undefined;
    data: string;
}

interface IGetUserLicenseRequest {
}

export interface IGetUserLicenseResponse {
    error: IError | undefined;
    license: string;
    /**
     * deprecated license key
     *
     * @deprecated
     */
    key: string;
    /** license id */
    id1: string;
    /** user id */
    id2: string;
    /** license type */
    type: string;
    /** true - report /false - not report */
    isReport: boolean;
}

export interface ILicenseService {
    GetQuotas(request: IGetLicenseQuotasRequest, metadata?: Metadata): Observable<IGetLicenseQuotasResponse>;
    GetLicense(request: IGetUserLicenseRequest, metadata?: Metadata): Observable<IGetUserLicenseResponse>;
    /** Start task, apply for formula limit */
    StartFormulaTask(request: IStartFormulaTaskRequest, metadata?: Metadata): Observable<IStartFormulaTaskResponse>;
    /** Get formula limit status */
    GetFormulaLimitStatus(
        request: IGetFormulaLimitStatusRequest,
        metadata?: Metadata,
    ): Observable<IGetFormulaLimitStatusResponse>;
    /** Release formula limit (call after execution is complete) */
    ReleaseFormulaTask(request: IReleaseFormulaTaskRequest, metadata?: Metadata): Observable<IReleaseFormulaTaskResponse>;
}
