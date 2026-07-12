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

import type { ISectionBreak } from '../types/interfaces/i-document-data';
import { generateRandomId } from '../shared/random-id';
import { Tools } from '../shared/tools';

export const SECTION_ID_PREFIX = 'section_';

export function createSectionId(existingIds: Set<string>): string {
    let sectionId = `${SECTION_ID_PREFIX}${generateRandomId(12)}`;

    while (existingIds.has(sectionId)) {
        sectionId = `${SECTION_ID_PREFIX}${generateRandomId(12)}`;
    }

    existingIds.add(sectionId);
    return sectionId;
}

export function cloneSectionBreakWithId(sectionBreak: ISectionBreak, existingIds: Set<string>, preserveId = true): ISectionBreak {
    const cloned = Tools.deepClone(sectionBreak);

    if (preserveId && isValidSectionId(cloned.sectionId) && !existingIds.has(cloned.sectionId)) {
        existingIds.add(cloned.sectionId);
        return cloned;
    }

    cloned.sectionId = createSectionId(existingIds);
    return cloned;
}

function isValidSectionId(value: unknown): value is string {
    return typeof value === 'string' && value.startsWith(SECTION_ID_PREFIX) && value.length > SECTION_ID_PREFIX.length;
}
