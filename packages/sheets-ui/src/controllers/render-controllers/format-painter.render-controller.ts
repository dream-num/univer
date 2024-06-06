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
import {
    Disposable,
    toDisposable,
} from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { CURSOR_TYPE } from '@univerjs/engine-render';

import { FormatPainterStatus, IFormatPainterService } from '../../services/format-painter/format-painter.service';

export class FormatPainterRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @IFormatPainterService private readonly _formatPainterService: IFormatPainterService
    ) {
        super();
        this._initialize();
    }

    private _initialize() {
        this._bindFormatPainterStatus();
    }

    private _bindFormatPainterStatus() {
        this.disposeWithMe(
            toDisposable(this._formatPainterService.status$.subscribe((status) => {
                const scene = this._context.scene;
                if (!scene) return;
                if (status !== FormatPainterStatus.OFF) {
                    scene.setDefaultCursor(CURSOR_TYPE.CELL);
                } else {
                    scene.setDefaultCursor(CURSOR_TYPE.DEFAULT);
                }
            })));
    }
}
