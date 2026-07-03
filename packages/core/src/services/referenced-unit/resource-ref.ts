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

export interface IResourceRefUnit {
    selector: ResourceRefUnitSelector;
    type: ResourceRefUnitType;
}

export type ResourceRefUnit = IResourceRefUnit;

export type ResourceRefPartKind = 'sheet' | 'range';

export type ResourceRefPart =
    | { kind: 'sheet'; sheetName: string; sheetId?: string }
    | { kind: 'range'; ref: string; sheetName: string; range: string; sheetId?: string };

export type ResourceRefExtensionValue = string | readonly string[];

export interface IResourceRef {
    file: ResourceRefFile;
    unit: ResourceRefUnit;
    part?: ResourceRefPart;
    extensions?: Readonly<Record<string, ResourceRefExtensionValue>>;
}

export type ResourceRef = IResourceRef;

export interface IParseResourceRefOptions {
    mode?: 'strict' | 'lenient';
}

export type ParseResourceRefOptions = IParseResourceRefOptions;

export interface IValidateResourceRefOptions {
    mode?: 'strict' | 'lenient';
}

export type ValidateResourceRefOptions = IValidateResourceRefOptions;

export interface IFormatResourceRefOptions {
    preserveExtensions?: boolean;
}

export type FormatResourceRefOptions = IFormatResourceRefOptions;

export type ResourceRefInput = ResourceRef | string;

export enum ResourceRefErrorCode {
    InvalidUriReference = 'INVALID_URI_REFERENCE',
    InvalidFragmentSyntax = 'INVALID_FRAGMENT_SYNTAX',
    InvalidPercentEncoding = 'INVALID_PERCENT_ENCODING',
    MissingUnit = 'MISSING_UNIT',
    MissingType = 'MISSING_TYPE',
    ResourceRefInvalid = 'RESOURCE_REF_INVALID',
    ResourceRefInvalidFile = 'RESOURCE_REF_INVALID_FILE',
    ResourceRefInvalidFileKind = 'RESOURCE_REF_INVALID_FILE_KIND',
    ResourceRefInvalidRelativePath = 'RESOURCE_REF_INVALID_RELATIVE_PATH',
    ResourceRefInvalidUri = 'RESOURCE_REF_INVALID_URI',
    ResourceRefInvalidUnit = 'RESOURCE_REF_INVALID_UNIT',
    ResourceRefInvalidUnitType = 'RESOURCE_REF_INVALID_UNIT_TYPE',
    ResourceRefInvalidPart = 'RESOURCE_REF_INVALID_PART',
    ResourceRefInvalidPartKind = 'RESOURCE_REF_INVALID_PART_KIND',
    ResourceRefInvalidSheetPart = 'RESOURCE_REF_INVALID_SHEET_PART',
    ResourceRefInvalidRangePart = 'RESOURCE_REF_INVALID_RANGE_PART',
    ResourceRefInvalidExtensions = 'RESOURCE_REF_INVALID_EXTENSIONS',
    ResourceRefInvalidExtensionKey = 'RESOURCE_REF_INVALID_EXTENSION_KEY',
    ResourceRefInvalidExtensionValue = 'RESOURCE_REF_INVALID_EXTENSION_VALUE',
    ResourceRefFileUnsupported = 'RESOURCE_REF_FILE_UNSUPPORTED',
    ResourceRefUriUnsupported = 'RESOURCE_REF_URI_UNSUPPORTED',
}

export class ResourceRefError extends Error {
    readonly code: ResourceRefErrorCode;
    readonly details?: unknown;

    constructor(code: ResourceRefErrorCode, details?: unknown) {
        super(code);
        this.name = 'ResourceRefError';
        this.code = code;
        this.details = details;
    }
}

const RESOURCE_REF_UNIT_TYPES = new Set<ResourceRefUnitType>(['sheet', 'doc', 'slide', 'base']);
const INVALID_PERCENT_ESCAPE_PATTERN = /%(?![0-9A-Fa-f]{2})/;
const SUPPORTED_FRAGMENT_KEYS = new Set(['unit', 'type']);

export function normalizeResourceRefInput(ref: ResourceRefInput): ResourceRef {
    return typeof ref === 'string' ? parseResourceRef(ref) : normalizeResourceRef(ref);
}

