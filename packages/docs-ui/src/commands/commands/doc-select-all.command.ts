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
import type { ISuccinctDocRangeParam } from '@univerjs/engine-render';
import { CommandType, DOC_RANGE_TYPE, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';

interface ISelectAllCommandParams { }

export const DocSelectAllCommand: ICommand<ISelectAllCommandParams> = {
    id: 'doc.command.select-all',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const docDataModel = univerInstanceService.getCurrentUnitForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const docRanges = docSelectionManagerService.getDocRanges();
        const activeRange = docRanges.find((range) => range.isActive) ?? docRanges[0];
        if (docDataModel == null || activeRange == null) {
            return false;
        }

        const { segmentId } = activeRange;
        const unitId = docDataModel.getUnitId();
        const body = docDataModel.getSelfOrHeaderFooterModel(segmentId).getSnapshot().body;
        if (body == null) {
            return false;
        }

        const { tables = [], dataStream } = body;
        if (dataStream === '\r\n') {
            return true;
        }
        const textRanges: ISuccinctDocRangeParam[] = [];
        let offset = 0;

        for (const table of tables) {
            const { startIndex, endIndex } = table;
            if (offset !== startIndex) {
                textRanges.push({
                    startOffset: offset,
                    endOffset: startIndex - 1,
                    rangeType: DOC_RANGE_TYPE.TEXT,
                });
            }

            // Push the rect range.
            textRanges.push({
                startOffset: startIndex + 3, // 3 is TABLE_START, ROW_START, CELL_START.
                endOffset: endIndex - 5, // 4 is CELL_END, ROW_END, TABLE_END AND \n.
                rangeType: DOC_RANGE_TYPE.RECT,
            });

            offset = endIndex;
        }

        if (offset !== body.dataStream.length - 2) {
            textRanges.push({
                startOffset: offset,
                endOffset: body.dataStream.length - 2,
                rangeType: DOC_RANGE_TYPE.TEXT,
            });
        }

        docSelectionManagerService.replaceDocRanges(textRanges, {
            unitId,
            subUnitId: unitId,
        }, false);

        return true;
    },
};
