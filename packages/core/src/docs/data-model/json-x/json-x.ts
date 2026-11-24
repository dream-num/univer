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

import type { IJSON1Subtype, JSON1Document, JSONXActions, JSONXPath } from '../../../ot/json1/json1';
import type { Nullable } from '../../../shared/types';
import type { IDocumentBody, IDocumentData } from '../../../types/interfaces';
import type { TextXAction } from '../text-x/action-types';
import type { TPriority } from '../text-x/text-x';
import { editJSON1Subtype, JSON1, registerJSON1Subtype } from '../../../ot/json1/json1';
import { TextX } from '../text-x/text-x';

export interface ISubType extends IJSON1Subtype<IDocumentBody, TextXAction[]> {
    id?: string;
}

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
        registerJSON1Subtype(subType);
    }

    static apply(doc: IDocumentData, actions: JSONXActions) {
        if (JSON1.isNoop(actions)) {
            return;
        }

        return JSON1.apply(doc as unknown as JSON1Document, actions);
    }

    static compose(thisActions: JSONXActions, otherActions: JSONXActions) {
        return JSON1.compose(thisActions, otherActions);
    }

    static transform(thisActions: JSONXActions, otherActions: JSONXActions, priority: TPriority) {
        return JSON1.transform(thisActions, otherActions, priority);
    }

    // Use to transform cursor position, just call TextXPro.transformPosition.
    static transformPosition(thisActions: JSONXActions, index: number, priority: TPriority = 'right'): number {
        const edit = thisActions?.[1];
        if (thisActions?.length === 2 && thisActions[0] === 'body' && typeof edit === 'object'
            && 'et' in edit && edit.et === TextX.name && Array.isArray(edit.e)) {
            return TextX.transformPosition(edit.e, index, priority === 'left');
        }

        return index;
    }

    static invertWithDoc(actions: JSONXActions, doc: IDocumentData) {
        // Why not use invert?
        // Because invertWithDoc = invert(makeInvertible(op, doc));
        // First we need to make all op invertible, then we can invert it.
        // invertWithDoc is a helper function to make all op invertible and then invert it.
        return JSON1.invertWithDoc(actions, doc as unknown as JSON1Document);
    }

    static isNoop(actions: JSONXActions) {
        return JSON1.isNoop(actions);
    }

    private static _instance: Nullable<JSONX> = null;

    static getInstance() {
        if (this._instance == null) {
            this._instance = new JSONX();
        }

        return this._instance;
    }

    // eslint-disable-next-line ts/no-explicit-any
    removeOp(path: JSONXPath, value?: any) {
        return JSON1.removeOp(path, value);
    }

    moveOp(from: JSONXPath, to: JSONXPath) {
        return JSON1.moveOp(from, to);
    }

    // eslint-disable-next-line ts/no-explicit-any
    insertOp(path: JSONXPath, value: any) {
        return JSON1.insertOp(path, value);
    }

    // eslint-disable-next-line ts/no-explicit-any
    replaceOp(path: JSONXPath, oldVal: any, newVal: any) {
        return JSON1.replaceOp(path, oldVal, newVal);
    }

    editOp(subOp: TextXAction[], path = ['body']) {
        // Hardcode the path to ['body'] for now. Because rich text is in the body property.
        return editJSON1Subtype(path, TextX.name, subOp);
    }
}

JSONX.registerSubtype(TextX);
