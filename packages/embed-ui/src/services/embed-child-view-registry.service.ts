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

import type { UniverInstanceType } from '@univerjs/core';
import type { EmbedChildViewContribution } from '../types/embed-ui';

export class EmbedChildViewRegistryService {
    private readonly _contributions = new Map<UniverInstanceType, EmbedChildViewContribution>();

    register(contribution: EmbedChildViewContribution): void {
        if (this._contributions.has(contribution.childType)) {
            throw new Error(`Embed child view contribution already registered: ${contribution.childType}`);
        }

        this._contributions.set(contribution.childType, contribution);
    }

    get(childType: UniverInstanceType): EmbedChildViewContribution | undefined {
        return this._contributions.get(childType);
    }

    list(): EmbedChildViewContribution[] {
        return [...this._contributions.values()];
    }
}
