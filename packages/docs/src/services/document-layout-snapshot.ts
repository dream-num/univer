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

import type { ICustomBlock, IDocumentBody, IDocumentData, IFooterData, IHeaderData } from '@univerjs/core';

function projectCustomBlock(block: ICustomBlock): ICustomBlock {
    const {
        docxRawXml: _docxRawXml,
        docxExportTs: _docxExportTs,
        ...layoutBlock
    } = block;
    return layoutBlock;
}

function projectDocumentBody(body: IDocumentBody): IDocumentBody {
    const {
        docxRawCustomBlocks: _docxRawCustomBlocks,
        docxRawBlocks: _docxRawBlocks,
        docxExportExcludedRanges: _docxExportExcludedRanges,
        payloads: _payloads,
        customBlocks,
        ...layoutBody
    } = body;
    return {
        ...layoutBody,
        ...(customBlocks == null ? {} : { customBlocks: customBlocks.map(projectCustomBlock) }),
    };
}

function projectHeader(header: IHeaderData): IHeaderData {
    return {
        ...header,
        body: projectDocumentBody(header.body),
    };
}

function projectFooter(footer: IFooterData): IFooterData {
    return {
        ...footer,
        body: projectDocumentBody(footer.body),
    };
}

/**
 * Builds the model snapshot owned by the layout Worker. Exchange-only payloads
 * remain in the authoritative Main model and are deliberately excluded from
 * the structured-clone boundary because they do not affect document geometry.
 */
export function createDocumentLayoutSnapshot(snapshot: IDocumentData): IDocumentData {
    const { resources: _resources, body, headers, footers, ...layoutSnapshot } = snapshot;
    return {
        ...layoutSnapshot,
        ...(body == null ? {} : { body: projectDocumentBody(body) }),
        ...(headers == null
            ? {}
            : {
                headers: Object.fromEntries(
                    Object.entries(headers).map(([headerId, header]) => [headerId, projectHeader(header)])
                ),
            }),
        ...(footers == null
            ? {}
            : {
                footers: Object.fromEntries(
                    Object.entries(footers).map(([footerId, footer]) => [footerId, projectFooter(footer)])
                ),
            }),
    };
}
