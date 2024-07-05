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
import { UpdateDocsAttributeType } from '../../../shared/command-enum';
import type { IDocumentBody } from '../../../types/interfaces/i-document-data';
import { type IDeleteAction, type IInsertAction, type IRetainAction, type TextXAction, TextXActionType } from './action-types';
import { ActionIterator } from './action-iterator';
import { composeBody, getBodySlice, isUselessRetainAction } from './utils';
import { textXApply } from './apply';

function onlyHasDataStream(body: IDocumentBody) {
    return Object.keys(body).length === 1;
}

export type TPriority = 'left' | 'right';

export class TextX {
    // static name = 'text-x';

    static id = 'text-x';

    static uri = 'https://github.com/dream-num/univer#text-x';

    static apply(doc: IDocumentBody, actions: TextXAction[]): IDocumentBody {
        return textXApply(doc, actions);
    }

    static compose(thisActions: TextXAction[], otherActions: TextXAction[]): TextXAction[] {
        const thisIter = new ActionIterator(thisActions);
        const otherIter = new ActionIterator(otherActions);

        const textX = new TextX();

        while (thisIter.hasNext() || otherIter.hasNext()) {
            if (otherIter.peekType() === TextXActionType.INSERT) {
                textX.push(otherIter.next());
            } else if (thisIter.peekType() === TextXActionType.DELETE) {
                textX.push(thisIter.next());
            } else {
                const length = Math.min(thisIter.peekLength(), otherIter.peekLength());
                const thisAction = thisIter.next(length);
                const otherAction = otherIter.next(length);

                if (thisAction.t === TextXActionType.INSERT && otherAction.t === TextXActionType.RETAIN) {
                    if (otherAction.body == null) {
                        textX.push(thisAction);
                    } else {
                        textX.push({
                            ...thisAction,
                            body: composeBody(thisAction.body, otherAction.body, otherAction.coverType),
                        });
                    }
                } else if (thisAction.t === TextXActionType.RETAIN && otherAction.t === TextXActionType.RETAIN) {
                    if (thisAction.body == null && otherAction.body == null) {
                        textX.push(thisAction.len !== Number.POSITIVE_INFINITY ? thisAction : otherAction); // or otherAction
                    } else if (thisAction.body && otherAction.body) {
                        textX.push({
                            ...thisAction,
                            body: composeBody(thisAction.body, otherAction.body, otherAction.coverType),
                        });
                    } else {
                        textX.push(thisAction.body ? thisAction : otherAction);
                    }
                } else if (thisAction.t === TextXActionType.RETAIN && otherAction.t === TextXActionType.DELETE) {
                    textX.push(otherAction);
                } else if (thisAction.t === TextXActionType.INSERT && otherAction.t === TextXActionType.DELETE) {
                    // Nothing need to do, they are just cancel off.
                }
                // else {
                //     // I think exec will never go here.
                //     throw new Error('unknown compose case');
                // }
            }
        }

        textX.trimEndUselessRetainAction();

        return textX.serialize();
    }

    // `transform` is implemented in univer-pro in class TextXPro. do not use this method in TextX.
    static transform(_thisActions: TextXAction[], _otherActions: TextXAction[], _priority: TPriority): TextXAction[] {
        throw new Error('transform is not implemented in TextX');
    }

    static isNoop(actions: TextXAction[]) {
        return actions.length === 0;
    }

    static invert(actions: TextXAction[]): TextXAction[] {
        const invertedActions: TextXAction[] = [];

        for (const action of actions) {
            if (action.t === TextXActionType.INSERT) {
                invertedActions.push({
                    t: TextXActionType.DELETE,
                    len: action.len,
                    line: 0, // hardcode
                    body: action.body,
                    segmentId: action.segmentId,
                });
            } else if (action.t === TextXActionType.DELETE) {
                if (action.body == null) {
                    throw new Error('Can not invert DELETE action without body property, makeInvertible must be called first.');
                }

                invertedActions.push({
                    t: TextXActionType.INSERT,
                    body: action.body,
                    len: action.len,
                    line: 0, // hardcode
                    segmentId: action.segmentId,
                });
            } else {
                if (action.body != null) {
                    if (action.oldBody == null) {
                        throw new Error('Can not invert RETAIN action without oldBody property, makeInvertible must be called first.');
                    }

                    invertedActions.push({
                        t: TextXActionType.RETAIN,
                        body: action.oldBody,
                        oldBody: action.body,
                        len: action.len,
                        coverType: UpdateDocsAttributeType.REPLACE,
                        segmentId: action.segmentId,
                    });
                } else {
                    invertedActions.push(action);
                }
            }
        }

        return invertedActions;
    }

