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
import type { EmbedLayout } from '@univerjs/embed';
import type { EmbedPassiveViewportProvider } from '../types/embed-ui';
import { toDisposable } from '@univerjs/core';

export class EmbedPassiveViewportRegistryService {
    private readonly _providers = new Map<UniverInstanceType, EmbedPassiveViewportProvider>();

    register(provider: EmbedPassiveViewportProvider): IDisposable {
        this._providers.set(provider.childType, provider);
        return toDisposable(() => {
            if (this._providers.get(provider.childType) === provider) {
                this._providers.delete(provider.childType);
            }
        });
    }

    get(childType: UniverInstanceType, layout?: EmbedLayout): EmbedPassiveViewportProvider | undefined {
        const provider = this._providers.get(childType);
        if (!provider) {
            return undefined;
        }

        if (layout && provider.supportedLayouts?.length && !provider.supportedLayouts.includes(layout)) {
            return undefined;
        }

        return provider;
    }

    list(): EmbedPassiveViewportProvider[] {
        return [...this._providers.values()];
    }
}
