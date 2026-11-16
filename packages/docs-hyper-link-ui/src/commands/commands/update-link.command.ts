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
import { BuildTextUtils, CommandType, CustomRangeType, getBodySlice, ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, replaceSelectionFactory } from '@univerjs/docs';
import { DocHyperLinkCommandId } from '@univerjs/docs-hyper-link';
import { getDocHyperLinkTargetProperties } from '../../utils/hyper-link-target';

export interface IUpdateDocHyperLinkCommandParams {
    unitId: string;
    linkId: string;
    payload: string;
    label: string;
    segmentId: string;
}

export const UpdateDocHyperLinkCommand: ICommand<IUpdateDocHyperLinkCommandParams> = {
    id: DocHyperLinkCommandId.Update,
    type: CommandType.COMMAND,
    handler(accessor, params) {
        if (!params) {
            return false;
        }
        const { unitId, payload, segmentId, linkId } = params;
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const docSelectionManagerService = accessor.get(DocSelectionManagerService);
        const currentSelection = docSelectionManagerService.getActiveTextRange();
        const doc = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
        if (!currentSelection || !doc) {
            return false;
        }

        const oldBody = doc.getSelfOrHeaderFooterModel(segmentId)?.getBody();
        if (!oldBody) {
            return false;
        }

        const oldLink = oldBody.customRanges?.find((range) => range.rangeId === linkId && range.rangeType === CustomRangeType.HYPERLINK);

        const original = getBodySlice(oldBody, currentSelection.startOffset!, currentSelection.endOffset!);
        const unchangedLabel = params.label === BuildTextUtils.transform.getPlainText(original.dataStream).replace(/[\u001F\u001E]/g, '');
        const textRun = original.textRuns?.[0];
        if (textRun && !unchangedLabel) {
            textRun.ed = params.label.length + 1;
        }

        const replaceSelection = replaceSelectionFactory(accessor, {
            unitId,
            body: {
                ...(unchangedLabel ? original : { dataStream: params.label, textRuns: textRun ? [textRun] : undefined }),
                customRanges: [...(unchangedLabel ? original.customRanges?.filter((range) => range.rangeId !== linkId) ?? [] : []), {
                    rangeId: linkId,
                    rangeType: CustomRangeType.HYPERLINK,
                    startIndex: 0,
                    endIndex: (unchangedLabel ? original.dataStream.length : params.label.length) - 1,
                    properties: {
                        ...getDocHyperLinkTargetProperties(payload, doc.getBody(), oldLink?.properties),
                        ...(oldLink?.properties?.textStyleMode ? { textStyleMode: oldLink.properties.textStyleMode } : null),
                        ...(oldLink?.properties?.textColorMode ? { textColorMode: oldLink.properties.textColorMode } : null),
                    },
                }],
            },
            selection: {
                startOffset: currentSelection.startOffset!,
                endOffset: currentSelection.endOffset!,
                collapsed: false,
                segmentId,
            },
        });

        if (!replaceSelection) {
            return false;
        }

        return commandService.syncExecuteCommand(replaceSelection.id, replaceSelection.params);
    },
};
