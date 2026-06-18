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

import { Disposable, Inject, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { EmbedHostAnchorModelService } from '../services/embed-host-anchor-model.service';

const EMBED_HOST_ANCHOR_HOST_TYPES = [
    UniverInstanceType.UNIVER_DOC,
    UniverInstanceType.UNIVER_SHEET,
    UniverInstanceType.UNIVER_BASE,
    UniverInstanceType.UNIVER_SLIDE,
] as const;

export class EmbedHostAnchorCleanupController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(EmbedHostAnchorModelService) private readonly _anchorModelService: EmbedHostAnchorModelService
    ) {
        super();

        EMBED_HOST_ANCHOR_HOST_TYPES.forEach((type) => {
            this.disposeWithMe(
                this._univerInstanceService.getTypeOfUnitDisposed$(type).subscribe((unit) => {
                    this._anchorModelService.clearUnit(unit.getUnitId());
                })
            );
        });
    }
}
