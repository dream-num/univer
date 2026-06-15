import type { ResourceRef, ResourceRefFile, ResourceRefPart, ResourceRefUnit, ResourceRefUnitType } from '../types/resource-ref';

const RESOURCE_REF_UNIT_TYPES = new Set<ResourceRefUnitType>(['sheet', 'doc', 'slide', 'base']);

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

export function assertResourceRef(ref: ResourceRef): asserts ref is ResourceRef {
    if (!ref || typeof ref !== 'object') {
        throw new Error('RESOURCE_REF_INVALID');
    }

    assertResourceRefFile(ref.file);
    assertResourceRefUnit(ref.unit);
    if (ref.part) {
        assertResourceRefPart(ref.part);
    }

    if (ref.extensions != null) {
        if (typeof ref.extensions !== 'object' || Array.isArray(ref.extensions)) {
            throw new Error('RESOURCE_REF_INVALID_EXTENSIONS');
        }

        for (const [key, value] of Object.entries(ref.extensions)) {
            if (!key) {
                throw new Error('RESOURCE_REF_INVALID_EXTENSION_KEY');
            }

            if (typeof value !== 'string' && (!Array.isArray(value) || value.some((item) => typeof item !== 'string'))) {
                throw new Error('RESOURCE_REF_INVALID_EXTENSION_VALUE');
            }
        }
    }
}

function assertResourceRefFile(file: ResourceRefFile): void {
    if (!file || typeof file !== 'object') {
        throw new Error('RESOURCE_REF_INVALID_FILE');
    }

    switch (file.kind) {
        case 'self':
            return;
        case 'relative':
            if (!file.path) {
                throw new Error('RESOURCE_REF_INVALID_RELATIVE_PATH');
            }
            return;
        case 'uri':
            if (!file.uri) {
                throw new Error('RESOURCE_REF_INVALID_URI');
            }
            return;
        default:
            throw new Error('RESOURCE_REF_INVALID_FILE_KIND');
    }
}

function assertResourceRefUnit(unit: ResourceRefUnit): void {
    if (!unit || typeof unit !== 'object' || !unit.selector) {
        throw new Error('RESOURCE_REF_INVALID_UNIT');
    }

    if (!RESOURCE_REF_UNIT_TYPES.has(unit.type)) {
        throw new Error('RESOURCE_REF_INVALID_UNIT_TYPE');
    }
}

function assertResourceRefPart(part: ResourceRefPart): void {
    if (!part || typeof part !== 'object') {
        throw new Error('RESOURCE_REF_INVALID_PART');
    }

    switch (part.kind) {
        case 'sheet':
            if (!part.sheetName) {
                throw new Error('RESOURCE_REF_INVALID_SHEET_PART');
            }
            return;
        case 'range':
            if (!part.ref || !part.sheetName || !part.range) {
                throw new Error('RESOURCE_REF_INVALID_RANGE_PART');
            }
            return;
        default:
            throw new Error('RESOURCE_REF_INVALID_PART_KIND');
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
