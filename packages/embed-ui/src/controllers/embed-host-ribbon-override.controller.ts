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

import type { IDisposable } from '@univerjs/core';
import { Disposable, Inject, Injector, toDisposable } from '@univerjs/core';
import { IRibbonOverrideService } from '@univerjs/ui';
import { EmbedBlockRegistryService } from '../services/embed-block-registry.service';
import { EmbedHostMenuOverrideService } from '../services/embed-host-menu-override.service';

export class EmbedHostRibbonOverrideController extends Disposable {
    private _current: IDisposable | null = null;

    constructor(
        @Inject(EmbedHostMenuOverrideService)
        private readonly _menuOverrideService: EmbedHostMenuOverrideService,
        @Inject(EmbedBlockRegistryService)
        private readonly _blockRegistry: EmbedBlockRegistryService,
        @Inject(IRibbonOverrideService)
        private readonly _ribbonOverrideService: IRibbonOverrideService,
        @Inject(Injector)
        private readonly _injector: Injector
    ) {
        super();

        this.disposeWithMe(toDisposable(
            this._menuOverrideService.override$.subscribe((override) => {
                if (!override) {
                    if (this._current) {
                        this._current.dispose();
                        this._current = null;
                    } else {
                        this._ribbonOverrideService.clear();
                    }
                    return;
                }

                this._current?.dispose();
                this._current = null;

                const contribution = this._blockRegistry.get(override.childType);
                const ribbonOverride = contribution?.createRibbonOverride?.({
                    childType: override.childType,
                    childUnitId: override.childUnitId,
                    injector: this._injector,
                    embedId: override.embedId,
                    hostUnitId: override.hostUnitId,
                    entry: override.entry,
                });

                if (!ribbonOverride) {
                    this._ribbonOverrideService.clear();
                    return;
                }

                this._ribbonOverrideService.activate({
                    id: override.embedId,
                    ribbonService: ribbonOverride.ribbonService,
                    placeholderTitle: ribbonOverride.placeholderTitle,
                    hideToolbar: ribbonOverride.hideToolbar,
                });
                this._current = toDisposable(() => {
                    this._ribbonOverrideService.clear(override.embedId);
                    ribbonOverride.disposable?.dispose();
                });
            })
        ));
    }

    override dispose(): void {
        this._current?.dispose();
        this._current = null;
        super.dispose();
    }
}
