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

export type ResourceRefFile =
    | { kind: 'self' }
    | { kind: 'relative'; path: string }
    | { kind: 'uri'; uri: string };

export type ResourceRefUnitType = 'sheet' | 'doc' | 'slide' | 'base';

export type ResourceRefUnitSelector = string;

export interface ResourceRefUnit {
    selector: ResourceRefUnitSelector;
    type: ResourceRefUnitType;
}

export type IResourceRefUnit = ResourceRefUnit;

export type ResourceRefPartKind = 'sheet' | 'range';

export type ResourceRefPart =
    | { kind: 'sheet'; sheetName: string; sheetId?: string }
    | { kind: 'range'; ref: string; sheetName: string; range: string; sheetId?: string };

export type ResourceRefExtensionValue = string | readonly string[];

export interface ResourceRef {
    file: ResourceRefFile;
    unit: ResourceRefUnit;
    part?: ResourceRefPart;
    extensions?: Readonly<Record<string, ResourceRefExtensionValue>>;
}

export type IResourceRef = ResourceRef;

export interface ParseResourceRefOptions {
    mode?: 'strict' | 'lenient';
}

export interface ValidateResourceRefOptions {
    mode?: 'strict' | 'lenient';
}

export interface FormatResourceRefOptions {
    preserveExtensions?: boolean;
}

export type ResourceRefInput = ResourceRef | string;
