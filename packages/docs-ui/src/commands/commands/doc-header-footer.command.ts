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

import type { ICommand, IMutationInfo, JSONXActions } from '@univerjs/core';
import { BooleanNumber, CommandType, ICommandService, IUniverInstanceService, JSONX, Tools } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { DocumentEditArea, IRenderManagerService, type ITextRangeWithStyle } from '@univerjs/engine-render';
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

function createHeaderFooterAction(segmentId: string, createType: HeaderFooterType, documentStyle: IHeaderFooterProps, actions: JSONXActions) {
    const jsonX = JSONX.getInstance();
    const ID_LEN = 6;
    const firstSegmentId = segmentId ?? Tools.generateRandomId(ID_LEN);
    const isHeader = createType === HeaderFooterType.DEFAULT_HEADER || createType === HeaderFooterType.FIRST_PAGE_HEADER || createType === HeaderFooterType.EVEN_PAGE_HEADER;
    const insertAction = jsonX.insertOp([isHeader ? 'headers' : 'footers', firstSegmentId], {
        [isHeader ? 'headerId' : 'footerId']: firstSegmentId,
        body: getEmptyHeaderFooterBody(),
    });

    actions!.push(insertAction!);

    // Also need to create an empty footer if you create a header, and vice versa. They  are always created in pairs.
    const secondSegmentId = Tools.generateRandomId(ID_LEN);
    const insertPairAction = jsonX.insertOp([isHeader ? 'footers' : 'headers', secondSegmentId], {
        [isHeader ? 'footers' : 'headers']: secondSegmentId,
        body: getEmptyHeaderFooterBody(),
    });
    actions!.push(insertPairAction!);

    let key = 'defaultHeaderId';
    let pairKey = 'defaultFooterId';

    switch (createType) {
        case HeaderFooterType.DEFAULT_HEADER:
            key = 'defaultHeaderId';
            pairKey = 'defaultFooterId';
            break;
        case HeaderFooterType.DEFAULT_FOOTER:
            key = 'defaultFooterId';
            pairKey = 'defaultHeaderId';
            break;
        case HeaderFooterType.FIRST_PAGE_HEADER:
            key = 'firstPageHeaderId';
            pairKey = 'firstPageFooterId';
            break;
        case HeaderFooterType.FIRST_PAGE_FOOTER:
            key = 'firstPageFooterId';
            pairKey = 'firstPageHeaderId';
            break;
        case HeaderFooterType.EVEN_PAGE_HEADER:
            key = 'evenPageHeaderId';
            pairKey = 'evenPageFooterId';
            break;
        case HeaderFooterType.EVEN_PAGE_FOOTER:
            key = 'evenPageFooterId';
            pairKey = 'evenPageHeaderId';
            break;
        default:
            throw new Error(`Unknown header footer type: ${createType}`);
    }

    for (const [k, id] of [[key, firstSegmentId], [pairKey, secondSegmentId]]) {
        if (documentStyle[k as keyof IHeaderFooterProps] != null) {
            const replaceAction = jsonX.replaceOp(['documentStyle', k], documentStyle[k as keyof IHeaderFooterProps], id);
            actions!.push(replaceAction!);
        } else {
            const insertAction = jsonX.insertOp(['documentStyle', k], id);
            actions!.push(insertAction!);
        }
    }

    return actions;
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
        const renderManagerService = accessor.get(IRenderManagerService);
        const { unitId, segmentId, createType, headerFooterProps } = params;
        const docSkeletonManagerService = renderManagerService.getRenderById(unitId)?.with(DocSkeletonManagerService);
        const docDataModel = univerInstanceService.getUniverDocInstance(unitId);
        const docViewModel = docSkeletonManagerService?.getViewModel();

        if (docDataModel == null || docViewModel == null) {
            return false;
        }

        const editArea = docViewModel.getEditArea();

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
            createHeaderFooterAction(segmentId!, createType, documentStyle, rawActions);
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

                // need create first page header/footer if useFirstPageHeaderFooter is true and firstPageHeaderId is not set.
                if (key === 'useFirstPageHeaderFooter' && value === BooleanNumber.TRUE && !documentStyle.firstPageHeaderId) {
                    const headerFooterType = editArea === DocumentEditArea.HEADER ? HeaderFooterType.FIRST_PAGE_HEADER : HeaderFooterType.FIRST_PAGE_FOOTER;
                    createHeaderFooterAction(segmentId!, headerFooterType, documentStyle, rawActions);
                } else if (key === 'evenAndOddHeaders' && value === BooleanNumber.TRUE && !documentStyle.evenPageHeaderId) {
                    const headerFooterType = editArea === DocumentEditArea.HEADER ? HeaderFooterType.EVEN_PAGE_HEADER : HeaderFooterType.EVEN_PAGE_FOOTER;
                    createHeaderFooterAction(segmentId!, headerFooterType, documentStyle, rawActions);
                }
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