export function normalizeResourceRef(ref: ResourceRef): ResourceRef {
    assertResourceRef(ref);
    return {
        file: normalizeResourceRefFile(ref.file),
        unit: {
            selector: ref.unit.selector,
            type: ref.unit.type,
        },
        ...(ref.part ? { part: normalizeResourceRefPart(ref.part) } : {}),
        ...(ref.extensions ? { extensions: normalizeResourceRefExtensions(ref.extensions) } : {}),
    };
}

export function getResourceRefKey(ref: ResourceRef): string {
    return JSON.stringify(normalizeResourceRef(ref));
}

export function getResourceRefUnitKey(ref: ResourceRef): string {
    return JSON.stringify(getResourceRefUnitLocator(ref));
}

export function getResourceRefUnitLocator(ref: ResourceRef): Pick<ResourceRef, 'file' | 'unit'> {
    const normalized = normalizeResourceRef(ref);
    return {
        file: normalized.file,
        unit: normalized.unit,
    };
}

export function assertResourceRef(ref: ResourceRef): asserts ref is ResourceRef {
    if (!ref || typeof ref !== 'object') {
        throw new ResourceRefError(ResourceRefErrorCode.ResourceRefInvalid, { ref });
    }

    assertResourceRefFile(ref.file);
    assertResourceRefUnit(ref.unit);
    if (ref.part) {
        assertResourceRefPart(ref.part);
    }

    if (ref.extensions != null) {
        if (typeof ref.extensions !== 'object' || Array.isArray(ref.extensions)) {
            throw new ResourceRefError(ResourceRefErrorCode.ResourceRefInvalidExtensions, { extensions: ref.extensions });
        }

        for (const [key, value] of Object.entries(ref.extensions)) {
            if (!key) {
                throw new ResourceRefError(ResourceRefErrorCode.ResourceRefInvalidExtensionKey, { key });
            }

            if (typeof value !== 'string' && (!Array.isArray(value) || value.some((item) => typeof item !== 'string'))) {
                throw new ResourceRefError(ResourceRefErrorCode.ResourceRefInvalidExtensionValue, { key, value });
            }
        }
    }
}

export function parseResourceRef(uriReference: string, _options: ParseResourceRefOptions = {}): ResourceRef {
    if (typeof uriReference !== 'string') {
        throw new ResourceRefError(ResourceRefErrorCode.InvalidUriReference, { uriReference });
    }

    const hashIndex = uriReference.indexOf('#');
    if (hashIndex !== 0) {
        throw new ResourceRefError(ResourceRefErrorCode.InvalidUriReference, { uriReference });
    }

    const fragment = uriReference.slice(hashIndex + 1);
    const params = parseFragment(fragment);
    const unitSelector = params.get('unit');
    const unitType = params.get('type');
    if (!unitSelector) {
        throw new ResourceRefError(ResourceRefErrorCode.MissingUnit, { uriReference });
    }
    if (!unitType) {
        throw new ResourceRefError(ResourceRefErrorCode.MissingType, { uriReference });
    }

    return normalizeResourceRef({
        file: { kind: 'self' },
        unit: {
            selector: unitSelector,
            type: unitType as ResourceRefUnitType,
        },
    });
}

export function formatResourceRef(ref: ResourceRef, _options: FormatResourceRefOptions = {}): string {
    const normalized = normalizeResourceRef(ref);
    if (normalized.file.kind !== 'self') {
        throw new ResourceRefError(ResourceRefErrorCode.ResourceRefFileUnsupported, { file: normalized.file });
    }
    if (normalized.part || normalized.extensions) {
        throw new ResourceRefError(ResourceRefErrorCode.ResourceRefUriUnsupported, {
            part: normalized.part,
            extensions: normalized.extensions,
        });
    }

    return `#unit=${encodeFragmentComponent(normalized.unit.selector)}&type=${encodeFragmentComponent(normalized.unit.type)}`;
}

