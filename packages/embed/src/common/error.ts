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

export enum EmbedErrorCode {
    HostUnitNotFound = 'EMBED_HOST_UNIT_NOT_FOUND',
    CreateFailed = 'EMBED_CREATE_FAILED',
    CapabilityNotSupported = 'EMBED_CAPABILITY_NOT_SUPPORTED',
    DescriptorNotFound = 'EMBED_DESCRIPTOR_NOT_FOUND',
    DescriptorChildTypeRequired = 'EMBED_DESCRIPTOR_CHILD_TYPE_REQUIRED',
    DescriptorChildTypeMismatch = 'EMBED_DESCRIPTOR_CHILD_TYPE_MISMATCH',
    ChildUnitAlreadyEmbedded = 'EMBED_CHILD_UNIT_ALREADY_EMBEDDED',
    MaterializedChildUnitNotLoaded = 'EMBED_MATERIALIZED_CHILD_UNIT_NOT_LOADED',
    MaterializedChildUnitRequired = 'EMBED_MATERIALIZED_CHILD_UNIT_REQUIRED',
    LocalRuntimeResourceRefUnsupported = 'LOCAL_RUNTIME_RESOURCE_REF_UNSUPPORTED',
    LocalRuntimeResourceRefUnitTypeMismatch = 'LOCAL_RUNTIME_RESOURCE_REF_UNIT_TYPE_MISMATCH',
    LocalRuntimeResourceRefUnitNotFound = 'LOCAL_RUNTIME_RESOURCE_REF_UNIT_NOT_FOUND',
    LocalRuntimeResourceRefDataSelectorUnsupported = 'LOCAL_RUNTIME_RESOURCE_REF_DATA_SELECTOR_UNSUPPORTED',
    LocalRuntimeResourceRefDataUnitTypeUnsupported = 'LOCAL_RUNTIME_RESOURCE_REF_DATA_UNIT_TYPE_UNSUPPORTED',
    LocalRuntimeResourceRefDataUnitNotFound = 'LOCAL_RUNTIME_RESOURCE_REF_DATA_UNIT_NOT_FOUND',
    LocalRuntimeResourceRefDataSheetNotFound = 'LOCAL_RUNTIME_RESOURCE_REF_DATA_SHEET_NOT_FOUND',
    LocalRuntimeResourceRefRangeInvalid = 'LOCAL_RUNTIME_RESOURCE_REF_RANGE_INVALID',
}

export class EmbedError extends Error {
    readonly code: EmbedErrorCode;
    readonly details?: unknown;

    constructor(code: EmbedErrorCode, details?: unknown) {
        super(code);
        this.name = 'EmbedError';
        this.code = code;
        this.details = details;
    }
}
