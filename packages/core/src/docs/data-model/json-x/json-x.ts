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

/** A JSON1 subtype that edits a Univer document body using TextX actions. */
export interface ISubType extends IJSON1Subtype<IDocumentBody, TextXAction[]> {
    id?: string;
}

/** Builds and replays JSON1 document changesets with TextX edits embedded at document body paths. */
export class JSONX {
    // static name = 'json-x';

    static uri = 'https://github.com/dream-num/univer#json-x';

    private static _subTypes: Map<string, ISubType> = new Map();

    /** Register the document subtype for replay. The built-in TextX registration can be replaced by an extension. */
    static registerSubtype(subType: ISubType) {
        // Add `subType == null` just use to pass tests.
        if (subType == null || (this._subTypes.has(subType.name) && this._subTypes.get(subType.name)?.id !== TextX.id)) {
            return;
        }

        this._subTypes.set(subType.name, subType);
        registerJSON1Subtype(subType);
    }

    /** Apply a document changeset. An empty changeset returns `undefined`. */
    static apply(doc: IDocumentData, actions: JSONXActions) {
        if (JSON1.isNoop(actions)) {
            return;
        }

        return JSON1.apply(doc as unknown as JSON1Document, actions);
    }

    /** Combine two document changesets authored in sequence, including edits to the same body. */
    static compose(thisActions: JSONXActions, otherActions: JSONXActions) {
        return JSON1.compose(thisActions, otherActions);
    }

    /** Rebase `thisActions` to apply after `otherActions`, using the given priority for concurrent edits. */
    static transform(thisActions: JSONXActions, otherActions: JSONXActions, priority: TPriority) {
        return JSON1.transform(thisActions, otherActions, priority);
    }

    /** Map a text index through a single TextX edit at `body`. Other changeset shapes return the original index. */
    static transformPosition(thisActions: JSONXActions, index: number, priority: TPriority = 'right'): number {
        const edit = thisActions?.[1];
        if (thisActions?.length === 2 && thisActions[0] === 'body' && typeof edit === 'object'
            && 'et' in edit && edit.et === TextX.name && Array.isArray(edit.e)) {
            return TextX.transformPosition(edit.e, index, priority === 'left');
        }

        return index;
    }

    /** Build undo from the document revision immediately before the edit, including any deleted body content. */
    static invertWithDoc(actions: JSONXActions, doc: IDocumentData) {
        return JSON1.invertWithDoc(actions, doc as unknown as JSON1Document);
    }

    /** Return whether the document changeset is empty. */
    static isNoop(actions: JSONXActions) {
        return JSON1.isNoop(actions);
    }

    private static _instance: Nullable<JSONX> = null;

    /** Return the shared builder for document and embedded body edits. */
    static getInstance() {
        if (this._instance == null) {
            this._instance = new JSONX();
        }

        return this._instance;
    }

    /** Build a compact deletion, or include `value` to record the data that undo should restore. */
    // eslint-disable-next-line ts/no-explicit-any
    removeOp(path: JSONXPath, value?: any) {
        return JSON1.removeOp(path, value);
    }

    /** Move a document value from its path in the source revision to its path in the result. */
    moveOp(from: JSONXPath, to: JSONXPath) {
        return JSON1.moveOp(from, to);
    }

    /** Build an insertion at a document property or array index. */
    // eslint-disable-next-line ts/no-explicit-any
    insertOp(path: JSONXPath, value: any) {
        return JSON1.insertOp(path, value);
    }

    /** Replace a value and record the original in the same component for undo. */
    // eslint-disable-next-line ts/no-explicit-any
    replaceOp(path: JSONXPath, oldVal: any, newVal: any) {
        return JSON1.replaceOp(path, oldVal, newVal);
    }

    /** Wrap TextX actions in a JSON1 edit at the given path, which defaults to the main document body. */
    editOp(subOp: TextXAction[], path = ['body']) {
        return editJSON1Subtype(path, TextX.name, subOp);
    }
}

JSONX.registerSubtype(TextX);
