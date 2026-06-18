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
import type { EmbedHostEntry } from '@univerjs/embed';
import type { IEmbedHostContainerContribution } from '../types/embed-ui';

export class EmbedHostContainerRegistryService {
    private readonly _contributions = new Map<string, IEmbedHostContainerContribution>();

    register(contribution: IEmbedHostContainerContribution): void {
        const key = this._key(contribution.hostType, contribution.entry);
        if (this._contributions.has(key)) {
            throw new Error(`Embed host container contribution already registered: ${key}`);
        }

        this._contributions.set(key, contribution);
    }

    get(hostType: UniverInstanceType, entry: EmbedHostEntry): IEmbedHostContainerContribution | undefined {
        return this._contributions.get(this._key(hostType, entry));
    }

    list(): IEmbedHostContainerContribution[] {
        return [...this._contributions.values()];
    }

    supports(hostType: UniverInstanceType, entry: EmbedHostEntry, layout: IEmbedHostContainerContribution['layout']): boolean {
        const contribution = this.get(hostType, entry);
        if (!contribution) {
            return false;
        }

        return (contribution.supportedLayouts ?? [contribution.layout]).includes(layout);
    }

    private _key(hostType: UniverInstanceType, entry: EmbedHostEntry): string {
        return `${hostType}:${entry}`;
    }
}
