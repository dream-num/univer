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

import type { Nullable } from '../../../shared/types';
import type { IDocumentBody, IDocumentData } from '../../../types/interfaces';
import type { TextXAction } from '../text-x/action-types';
import type { TPriority } from '../text-x/text-x';
import * as json1 from 'ot-json1';
import { TextX } from '../text-x/text-x';

export interface ISubType {
    name: string;
    id?: string;
    uri?: string;
    apply(doc: IDocumentBody, actions: TextXAction[]): IDocumentBody;
    compose(thisActions: TextXAction[], otherActions: TextXAction[]): TextXAction[];
    transform(thisActions: TextXAction[], otherActions: TextXAction[], priority: 'left' | 'right'): TextXAction[];
    invert?: (actions: TextXAction[]) => TextXAction[];
    isNoop?: (actions: TextXAction[]) => boolean;
    makeInvertible?: (actions: TextXAction[], doc: IDocumentBody) => TextXAction[];

    // eslint-disable-next-line ts/no-explicit-any
    [k: string]: any;
};

export const JSON1 = json1;
export type JSONXActions = json1.JSONOp;
export type JSONXPath = json1.Path;

export class JSONX {
    // static name = 'json-x';

    static uri = 'https://github.com/dream-num/univer#json-x';

    private static _subTypes: Map<string, ISubType> = new Map();

    static registerSubtype(subType: ISubType) {
        // Add `subType == null` just use to pass tests.
        if (subType == null || (this._subTypes.has(subType.name) && this._subTypes.get(subType.name)?.id !== TextX.id)) {
            return;
        }

        this._subTypes.set(subType.name, subType);
        json1.type.registerSubtype(subType);
    }

    static apply(doc: IDocumentData, actions: json1.JSONOp) {
        if (json1.type.isNoop(actions)) {
            return;
        }

        return json1.type.apply(doc as unknown as json1.Doc, actions);
    }

    static compose(thisActions: json1.JSONOp, otherActions: json1.JSONOp) {
        return json1.type.compose(thisActions, otherActions);
    }

    static composeAll(operations: readonly json1.JSONOp[]): json1.JSONOp {
        return operations.reduce((composed, operation) => json1.type.compose(composed, operation), null);
    }

    static transform(thisActions: json1.JSONOp, otherActions: json1.JSONOp, priority: TPriority) {
        return json1.type.transform(thisActions, otherActions, priority);
    }

    // Use to transform cursor position, just call TextXPro.transformPosition.
    static transformPosition(thisActions: json1.JSONOp, index: number, priority: TPriority = 'right'): number {
        if (thisActions && thisActions.length === 2 && thisActions[0] === 'body' && (thisActions[1] as any).et === TextX.name) {
            return TextX.transformPosition((thisActions[1] as any).e, index, priority === 'left');
        }

        return index;
    }

    static invertWithDoc(actions: json1.JSONOp, doc: IDocumentData) {
        // Why not use invert?
        // Because invertWithDoc = invert(makeInvertible(op, doc));
        // First we need to make all op invertible, then we can invert it.
        // invertWithDoc is a helper function to make all op invertible and then invert it.
        return json1.type.invertWithDoc(actions, doc as unknown as json1.Doc);
    }

    static isNoop(actions: json1.JSONOp) {
        return json1.type.isNoop(actions);
    }

    private static _instance: Nullable<JSONX> = null;

    static getInstance() {
        if (this._instance == null) {
            this._instance = new JSONX();
        }

        return this._instance;
    }

    // eslint-disable-next-line ts/no-explicit-any
    removeOp(path: json1.Path, value?: any) {
        return json1.removeOp(path, value);
    }

    moveOp(from: json1.Path, to: json1.Path) {
        return json1.moveOp(from, to);
    }

    // eslint-disable-next-line ts/no-explicit-any
    insertOp(path: json1.Path, value: any) {
        return json1.insertOp(path, value);
    }

    // eslint-disable-next-line ts/no-explicit-any
    replaceOp(path: json1.Path, oldVal: any, newVal: any) {
        return json1.replaceOp(path, oldVal, newVal);
    }

    editOp(subOp: TextXAction[], path = ['body']) {
        // Hardcode the path to ['body'] for now. Because rich text is in the body property.
        return json1.editOp(path, TextX.name, subOp);
    }
}

JSONX.registerSubtype(TextX);