function assertResourceRefFile(file: ResourceRefFile): void {
    if (!file || typeof file !== 'object') {
        throw new ResourceRefError(ResourceRefErrorCode.ResourceRefInvalidFile, { file });
    }

    switch (file.kind) {
        case 'self':
            return;
        case 'relative':
            if (!file.path) {
                throw new ResourceRefError(ResourceRefErrorCode.ResourceRefInvalidRelativePath, { file });
            }
            return;
        case 'uri':
            if (!file.uri) {
                throw new ResourceRefError(ResourceRefErrorCode.ResourceRefInvalidUri, { file });
            }
            return;
        default:
            throw new ResourceRefError(ResourceRefErrorCode.ResourceRefInvalidFileKind, { file });
    }
}

function assertResourceRefUnit(unit: ResourceRefUnit): void {
    if (!unit || typeof unit !== 'object' || !unit.selector) {
        throw new ResourceRefError(ResourceRefErrorCode.ResourceRefInvalidUnit, { unit });
    }

    if (!RESOURCE_REF_UNIT_TYPES.has(unit.type)) {
        throw new ResourceRefError(ResourceRefErrorCode.ResourceRefInvalidUnitType, { unit });
    }
}

function assertResourceRefPart(part: ResourceRefPart): void {
    if (!part || typeof part !== 'object') {
        throw new ResourceRefError(ResourceRefErrorCode.ResourceRefInvalidPart, { part });
    }

    switch (part.kind) {
        case 'sheet':
            if (!part.sheetName) {
                throw new ResourceRefError(ResourceRefErrorCode.ResourceRefInvalidSheetPart, { part });
            }
            return;
        case 'range':
            if (!part.ref || !part.sheetName || !part.range) {
                throw new ResourceRefError(ResourceRefErrorCode.ResourceRefInvalidRangePart, { part });
            }
            return;
        default:
            throw new ResourceRefError(ResourceRefErrorCode.ResourceRefInvalidPartKind, { part });
    }
}

function normalizeResourceRefFile(file: ResourceRefFile): ResourceRefFile {
    switch (file.kind) {
        case 'self':
            return { kind: 'self' };
        case 'relative':
            return { kind: 'relative', path: file.path };
        case 'uri':
            return { kind: 'uri', uri: file.uri };
    }
}

function normalizeResourceRefPart(part: ResourceRefPart): ResourceRefPart {
    switch (part.kind) {
        case 'sheet':
            return {
                kind: 'sheet',
                sheetName: part.sheetName,
                ...(part.sheetId ? { sheetId: part.sheetId } : {}),
            };
        case 'range':
            return {
                kind: 'range',
                ref: part.ref,
                sheetName: part.sheetName,
                range: part.range,
                ...(part.sheetId ? { sheetId: part.sheetId } : {}),
            };
    }
}

function normalizeResourceRefExtensions(extensions: NonNullable<ResourceRef['extensions']>): NonNullable<ResourceRef['extensions']> {
    return Object.fromEntries(Object.entries(extensions)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, value]) => [key, Array.isArray(value) ? [...value] : value]));
}

function parseFragment(fragment: string): Map<string, string> {
    if (!fragment) {
        throw new ResourceRefError(ResourceRefErrorCode.InvalidFragmentSyntax, { fragment });
    }

    const params = new Map<string, string>();
    for (const rawParam of fragment.split('&')) {
        const separatorIndex = rawParam.indexOf('=');
        if (separatorIndex <= 0) {
            throw new ResourceRefError(ResourceRefErrorCode.InvalidFragmentSyntax, { fragment, rawParam });
        }

        const key = decodeFragmentComponent(rawParam.slice(0, separatorIndex));
        const value = decodeFragmentComponent(rawParam.slice(separatorIndex + 1));
        if (!value || !SUPPORTED_FRAGMENT_KEYS.has(key) || params.has(key)) {
            throw new ResourceRefError(ResourceRefErrorCode.InvalidFragmentSyntax, { fragment, key, value });
        }

        params.set(key, value);
    }

    return params;
}

function decodeFragmentComponent(value: string): string {
    if (INVALID_PERCENT_ESCAPE_PATTERN.test(value)) {
        throw new ResourceRefError(ResourceRefErrorCode.InvalidPercentEncoding, { value });
    }

    try {
        return decodeURIComponent(value);
    } catch {
        throw new ResourceRefError(ResourceRefErrorCode.InvalidPercentEncoding, { value });
    }
}

function encodeFragmentComponent(value: string): string {
    return encodeURIComponent(value);
}
