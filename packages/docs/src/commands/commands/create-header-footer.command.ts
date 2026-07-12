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

import type { BooleanNumber, DocumentDataModel, ICommand, IDocumentBody, IHeaderAndFooterBase, IMutationInfo, JSONXActions } from '@univerjs/core';
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IRichTextEditingMutationParams } from '../mutations/core-editing.mutation';
import {
    CommandType,
    createParagraphId,
    createSectionId,
    DocumentFlavor,
    generateRandomId,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    UniverInstanceType,
} from '@univerjs/core';
import { RichTextEditingMutation } from '../mutations/core-editing.mutation';

export enum HeaderFooterType {
    FIRST_PAGE_HEADER,
    FIRST_PAGE_FOOTER,
    DEFAULT_HEADER,
    DEFAULT_FOOTER,
    EVEN_PAGE_HEADER,
    EVEN_PAGE_FOOTER,
}

export interface IHeaderFooterProps {
    /** Distance from the page edge to the header, in points (pt). */
    marginHeader?: number;
    /** Distance from the page edge to the footer, in points (pt). */
    marginFooter?: number;
    useFirstPageHeaderFooter?: BooleanNumber;
    evenAndOddHeaders?: BooleanNumber;
}

export type HeaderFooterCreateMode = 'single' | 'pair';

export interface ICreateHeaderFooterCommandParams {
    unitId: string;
    createType?: HeaderFooterType;
    segmentId?: string;
    headerFooterProps?: IHeaderFooterProps;
    createMode?: HeaderFooterCreateMode;
    /** Optional stable section id. Omit to configure the document-level default. */
    sectionId?: string;
}

export function getEmptyHeaderFooterBody(): IDocumentBody {
    return {
        dataStream: '\r\n',
        textRuns: [{
            st: 0,
            ed: 0,
            ts: {
                fs: 9,
            },
        }],
        customBlocks: [],
        paragraphs: [
            {
                startIndex: 0,
                paragraphId: createParagraphId(new Set()),
                paragraphStyle: {
                    spaceAbove: { v: 0 },
                    lineSpacing: 1.5,
                    spaceBelow: { v: 0 },
                },
            },
        ],
        sectionBreaks: [
            {
                sectionId: createSectionId(new Set()),
                startIndex: 1,
            },
        ],
    };
}

export function createHeaderFooterAction(
    segmentId: string | undefined,
    createType: HeaderFooterType,
    headerFooterConfig: IHeaderFooterProps,
    actions: JSONXActions,
    createMode: HeaderFooterCreateMode = 'single',
    configPath: Array<string | number> = ['documentStyle']
) {
    const jsonX = JSONX.getInstance();
    const ID_LEN = 6;
    const firstSegmentId = segmentId ?? generateRandomId(ID_LEN);
    const isHeader = createType === HeaderFooterType.DEFAULT_HEADER || createType === HeaderFooterType.FIRST_PAGE_HEADER || createType === HeaderFooterType.EVEN_PAGE_HEADER;
    const insertAction = jsonX.insertOp([isHeader ? 'headers' : 'footers', firstSegmentId], {
        [isHeader ? 'headerId' : 'footerId']: firstSegmentId,
        body: getEmptyHeaderFooterBody(),
    });

    actions!.push(insertAction!);

    let key = 'defaultHeaderId';
    let pairKey: string | undefined = 'defaultFooterId';

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

    const linkedSegmentIds: Array<[string, string]> = [[key, firstSegmentId]];

    if (createMode === 'pair' && pairKey != null) {
        const secondSegmentId = generateRandomId(ID_LEN);
        const insertPairAction = jsonX.insertOp([isHeader ? 'footers' : 'headers', secondSegmentId], {
            [isHeader ? 'footerId' : 'headerId']: secondSegmentId,
            body: getEmptyHeaderFooterBody(),
        });
        actions!.push(insertPairAction!);
        linkedSegmentIds.push([pairKey, secondSegmentId]);
    }

    for (const [k, id] of linkedSegmentIds) {
        if (headerFooterConfig[k as keyof IHeaderFooterProps] != null) {
            const replaceAction = jsonX.replaceOp([...configPath, k], headerFooterConfig[k as keyof IHeaderFooterProps], id);
            actions!.push(replaceAction!);
        } else {
            const insertAction = jsonX.insertOp([...configPath, k], id);
            actions!.push(insertAction!);
        }
    }

    return actions;
}

export const CreateHeaderFooterCommand: ICommand<ICreateHeaderFooterCommandParams> = {
    id: 'doc.command.create-header-footer',
    type: CommandType.COMMAND,
    handler: (accessor, params: ICreateHeaderFooterCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const { unitId, segmentId, createType, headerFooterProps, createMode = 'single', sectionId } = params;
        const docDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);

        if (docDataModel == null) {
            return false;
        }

        const { documentStyle, body } = docDataModel.getSnapshot();

        // The modern document flavor does not support header/footer, so we return false if the document is modern.
        if (documentStyle.documentFlavor === DocumentFlavor.MODERN) {
            return false;
        }

        const rawActions: JSONXActions = [];
        const jsonX = JSONX.getInstance();
        const sectionIndex = sectionId == null ? -1 : body?.sectionBreaks?.findIndex((section) => section.sectionId === sectionId) ?? -1;
        const sectionBreak = sectionIndex < 0 ? undefined : body?.sectionBreaks?.[sectionIndex];
        if (sectionId != null && !sectionBreak) {
            return false;
        }
        const headerFooterConfig: IHeaderFooterProps & IHeaderAndFooterBase = sectionBreak ?? documentStyle;
        const configPath: Array<string | number> = sectionId == null
            ? ['documentStyle']
            : ['body', 'sectionBreaks', sectionIndex];

        if (createType != null) {
            createHeaderFooterAction(segmentId, createType, headerFooterConfig, rawActions, createMode, configPath);
        }

        if (headerFooterProps != null) {
            Object.keys(headerFooterProps).forEach((key) => {
                const value = headerFooterProps[key as keyof IHeaderFooterProps];
                const oldValue = headerFooterConfig[key as keyof IHeaderFooterProps];
                if (value === oldValue) {
                    return;
                }

                const action = oldValue === undefined
                    ? jsonX.insertOp([...configPath, key], value)
                    : jsonX.replaceOp([...configPath, key], oldValue, value);

                rawActions.push(action!);
            });
        }

        if (rawActions.length === 0) {
            return false;
        }

        const textRanges: ITextRangeWithStyle[] = [{
            startOffset: 0,
            endOffset: 0,
            collapsed: true,
        }];
        const doMutation: IMutationInfo<IRichTextEditingMutationParams> = {
            id: RichTextEditingMutation.id,
            params: {
                unitId,
                actions: rawActions.reduce((acc, cur) => JSONX.compose(acc, cur as JSONXActions), null as JSONXActions),
                textRanges,
                debounce: true,
            },
        };

        if (headerFooterProps?.marginFooter != null || headerFooterProps?.marginHeader != null) {
            doMutation.params.noNeedSetTextRange = true;
        }

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        return Boolean(result);
    },
};
