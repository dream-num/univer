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

/**
 * ResourceRef URI parser/formatter for Embed.
 *
 * Current implementation scope covers canonical self unit references:
 * `#unit=<selector>&type=<sheet|doc|slide|base>`.
 *
 * The public API and data structures follow the ResourceRef RFC shape so this
 * module can be expanded or replaced by the standard ResourceRef implementation.
 */

import type { FormatResourceRefOptions, IResourceRef, ParseResourceRefOptions, ResourceRefUnitType } from '../types/resource-ref';
import { normalizeResourceRef } from './resource-ref';

const INVALID_PERCENT_ESCAPE_PATTERN = /%(?![0-9A-Fa-f]{2})/;
const SUPPORTED_FRAGMENT_KEYS = new Set(['unit', 'type']);

export function parseResourceRef(uriReference: string, _options: ParseResourceRefOptions = {}): IResourceRef {
    if (typeof uriReference !== 'string') {
        throw new Error('INVALID_URI_REFERENCE');
    }

    const hashIndex = uriReference.indexOf('#');
    if (hashIndex !== 0) {
        throw new Error('INVALID_URI_REFERENCE');
    }

    const fragment = uriReference.slice(hashIndex + 1);
    const params = parseFragment(fragment);
    const unitSelector = params.get('unit');
    const unitType = params.get('type');
    if (!unitSelector) {
        throw new Error('MISSING_UNIT');
    }
    if (!unitType) {
        throw new Error('MISSING_TYPE');
    }

    return normalizeResourceRef({
        file: { kind: 'self' },
        unit: {
            selector: unitSelector,
            type: unitType as ResourceRefUnitType,
        },
    });
}

export function formatResourceRef(ref: IResourceRef, _options: FormatResourceRefOptions = {}): string {
    const normalized = normalizeResourceRef(ref);
    if (normalized.file.kind !== 'self') {
        throw new Error('RESOURCE_REF_FILE_UNSUPPORTED');
    }
    if (normalized.part || normalized.extensions) {
        throw new Error('RESOURCE_REF_URI_UNSUPPORTED');
    }

    return `#unit=${encodeFragmentComponent(normalized.unit.selector)}&type=${encodeFragmentComponent(normalized.unit.type)}`;
}

function parseFragment(fragment: string): Map<string, string> {
    if (!fragment) {
        throw new Error('INVALID_FRAGMENT_SYNTAX');
    }

    const params = new Map<string, string>();
    for (const rawParam of fragment.split('&')) {
        const separatorIndex = rawParam.indexOf('=');
        if (separatorIndex <= 0) {
            throw new Error('INVALID_FRAGMENT_SYNTAX');
        }

        const key = decodeFragmentComponent(rawParam.slice(0, separatorIndex));
        const value = decodeFragmentComponent(rawParam.slice(separatorIndex + 1));
        if (!value || !SUPPORTED_FRAGMENT_KEYS.has(key) || params.has(key)) {
            throw new Error('INVALID_FRAGMENT_SYNTAX');
        }

        params.set(key, value);
    }

    return params;
}

function decodeFragmentComponent(value: string): string {
    if (INVALID_PERCENT_ESCAPE_PATTERN.test(value)) {
        throw new Error('INVALID_PERCENT_ENCODING');
    }

    try {
        return decodeURIComponent(value);
    } catch {
        throw new Error('INVALID_PERCENT_ENCODING');
    }
}

function encodeFragmentComponent(value: string): string {
    return encodeURIComponent(value);
}
