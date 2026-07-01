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

import type { EmbedSource, IEmbedResolvedSource } from '../types/embed';
import type { ICreateUnitOptions } from '@univerjs/core';
import { EMBED_CHILD_CREATE_OPTIONS } from '../common/const';
import { normalizeResourceRefInput } from '../common/resource-ref-input';
import { fromResourceRefUnitType } from '../common/unit-type';

export { EMBED_CHILD_CREATE_OPTIONS };

export interface IEmbedSourceResolveContext {
    hostUnitId?: string;
    embedId?: string;
    createOptions?: ICreateUnitOptions;
}

export class EmbedSourceResolverService {
    resolve(source: EmbedSource, _context: IEmbedSourceResolveContext = {}): IEmbedResolvedSource {
        const ref = normalizeResourceRefInput(source.ref);
        if (typeof ref !== 'string' && fromResourceRefUnitType(ref.unit.type) !== source.unitType) {
            throw new Error('EMBED_SOURCE_TYPE_MISMATCH');
        }
        const childUnitId = typeof ref !== 'string' && ref.file.kind === 'self'
            ? ref.unit.selector
            : undefined;
        return {
            ...(childUnitId ? { childUnitId } : undefined),
            childType: source.unitType,
            ref,
        };
    }
}
