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

import type { ITextRange } from '../../../sheets/typedef';
import type { IDocumentBody } from '../../../types/interfaces/i-document-data';
import { UpdateDocsAttributeType } from '../../../shared/command-enum';
import { Tools } from '../../../shared/tools';
import { ActionIterator } from './action-iterator';
import { type IDeleteAction, type IInsertAction, type IRetainAction, type TextXAction, TextXActionType } from './action-types';
import { textXApply } from './apply';
import { transformBody } from './transform-utils';
import { composeBody, getBodySlice, isUselessRetainAction } from './utils';

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

    // eslint-disable-next-line complexity
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
                        const coverType = thisAction.coverType === UpdateDocsAttributeType.REPLACE || otherAction.coverType === UpdateDocsAttributeType.REPLACE
                            ? UpdateDocsAttributeType.REPLACE
                            : UpdateDocsAttributeType.COVER;

                        textX.push({
                            ...thisAction,
                            t: TextXActionType.RETAIN,
                            coverType,
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

    /**
     * |(this↓ \| other→) | **insert** | **retain** | **delete** |
     * | ---------------- | ---------- | ---------- | ---------- |
     * |    **insert**    |   Case 1   |   Case 2   |   Case 2   |
     * |    **retain**    |   Case 1   |   Case 5   |   Case 4   |
     * |    **delete**    |   Case 1   |   Case 3   |   Case 3   |
     *
     * Case 1: When the other action type is an insert operation,
     *         the insert operation is retained regardless of the type of action this action
     * Case 2: When this action type is an insert operation and the other action type is a
     *         non-insert operation, you need to retain the length of this action insert
     * Case 3: When this action is a delete operation, there are two scenarios:
     *      1) When other is a delete operation, since it is a delete operation, this has
     *         already been deleted, so the target does not need to be in delete, and it can
     *         be continued directly
     *      2) When other is the retain operation, although this action delete occurs first,
     *         the delete priority is higher, so the delete operation is retained, and the origin
     *         delete has been applied, so it is directly continued
     * Case 4: other is the delete operation, this is the retain operation, and the target delete operation
     *         is kept
     * Case 5: When both other and this are retain operations
     *      1) If the other body attribute does not exist, directly retain length
     *      2) If the other body property exists, then execute the TransformBody logic to override it
     */
    // priority - if true, this actions takes priority over other, that is, this actions are considered to happen "first".
    // thisActions is the target action.
    static transform(thisActions: TextXAction[], otherActions: TextXAction[], priority: TPriority = 'right'): TextXAction[] {
        return this._transform(otherActions, thisActions, priority === 'left' ? 'right' : 'left');
    }

    // otherActions is the actions to be transformed.
    static _transform(thisActions: TextXAction[], otherActions: TextXAction[], priority: TPriority = 'right'): TextXAction[] {
        const thisIter = new ActionIterator(thisActions);

        const otherIter = new ActionIterator(otherActions);

        const textX = new TextX();

        while (thisIter.hasNext() || otherIter.hasNext()) {
            if (
                thisIter.peekType() === TextXActionType.INSERT &&
                (priority === 'left' || otherIter.peekType() !== TextXActionType.INSERT)
            ) {
                const thisAction = thisIter.next();
                textX.retain(thisAction.len);
            } else if (otherIter.peekType() === TextXActionType.INSERT) {
                textX.push(otherIter.next());
            } else {
                const length = Math.min(thisIter.peekLength(), otherIter.peekLength());
                const thisAction = thisIter.next(length);
                const otherAction = otherIter.next(length);

                // handle this-delete case.
                if (thisAction.t === TextXActionType.DELETE) {
                    continue;
                }

                // handle other-delete case.
                if (otherAction.t === TextXActionType.DELETE) {
                    textX.push(otherAction);
                    continue;
                }

                // handle this-retain + other-retain case.
                if (thisAction.body == null || otherAction.body == null) {
                    textX.push(otherAction);
                } else {
                    const { coverType, body } = transformBody(thisAction as IRetainAction, otherAction as IRetainAction, priority === 'left');
                    textX.push({
                        ...otherAction,
                        t: TextXActionType.RETAIN,
                        coverType,
                        body,
                    });
                }
            }
        }

        textX.trimEndUselessRetainAction();

        return textX.serialize();
    }

    /**
     * Used to transform selection. Why not named transformSelection?
     * Because Univer Doc supports multiple Selections in one document, user need to encapsulate transformSelections at the application layer.
     */
    static transformPosition(thisActions: TextXAction[], index: number, priority = false): number {
        const thisIter = new ActionIterator(thisActions);

        let offset = 0;

        while (thisIter.hasNext() && offset <= index) {
            const length = thisIter.peekLength();
            const nextType = thisIter.peekType();
            thisIter.next();

            if (nextType === TextXActionType.DELETE) {
                index -= Math.min(length, index - offset);
                continue;
            } else if (nextType === TextXActionType.INSERT && (offset < index || !priority)) {
                index += length;
            }
            offset += length;
        }

        return index;
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
                    body: action.body,
                });
            } else if (action.t === TextXActionType.DELETE) {
                if (action.body == null) {
                    throw new Error('Can not invert DELETE action without body property, makeInvertible must be called first.');
                }

                invertedActions.push({
                    t: TextXActionType.INSERT,
                    body: action.body,
                    len: action.len,
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
            if (action.t === TextXActionType.DELETE && (action.body == null || (action.body && action.body.dataStream.length !== action.len))) {
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

    insert(len: number, body: IDocumentBody): this {
        const insertAction: IInsertAction = {
            t: TextXActionType.INSERT,
            body,
            len,
        };

        this.push(insertAction);
        return this;
    }

    retain(len: number, body?: IDocumentBody, coverType?: UpdateDocsAttributeType): this {
        const retainAction: IRetainAction = {
            t: TextXActionType.RETAIN,
            len,
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

    delete(len: number): this {
        const deleteAction: IDeleteAction = {
            t: TextXActionType.DELETE,
            len,
        };

        this.push(deleteAction);

        return this;
    }

    empty(): this {
        this._actions = [];
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

export type TextXSelection = TextX & {
    selections?: ITextRange[];
};

// FIXME: @Jocs, Use to avoid storybook error. and move the static name property to here.
Object.defineProperty(TextX, 'name', {
    value: 'text-x',
});
