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

import type { IDocumentBody, IDocumentData } from '../../types/interfaces/i-document-data';
import { DocumentDataModel } from './document-data-model';
import { JSONX } from './json-x/json-x';
import { TextX } from './text-x/text-x';

// TODO: this function should be replaced by replaceSelection
export function replaceInDocumentBody(body: IDocumentBody, query: string, target: string, caseSensitive: boolean): IDocumentBody {
    if (query === '') {
        return body;
    }

    const mockDocumentData: IDocumentData = {
        id: 'mock-id',
        body,
        documentStyle: {},
    };

    const documentDataModel = new DocumentDataModel(mockDocumentData);

    const queryLen = query.length;
    let index;

    // eslint-disable-next-line no-cond-assign
    while ((index = (caseSensitive ? documentDataModel.getBody()!.dataStream : documentDataModel.getBody()!.dataStream.toLowerCase()).indexOf(query)) >= 0) {
        const textX = new TextX();
        const jsonX = JSONX.getInstance();

        if (index > 0) {
            textX.retain(index);
        }

        if (target.length > 0) {
            const sliceBody = documentDataModel.sliceBody(index, index + queryLen);
            const replaceBody: IDocumentBody = {
                dataStream: target,
            };

            if (Array.isArray(sliceBody?.textRuns) && sliceBody.textRuns.length) {
                replaceBody.textRuns = [{
                    ...sliceBody.textRuns[0],
                    st: 0,
                    ed: target.length,
                }];
            }

            if (sliceBody?.customRanges?.length) {
                const customRange = sliceBody.customRanges[0];
                replaceBody.customRanges = [{
                    ...customRange,
                    startIndex: 0,
                    endIndex: target.length - 1,
                }];
            }

            textX.insert(target.length, replaceBody);
        }

        textX.delete(queryLen);
        documentDataModel.apply(jsonX.editOp(textX.serialize()));
    }

    const newBody = documentDataModel.getBody()!;

    documentDataModel.dispose();

    return newBody;
}
