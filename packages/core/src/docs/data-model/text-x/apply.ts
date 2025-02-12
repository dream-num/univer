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

import type { IDocumentBody } from '../../../types/interfaces';
import { MemoryCursor } from '../../../common/memory-cursor';
import { Tools } from '../../../shared';
import { UpdateDocsAttributeType } from '../../../shared/command-enum';
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
    // No need to insert empty text.
    if (textLength === 0) {
        return;
    }

    updateAttributeByInsert(doc, insertBody, textLength, currentIndex);
}

export function textXApply(doc: IDocumentBody, actions: TextXAction[]): IDocumentBody {
    const memoryCursor = new MemoryCursor();

    memoryCursor.reset();

    actions.forEach((action) => {
        // Since updateApply modifies the action(used in undo/redo),
        // so make a deep copy here.
        const clonedAction = Tools.deepClone(action);

        switch (clonedAction.t) {
            case TextXActionType.RETAIN: {
                const { coverType, body, len } = clonedAction;
                if (body != null) {
                    updateApply(doc, body, len, memoryCursor.cursor, coverType);
                }

                memoryCursor.moveCursor(len);
                break;
            }

            case TextXActionType.INSERT: {
                const { body, len } = clonedAction;

                insertApply(doc, body!, len, memoryCursor.cursor);
                memoryCursor.moveCursor(len);
                break;
            }

            case TextXActionType.DELETE: {
                const { len } = clonedAction;
                deleteApply(doc, len, memoryCursor.cursor);
                break;
            }
            default:
                throw new Error(`Unknown action type for action: ${clonedAction}.`);
        }
    });

    return doc;
}
