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

import { MemoryCursor } from '../../../common/memory-cursor';
import { Tools } from '../../../shared';
import { UpdateDocsAttributeType } from '../../../shared/command-enum';
import type { IDocumentBody } from '../../../types/interfaces';
import { type TextXAction, TextXActionType } from './action-types';
import { updateAttributeByDelete } from './apply-utils/delete-apply';
import { updateAttributeByInsert } from './apply-utils/insert-apply';
import { updateAttribute } from './apply-utils/update-apply';

function updateApply(
    doc: IDocumentBody,
    updateBody: IDocumentBody,
    textLength: number,
    currentIndex: number,
    coverType = UpdateDocsAttributeType.COVER
): IDocumentBody {
    return updateAttribute(doc, updateBody, textLength, currentIndex, coverType);
}

function deleteApply(
    doc: IDocumentBody,
    textLength: number,
    currentIndex: number
): IDocumentBody {
    if (textLength <= 0) {
        return { dataStream: '' };
    }

    return updateAttributeByDelete(doc, textLength, currentIndex);
}

function insertApply(
    doc: IDocumentBody,
    insertBody: IDocumentBody,
    textLength: number,
    currentIndex: number
) {
    if (textLength === 0) {
        return;
    }

    updateAttributeByInsert(doc, insertBody, textLength, currentIndex);
}

export function textXApply(doc: IDocumentBody, actions: TextXAction[]): IDocumentBody {
    const memoryCursor = new MemoryCursor();

    memoryCursor.reset();

    actions.forEach((action) => {
        // FIXME: @JOCS Since updateApply modifies the action(used in undo/redo),
        // so make a deep copy here, does updateApply need to
        // be modified to have no side effects in the future?
        action = Tools.deepClone(action);

        switch (action.t) {
            case TextXActionType.RETAIN: {
                const { coverType, body, len } = action;
                if (body != null) {
                    updateApply(doc, body, len, memoryCursor.cursor, coverType);
                }

                memoryCursor.moveCursor(len);
                break;
            }

            case TextXActionType.INSERT: {
                const { body, len } = action;

                insertApply(doc, body!, len, memoryCursor.cursor);
                memoryCursor.moveCursor(len);
                break;
            }

            case TextXActionType.DELETE: {
                const { len } = action;
                deleteApply(doc, len, memoryCursor.cursor);
                break;
            }
            default:
                throw new Error(`Unknown action type for action: ${action}.`);
        }
    });

    return doc;
}
