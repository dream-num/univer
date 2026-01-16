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

import { DocumentDataModel, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, IAccessor, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IEditorService } from '@univerjs/docs-ui';

export function getFontStyleAtCursor(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const textSelectionService = accessor.get(DocSelectionManagerService);
    const editorService = accessor.get(IEditorService);

    const editorUnitId = editorService.getFocusId() ?? DOCS_NORMAL_EDITOR_UNIT_ID_KEY;
    const editorDataModel = univerInstanceService.getUnit<DocumentDataModel>(editorUnitId, UniverInstanceType.UNIVER_DOC);
    const activeTextRange = textSelectionService.getActiveTextRange();

    if (editorDataModel == null || activeTextRange == null) return null;

    const textRuns = editorDataModel.getBody()?.textRuns;

    if (textRuns == null) return;

    const { startOffset, endOffset } = activeTextRange;
    const textRun = textRuns.find(({ st, ed }) => startOffset >= st && endOffset <= ed);

    return textRun;
}
