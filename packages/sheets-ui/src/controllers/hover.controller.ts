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

import type { Workbook } from '@univerjs/core';
import { Disposable, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';
import { HoverManagerService } from '../services/hover-manager.service';

@OnLifecycle(LifecycleStages.Rendered, HoverController)
export class HoverController extends Disposable {
    constructor(
        @IRenderManagerService private _renderManagerService: IRenderManagerService,
        @Inject(HoverManagerService) private _hoverManagerService: HoverManagerService,
        @IUniverInstanceService private _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._initPointerEvent();
    }

    private _initScrollEvent() {
        // this.
    }

    private _initPointerEvent() {
        const currentRender = this._renderManagerService.getRenderById(
            this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId()
        );
        if (!currentRender) {
            return;
        }

        const { scene } = currentRender;
        const observer = scene.onPointerMoveObserver.add((evt) => {
            this._hoverManagerService.onMouseMove(evt.offsetX, evt.offsetY);
        });

        this.disposeWithMe({
            dispose() {
                scene.onPointerMoveObserver.remove(observer);
            },
        });
    }
}