    static makeInvertible(actions: TextXAction[], doc: IDocumentBody): TextXAction[] {
        const invertibleActions: TextXAction[] = [];

        let index = 0;

        for (const action of actions) {
            if (action.t === TextXActionType.DELETE && action.body == null) {
                const body = getBodySlice(doc, index, index + action.len, false);
                action.len = body.dataStream.length;
                action.body = body;
            }

            if (action.t === TextXActionType.RETAIN && action.body != null) {
                const body = getBodySlice(doc, index, index + action.len, true);

                action.oldBody = {
                    ...body,
                    dataStream: '',
                };
                action.len = body.dataStream.length;
            }

            invertibleActions.push(action);

            if (action.t !== TextXActionType.INSERT) {
                index += action.len;
            }
        }

        return invertibleActions;
    }

    private _actions: TextXAction[] = [];

    insert(len: number, body: IDocumentBody, segmentId = ''): this {
        const insertAction: IInsertAction = {
            t: TextXActionType.INSERT,
            body,
            len,
            line: 0, // hardcode
            segmentId,
        };

        this.push(insertAction);
        return this;
    }

    retain(len: number, segmentId = '', body?: IDocumentBody, coverType?: UpdateDocsAttributeType): this {
        const retainAction: IRetainAction = {
            t: TextXActionType.RETAIN,
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

    delete(len: number, segmentId = ''): this {
        const deleteAction: IDeleteAction = {
            t: TextXActionType.DELETE,
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

    // eslint-disable-next-line complexity
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

        // Nothing need to do, if the retain 0 and body is null.
        if (newAction.t === TextXActionType.RETAIN && newAction.len === 0 && newAction.body == null) {
            return this;
        }

        if (typeof lastAction === 'object') {
            // if lastAction and newAction are both delete action, merge the two actions and return this.
            if (lastAction.t === TextXActionType.DELETE && newAction.t === TextXActionType.DELETE) {
                lastAction.len += newAction.len;

                return this;
            }

            // Since it does not matter if we insert before or after deleting at the same index,
            // always prefer to insert first
            if (lastAction.t === TextXActionType.DELETE && newAction.t === TextXActionType.INSERT) {
                index -= 1;
                lastAction = this._actions[index - 1];

                if (lastAction == null) {
                    this._actions.unshift(newAction);

                    return this;
                }
            }

            // if lastAction and newAction are both retain action and has no body, merge the two actions and return this.
            if (lastAction.t === TextXActionType.RETAIN && newAction.t === TextXActionType.RETAIN && lastAction.body == null && newAction.body == null) {
                lastAction.len += newAction.len;

                return this;
            }

            // Both are insert action, and has no styles, merge it.
            if (lastAction.t === TextXActionType.INSERT && onlyHasDataStream(lastAction.body) && newAction.t === TextXActionType.INSERT && onlyHasDataStream(newAction.body)) {
                lastAction.len += newAction.len;
                lastAction.body.dataStream += newAction.body.dataStream;

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

    protected trimEndUselessRetainAction(): this {
        let lastAction = this._actions[this._actions.length - 1];

        while (lastAction && lastAction.t === TextXActionType.RETAIN && isUselessRetainAction(lastAction)) {
            this._actions.pop();

            lastAction = this._actions[this._actions.length - 1];
        }

        return this;
    }
}

// FIXME: @Jocs, Use to avoid storybook error. and move the static name property to here.
Object.defineProperty(TextX, 'name', {
    value: 'text-x',
});
