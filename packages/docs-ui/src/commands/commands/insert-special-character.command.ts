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

import type { DocumentDataModel, ICommand } from '@univerjs/core';
import type { IInsertTextCommandParams } from '@univerjs/docs';
import { CommandType, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, InsertTextCommand } from '@univerjs/docs';
import { getCustomDecorationAtPosition, getCustomRangeAtPosition, getTextRunAtPosition } from '../../basics/paragraph';
import { DocMenuStyleService } from '../../services/doc-menu-style.service';

export const InsertSpecialCharacterCommand: ICommand<{
    value: string;
}> = {
    id: 'doc.command.insert-special-character',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params?.value) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const docMenuStyleService = accessor.get(DocMenuStyleService);
        const docDataModel = univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const activeRange = docSelectionManagerService.getActiveTextRange();

        if (!docDataModel || !activeRange) {
            return false;
        }

        const { segmentId } = activeRange;
        const originBody = docDataModel.getSelfOrHeaderFooterModel(segmentId)?.getBody();
        if (!originBody) {
            return false;
        }

        const { value } = params;
        const curTextRun = getTextRunAtPosition(
            originBody,
            activeRange.endOffset,
            docMenuStyleService.getDefaultStyle(),
            docMenuStyleService.getStyleCache()
        );
        const curCustomRange = getCustomRangeAtPosition(originBody.customRanges ?? [], activeRange.endOffset);
        const curCustomDecorations = getCustomDecorationAtPosition(originBody.customDecorations ?? [], activeRange.endOffset);

        return commandService.executeCommand<IInsertTextCommandParams>(InsertTextCommand.id, {
            unitId: docDataModel.getUnitId(),
            body: {
                dataStream: value,
                textRuns: [{
                    ...curTextRun,
                    st: 0,
                    ed: value.length,
                }],
                customRanges: curCustomRange
                    ? [{
                        ...curCustomRange,
                        startIndex: 0,
                        endIndex: value.length - 1,
                    }]
                    : [],
                customDecorations: curCustomDecorations.map((customDecoration) => ({
                    ...customDecoration,
                    startIndex: 0,
                    endIndex: value.length - 1,
                })),
            },
            range: activeRange,
            segmentId,
        });
    },
};
