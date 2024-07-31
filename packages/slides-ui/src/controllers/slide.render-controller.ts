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

import type { UnitModel } from '@univerjs/core';
import { Inject, RxDisposable } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { ISlideEditorBridgeService } from '../services/slide-editor-bridge.service';

export class SlideRenderController extends RxDisposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<UnitModel<object, number>>,
        @Inject(ISlideEditorBridgeService) private _editorBridgeService: ISlideEditorBridgeService
    ) {
        super();
        console.log('_context', this._context);
        console.log('_editorBridgeService', this._editorBridgeService);
    }

    override dispose() {
      //...
    }
}
