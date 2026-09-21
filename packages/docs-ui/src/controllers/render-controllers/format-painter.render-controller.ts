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

import type { DocumentDataModel } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, Inject, IUniverInstanceService } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { Vector2 } from '@univerjs/engine-render';
import { bindFormatPainterCanvas, FormatPainterSessionService } from '@univerjs/ui';

export class DocFormatPainterRenderController extends Disposable implements IRenderModule {
    constructor(
        context: IRenderContext<DocumentDataModel>,
        @Inject(FormatPainterSessionService) session: FormatPainterSessionService,
        @Inject(DocSelectionManagerService) selections: DocSelectionManagerService,
        @IUniverInstanceService instances: IUniverInstanceService
    ) {
        super();
        const canvas = context.engine.getCanvasElement();
        this.disposeWithMe(bindFormatPainterCanvas(canvas, session, {
            adapterId: 'doc-text',
            // Embedded shape editors preserve focus on their host Unit.
            unitId: context.unitId,
            getUnitId: () => instances.getFocusedUnit()?.getUnitId() ?? context.unitId,
            intercept: false,
            getTarget: (event) => {
                const picked = context.scene.pick(new Vector2(event.offsetX, event.offsetY));
                if (picked && picked !== context.mainComponent) {
                    return null;
                }
                return selections.getDocRanges().length > 0
                    ? { unitId: instances.getFocusedUnit()?.getUnitId() ?? context.unitId, subUnitId: context.unitId }
                    : null;
            },
        }));
    }
}
