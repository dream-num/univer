import type { ResourceRefUnitType } from '../types/resource-ref';
import { UniverInstanceType } from '@univerjs/core';

export function toResourceRefUnitType(type: UniverInstanceType): ResourceRefUnitType {
    switch (type) {
        case UniverInstanceType.UNIVER_SHEET:
            return 'sheet';
        case UniverInstanceType.UNIVER_DOC:
            return 'doc';
        case UniverInstanceType.UNIVER_SLIDE:
            return 'slide';
        case UniverInstanceType.UNIVER_BASE:
            return 'base';
        default:
            throw new Error(`UNSUPPORTED_UNIT_TYPE:${type}`);
    }
}

export function fromResourceRefUnitType(type: ResourceRefUnitType): UniverInstanceType {
    switch (type) {
        case 'sheet':
            return UniverInstanceType.UNIVER_SHEET;
        case 'doc':
            return UniverInstanceType.UNIVER_DOC;
        case 'slide':
            return UniverInstanceType.UNIVER_SLIDE;
        case 'base':
            return UniverInstanceType.UNIVER_BASE;
        default:
            throw new Error(`UNSUPPORTED_UNIT_TYPE:${type}`);
    }
}
