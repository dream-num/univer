/**
 * Copyright 2023-present DreamNum Inc.
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

import type { Dependency } from '@univerjs/core';
import { Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetsCrosshairHighlightController } from './controllers/cross-hair.controller';
import { SheetsCrosshairHighlightService } from './services/cross-hair.service';
import { SheetCrosshairHighlightRenderController } from './views/widgets/crosshair-highlight.render-controller';

export class UniverSheetsCrosshairHighlightPlugin extends Plugin {
    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();
    }

    override onStarting(): void {
        ([
            [SheetsCrosshairHighlightService],
            [SheetsCrosshairHighlightController],
        ] as Dependency[]).forEach((d) => this._injector.add(d));
    }

    override onReady(): void {
        ([
            [SheetCrosshairHighlightRenderController],
        ] as Dependency[]).forEach((d) => this._injector.add(d));
        this._injector.get(SheetsCrosshairHighlightController);
        this._renderManagerService.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetCrosshairHighlightRenderController] as Dependency);
    }
}
