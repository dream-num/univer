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
import type { IEmbedBlockContribution } from '../types/embed-ui';
import { toDisposable } from '@univerjs/core';

export class EmbedBlockRegistryService {
    private readonly _contributions = new Map<UniverInstanceType, IEmbedBlockContribution>();

    register(contribution: IEmbedBlockContribution): IDisposable {
        this._contributions.set(contribution.childType, contribution);

        return toDisposable(() => {
            if (this._contributions.get(contribution.childType) === contribution) {
                this._contributions.delete(contribution.childType);
            }
        });
    }

    get(childType: UniverInstanceType): IEmbedBlockContribution | undefined {
        return this._contributions.get(childType);
    }

    list(): IEmbedBlockContribution[] {
        return [...this._contributions.values()];
    }
}
