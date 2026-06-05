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

import type { Nullable } from '@univerjs/core';
import type { IDocStateChangeInfo, IDocStateChangeInterceptorService } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DocIMEInputManagerService } from './doc-ime-input-manager.service';

export class DocIMEStateChangeInterceptorService implements IDocStateChangeInterceptorService {
    constructor(
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {}

    transformChangeStateInfo(changeStateInfo: IDocStateChangeInfo): Nullable<IDocStateChangeInfo> {
        const { isCompositionEnd, isSync, syncer } = changeStateInfo;

        if (!isCompositionEnd) {
            return changeStateInfo;
        }

        const imeInputManagerService = this._renderManagerService.getRenderUnitById(isSync ? syncer! : changeStateInfo.unitId)?.with(DocIMEInputManagerService);

        if (imeInputManagerService == null) {
            return null;
        }

        const historyParams = imeInputManagerService.fetchComposedUndoRedoMutationParams();

        if (historyParams == null) {
            throw new Error('historyParams is null in RichTextEditingMutation');
        }

        const { undoMutationParams, redoMutationParams, previousActiveRange } = historyParams;

        return {
            ...changeStateInfo,
            redoState: {
                ...changeStateInfo.redoState,
                actions: redoMutationParams.actions,
            },
            undoState: {
                ...changeStateInfo.undoState,
                actions: undoMutationParams.actions,
                textRanges: [previousActiveRange],
            },
        };
    }
}
