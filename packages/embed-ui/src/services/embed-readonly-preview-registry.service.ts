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
import type { EmbedReadonlyPreviewProvider } from '../types/embed-ui';

export class EmbedReadonlyPreviewRegistryService {
    private readonly _providers = new Map<UniverInstanceType, EmbedReadonlyPreviewProvider<any>>();

    register(provider: EmbedReadonlyPreviewProvider<any>): void {
        if (this._providers.has(provider.childType)) {
            throw new Error(`Embed readonly preview provider already registered: ${provider.childType}`);
        }

        this._providers.set(provider.childType, provider);
    }

    get(childType: UniverInstanceType): EmbedReadonlyPreviewProvider<any> | undefined {
        return this._providers.get(childType);
    }

    list(): EmbedReadonlyPreviewProvider<any>[] {
        return [...this._providers.values()];
    }
}
