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

import type { JSONXActions, JSONXPath } from './json1';
import { Revision } from './revision';
import { unicodeText } from './unicode-text';

/** Follow the selected value through relocations, or return null when its subtree disappears. */
export function transformPosition(path: JSONXPath, op: JSONXActions): JSONXPath | null {
    const source = new Revision();
    const value = source.at(path);
    const result = source.copy().replay(op);
    const mapped = result.path(value);
    const offset = path[path.length - 1];
    if (mapped && typeof offset === 'number') {
        const parent = source.at(path.slice(0, -1));
        const edit = result.edits.get(parent);
        if (edit?.type === unicodeText) {
            mapped[mapped.length - 1] = unicodeText.transformPosition(offset, edit.payload as Parameters<typeof unicodeText.transformPosition>[1]);
        }
    }
    return mapped;
}
