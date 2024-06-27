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

import type { BooleanNumber, ICommand, IMutationInfo, JSONXActions } from '@univerjs/core';
import { CommandType, ICommandService, IUniverInstanceService, JSONX, Tools } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { RichTextEditingMutation } from '@univerjs/docs';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import { HeaderFooterType } from '../../controllers/doc-header-footer.controller';

function getEmptyHeaderFooterBody() {
    return {
        dataStream: '\r\n',
        textRuns: [],
        paragraphs: [
            {
                startIndex: 0,
                spaceAbove: 0,
                lineSpacing: 1.5,
                spaceBelow: 0,
            },
        ],
        sectionBreaks: [
            {
                startIndex: 1,
            },
        ],
    };
}

interface IHeaderFooterProps {
    marginHeader?: number; // marginHeader
    marginFooter?: number; // marginFooter
    useFirstPageHeaderFooter?: BooleanNumber; // useFirstPageHeaderFooter
    evenAndOddHeaders?: BooleanNumber; // useEvenPageHeaderFooter,
}

export interface ICoreHeaderFooterParams {
    unitId: string;
    createType?: HeaderFooterType;
    segmentId?: string;
    headerFooterProps?: IHeaderFooterProps;
}

export const CoreHeaderFooterCommandId = 'doc.command.core-header-footer';

/**
 * The command to update header and footer or create them.
 */
export const CoreHeaderFooterCommand: ICommand<ICoreHeaderFooterParams> = {
    id: CoreHeaderFooterCommandId,
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor, params: ICoreHeaderFooterParams) => {
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const { unitId, segmentId, createType, headerFooterProps } = params;
        const docDataModel = univerInstanceService.getUniverDocInstance(unitId);

        if (docDataModel == null) {
            return false;
        }

        const { documentStyle } = docDataModel.getSnapshot();

        const textRanges: ITextRangeWithStyle[] = [
            {
                startOffset: 0,
                endOffset: 0,
                collapsed: true,
            },
        ];

        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: [],
                textRanges,
                debounce: true,
            },
        };

        const jsonX = JSONX.getInstance();
        const rawActions: JSONXActions = [];

        if (createType != null) {
            const ID_LEN = 6;
            const headerFooterId = segmentId ?? Tools.generateRandomId(ID_LEN);
            const isHeader = createType === HeaderFooterType.DEFAULT_HEADER || createType === HeaderFooterType.FIRST_PAGE_HEADER || createType === HeaderFooterType.EVEN_PAGE_HEADER;
            const insertAction = jsonX.insertOp([isHeader ? 'headers' : 'footers', headerFooterId], {
                [isHeader ? 'headerId' : 'footerId']: headerFooterId,
                body: getEmptyHeaderFooterBody(),
            });

            rawActions.push(insertAction!);

            let key = 'defaultHeaderId';

            switch (createType) {
                case HeaderFooterType.DEFAULT_HEADER:
                    key = 'defaultHeaderId';
                    break;
                case HeaderFooterType.DEFAULT_FOOTER:
                    key = 'defaultFooterId';
                    break;
                case HeaderFooterType.FIRST_PAGE_HEADER:
                    key = 'firstPageHeaderId';
                    break;
                case HeaderFooterType.FIRST_PAGE_FOOTER:
                    key = 'firstPageFooterId';
                    break;
                case HeaderFooterType.EVEN_PAGE_HEADER:
                    key = 'evenPageHeaderId';
                    break;
                case HeaderFooterType.EVEN_PAGE_FOOTER:
                    key = 'evenPageFooterId';
                    break;
                default:
                    throw new Error(`Unknown header footer type: ${createType}`);
            }

            if (documentStyle[key as keyof IHeaderFooterProps] != null) {
                const replaceAction = jsonX.replaceOp(['documentStyle', key], documentStyle[key as keyof IHeaderFooterProps], headerFooterId);
                rawActions.push(replaceAction!);
            } else {
                const insertAction = jsonX.insertOp(['documentStyle', key], headerFooterId);
                rawActions.push(insertAction!);
            }
        }

        if (headerFooterProps != null) {
            Object.keys(headerFooterProps).forEach((key) => {
                const value = headerFooterProps[key as keyof IHeaderFooterProps];
                const oldValue = documentStyle[key as keyof IHeaderFooterProps];
                let action;
                if (oldValue === undefined) {
                    action = jsonX.insertOp(['documentStyle', key], value);
                } else {
                    action = jsonX.replaceOp(['documentStyle', key], oldValue, value);
                }

                rawActions.push(action!);

                // TODO: Create a new header footer if the header footer is not created.
            });
        }

        if (rawActions.length === 0) {
            return false;
        }

        doMutation.params.actions = rawActions.reduce((acc, cur) => {
            return JSONX.compose(acc, cur as JSONXActions);
        }, null as JSONXActions);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};
