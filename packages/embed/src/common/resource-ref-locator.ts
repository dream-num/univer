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

import type { ParsedResourceRef } from '../types/resource-ref';

const BARE_LOCAL_UNIT_ID_PATTERN = /^[A-Za-z0-9_.-]+$/;
const INVALID_PERCENT_ESCAPE_PATTERN = /%(?![0-9A-Fa-f]{2})/;

export function normalizeResourceRefLocator(locator: string): string {
    return parseResourceRefLocator(locator).canonicalRef;
}

export function parseResourceRefLocator(locator: string): ParsedResourceRef {
    if (!locator || locator.trim() !== locator) {
        throw new Error('RESOURCE_REF_LOCATOR_INVALID');
    }

    if (locator.startsWith('#')) {
        return parseAnchorLocator(locator);
    }

    if (BARE_LOCAL_UNIT_ID_PATTERN.test(locator)) {
        return createAnchorUnitRef(locator);
    }

    throw new Error('RESOURCE_REF_LOCATOR_UNSUPPORTED');
}

function parseAnchorLocator(locator: string): ParsedResourceRef {
    const fragment = locator.slice(1);
    if (!fragment) {
        throw new Error('RESOURCE_REF_LOCATOR_INVALID');
    }

    const pairs = fragment.split('&').map(parseFragmentPair);
    if (pairs.length === 1 && pairs[0][0] === 'unit') {
        return createAnchorUnitRef(pairs[0][1]);
    }

    throw new Error('RESOURCE_REF_LOCATOR_UNSUPPORTED');
}

function parseFragmentPair(pair: string): [string, string] {
    const separatorIndex = pair.indexOf('=');
    if (separatorIndex <= 0) {
        throw new Error('RESOURCE_REF_LOCATOR_INVALID');
    }

    return [
        decodeFragmentComponent(pair.slice(0, separatorIndex)),
        decodeFragmentComponent(pair.slice(separatorIndex + 1)),
    ];
}

function decodeFragmentComponent(value: string): string {
    return decodeLocatorComponent(value);
}

function decodeLocatorComponent(value: string): string {
    if (INVALID_PERCENT_ESCAPE_PATTERN.test(value)) {
        throw new Error('RESOURCE_REF_LOCATOR_INVALID');
    }

    try {
        return decodeURIComponent(value);
    } catch {
        throw new Error('RESOURCE_REF_LOCATOR_INVALID');
    }
}

function formatUnitLocator(unitSelector: string): string {
    if (!unitSelector) {
        throw new Error('RESOURCE_REF_LOCATOR_INVALID');
    }

    return `#unit=${encodeURIComponent(unitSelector)}`;
}

function createAnchorUnitRef(unitSelector: string): ParsedResourceRef {
    return {
        canonicalRef: formatUnitLocator(unitSelector),
        unitSelector,
        params: new Map([['unit', unitSelector]]),
    };
}
