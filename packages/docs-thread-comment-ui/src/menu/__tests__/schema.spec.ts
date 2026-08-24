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

import { FloatingObjectToolbarPosition, RibbonInsertGroup } from '@univerjs/ui';
import { describe, expect, it } from 'vitest';
import {
    AddDocDrawingCommentOperation,
    StartAddCommentOperation,
    ToggleCommentPanelOperation,
} from '../../commands/operations/show-comment-panel.operation';
import { menuSchema } from '../schema';

function schemaNode(value: unknown, ...keys: string[]): object {
    let node = value;
    keys.forEach((key) => {
        if (node == null || typeof node !== 'object') {
            throw new Error(`Missing menu schema node: ${key}`);
        }
        node = Reflect.get(node, key);
    });
    if (node == null || typeof node !== 'object') {
        throw new Error('Missing menu schema node');
    }
    return node;
}

describe('docs thread comment ribbon schema', () => {
    it('stacks open and add comment in one grid column', () => {
        const group = schemaNode(menuSchema, RibbonInsertGroup.MEDIA);

        expect(Reflect.get(schemaNode(group, ToggleCommentPanelOperation.id), 'gridLayout')).toEqual({
            row: 1,
            column: 4,
            showLabel: true,
        });
        expect(Reflect.get(schemaNode(group, StartAddCommentOperation.id), 'gridLayout')).toEqual({
            row: 2,
            column: 4,
            showLabel: true,
        });
    });

    it('contributes drawing comments to the floating object toolbar', () => {
        const item = schemaNode(menuSchema, FloatingObjectToolbarPosition.DOC, AddDocDrawingCommentOperation.id);

        expect(Reflect.get(item, 'menuItemFactory')).toBeTypeOf('function');
    });
});
