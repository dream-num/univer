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
import { makeInvertible } from './apply';
import { JSON1WriteCursor } from './cursor';
import { editComponent, entries, getEdit } from './operation';
import { Revision } from './revision';

/** Exchange source and result fields, carrying subtype undo back to its original location. */
export function invert(op: JSONXActions): JSONXActions {
    const writer = new JSON1WriteCursor();
    const base = new Revision();
    const result = base.copy().replay(op);
    const changes = entries(op);
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
        }
    }
    return writer.get();
}

/** Derive an undo operation from the document immediately before the change. */
export function invertWithDoc(op: JSONXActions, doc: JSON1Document) {
    return invert(makeInvertible(op, doc));
}
