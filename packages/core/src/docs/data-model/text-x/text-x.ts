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

import { Tools } from '../../../shared/tools';
import type { UpdateDocsAttributeType } from '../../../shared/command-enum';
import type { IDocumentBody } from '../../../types/interfaces/i-document-data';
import type { IDeleteAction, IInsertAction, IRetainAction, TextXAction } from '../mutation-types';

export class TextX {
    // eslint-disable-next-line unused-imports/no-unused-vars
    static compose(thisActions: TextXAction[], otherActions: TextXAction[]): TextXAction[] {
        // TODO: @jocs Implement this.
        return [];
    }

    private _actions: TextXAction[] = [];

    insert(len: number, body: IDocumentBody, segmentId: string): this {
        const insertAction: IInsertAction = {
            t: 'i',
            body,
            len,
            line: 0, // hardcode
            segmentId,
        };

        this.push(insertAction);

        return this;
    }

    retain(len: number, segmentId: string, body?: IDocumentBody, coverType?: UpdateDocsAttributeType): this {
        const retainAction: IRetainAction = {
            t: 'r',
            len,
            segmentId,
        };

        if (body != null) {
            retainAction.body = body;
        }

        if (coverType != null) {
            retainAction.coverType = coverType;
        }

        this.push(retainAction);

        return this;
    }

    delete(len: number, segmentId: string): this {
        const deleteAction: IDeleteAction = {
            t: 'd',
            len,
            line: 0, // hardcode
            segmentId,
        };

        this.push(deleteAction);

        return this;
    }

    serialize(): TextXAction[] {
        return this._actions;
    }

    push(...args: TextXAction[]): this {
        if (args.length > 1) {
            for (const ac of args) {
                this.push(ac);
            }

            return this;
        }

        let index = this._actions.length;
        let lastAction = this._actions[index - 1];

        const newAction = Tools.deepClone(args[0]);

        if (typeof lastAction === 'object') {
            // if lastAction and newAction are both delete action, merge the two actions and return this.
            if (lastAction.t === 'd' && newAction.t === 'd') {
                lastAction.len += newAction.len;

                return this;
            }

            // Since it does not matter if we insert before or after deleting at the same index,
            // always prefer to insert first
            if (lastAction.t === 'd' && newAction.t === 'i') {
                index -= 1;
                lastAction = this._actions[index - 1];

                if (lastAction == null) {
                    this._actions.unshift(newAction);

                    return this;
                }
            }

            // if lastAction and newAction are both retain action and has no body, merge the two actions and return this.
            if (lastAction.t === 'r' && newAction.t === 'r' && lastAction.body == null && newAction.body == null) {
                lastAction.len += newAction.len;

                return this;
            }
        }

        if (index === this._actions.length) {
            this._actions.push(newAction);
        } else {
            this._actions.splice(index, 0, newAction);
        }

        return this;
    }
}
