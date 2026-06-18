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
