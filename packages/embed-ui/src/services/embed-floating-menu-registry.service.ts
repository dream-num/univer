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

import type { IDisposable, UniverInstanceType } from '@univerjs/core';
import type { EmbedHostEntry } from '@univerjs/embed';
import type { IEmbedFloatingMenuContribution } from '../types/embed-ui';
import { toDisposable } from '@univerjs/core';

export class EmbedFloatingMenuRegistryService {
    private readonly _contributions = new Map<string, IEmbedFloatingMenuContribution>();

    register(contribution: IEmbedFloatingMenuContribution): IDisposable {
        const key = this._key(contribution.hostType, contribution.entry, contribution.childType);
        if (this._contributions.has(key)) {
            throw new Error(`Embed floating menu contribution already registered: ${key}`);
        }

        this._contributions.set(key, contribution);

        return toDisposable(() => {
            if (this._contributions.get(key) === contribution) {
                this._contributions.delete(key);
            }
        });
    }

    get(hostType: UniverInstanceType, entry: EmbedHostEntry, childType?: UniverInstanceType): IEmbedFloatingMenuContribution | undefined {
        if (childType != null) {
            const exact = this._contributions.get(this._key(hostType, entry, childType));
            if (exact) {
                return exact;
            }
        }

        return this._contributions.get(this._key(hostType, entry));
    }

    hasExact(hostType: UniverInstanceType, entry: EmbedHostEntry, childType?: UniverInstanceType): boolean {
        return this._contributions.has(this._key(hostType, entry, childType));
    }

    list(): IEmbedFloatingMenuContribution[] {
        return [...this._contributions.values()];
    }

    private _key(hostType: UniverInstanceType, entry: EmbedHostEntry, childType?: UniverInstanceType): string {
        return childType == null ? `${hostType}:${entry}:*` : `${hostType}:${entry}:${childType}`;
    }
}
