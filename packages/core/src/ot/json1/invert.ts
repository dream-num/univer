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

import type { JSON1Document, JSONXActions } from './json1';
import type { IEntry } from './operation';
import { makeInvertible } from './apply';
import { independentAddresses } from './batch';
import { JSON1WriteCursor } from './cursor';
import { reverseMove, singleMove } from './move';
import { atEdit, editComponent, entries, getEdit, numberSubtype, singleEdit } from './operation';
import { Revision } from './revision';

/** Exchange source and result fields, carrying subtype undo back to its original location. */
export function invert(op: JSONXActions): JSONXActions {
    const writer = new JSON1WriteCursor();
    const base = new Revision();
    const changes = entries(op);
    const move = singleMove(changes);
    if (move) {
        return reverseMove(op!);
    }
    const result = new Revision(base.root).replay(changes);
    const drops = new Set(changes.filter(({ component }) => component.i !== undefined || component.d !== undefined).map(({ path }) => result.at(path)));
    for (const { path, component } of changes) {
        if (component.p !== undefined) {
            writer.writeAtPath(path, 'd', component.p);
        }
        if (component.d !== undefined) {
            writer.writeAtPath(path, 'p', component.d);
        }
        if (component.r !== undefined) {
            writer.writeAtPath(path, 'i', component.r);
        }
        if (component.i !== undefined) {
            writer.writeAtPath(path, 'r', result.literal(result.at(path), drops, result.records));
        }
        const edit = getEdit(component);
        if (!edit) {
            continue;
        }
        const origin = base.path(result.at(path));
        if (origin) {
            if (!edit.type.invert) {
                throw new Error(`Cannot invert ${edit.type.name}`);
            }
            writer.reset();
            writer.at(origin, (w) => w.mergeTree([editComponent({ ...edit, payload: edit.type.invert!(edit.payload) })]));
            writer.reset();
        }
    }
    return writer.get();
}

/** In independent branches the inverse runs at the same addresses; only the before-values need looking up. */
function invertIndependent(changes: IEntry[], doc: JSON1Document): JSONXActions | undefined {
    if (!independentAddresses(changes)) {
        return;
    }
    const writer = new JSON1WriteCursor();
    for (const { path, component } of changes) {
        const edit = getEdit(component);
        if ((edit && (edit.type !== numberSubtype || component.i !== undefined || component.d !== undefined || component.r !== undefined || component.p !== undefined))
            || (component.i !== null && typeof component.i === 'object')) {
            return;
        }
        let current: JSON1Document | undefined = doc;
        let parent: JSON1Document | undefined;
        for (const key of path) {
            if (!current || typeof current !== 'object' || Array.isArray(current) !== (typeof key === 'number')) {
                return;
            }
            parent = current;
            current = Object.prototype.hasOwnProperty.call(current, key) ? (current as Record<string, JSON1Document>)[key] : undefined;
        }
        const key = path[path.length - 1];
        if ((edit || component.r !== undefined || component.p !== undefined) && current === undefined) {
            return;
        }
        if (component.i !== undefined || component.d !== undefined) {
            if (Array.isArray(parent) ? Number(key) > parent.length : current !== undefined && component.r === undefined && component.p === undefined) {
                return;
            }
        }
        writer.reset();
        if (edit) {
            writer.at(path, (w) => w.mergeTree([editComponent({ ...edit, payload: -Number(edit.payload) })]));
        } else {
            writer.at(path, (w) => {
                if (component.p !== undefined) {
                    w.write('d', component.p);
                }
                if (component.d !== undefined) {
                    w.write('p', component.d);
                }
                if (component.r !== undefined) {
                    w.write('i', current);
                }
                if (component.i !== undefined) {
                    w.write('r', component.i);
                }
            });
        }
    }
    return writer.get();
}

/** Derive an undo operation from the document immediately before the change. */
export function invertWithDoc(op: JSONXActions, doc: JSON1Document) {
    const changes = entries(op);
    const move = singleMove(changes);
    if (move) {
        return reverseMove(op!);
    }
    const edit = singleEdit(changes);
    if (edit?.type.invert && edit.type.makeInvertible) {
        const path = changes[0].path;
        let value = doc;
        for (const key of path) {
            if (!value || typeof value !== 'object' || Array.isArray(value) !== (typeof key === 'number')
                || !Object.prototype.hasOwnProperty.call(value, key)) {
                return invert(makeInvertible(op, doc));
            }
            value = (value as Record<string, JSON1Document>)[key];
        }
        const captured = edit.type.makeInvertible(edit.payload, value);
        return atEdit(path, edit.type, edit.type.invert(captured));
    }
    return invertIndependent(changes, doc) ?? invert(makeInvertible(op, doc));
}
