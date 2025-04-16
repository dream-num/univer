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

import { Disposable, RedoCommand, toDisposable, UndoCommand, UniverInstanceType } from '@univerjs/core';
import { FAKE_BG_COLOR_MENU_ID, FAKE_FONT_COLOR_MENU_ID, FAKE_FONT_FAMILY_MENU_ID, FAKE_FONT_GROUP_MENU_ID, FAKE_FONT_SIZE_MENU_ID, FAKE_IMAGE_MENU_ID, FAKE_ORDER_LIST_MENU_ID, FAKE_TABLE_MENU_ID, FAKE_UNORDER_LIST_MENU_ID, FONT_GROUP_MENU_ID } from '../../controllers/menu';

interface IItemImpl {
    id: string;
    type: UniverInstanceType;
}

export interface IUniToolbarItem {
    id: string;
    impl: IItemImpl[];
}

export enum BuiltinUniToolbarItemId {
    UNDO = 'undo',
    REDO = 'redo',
    FONT_FAMILY = 'font-famaily',
    FONT_SIZE = 'font-size',
    FONT_GROUP = 'font-group',
    COLOR = 'color',
    BACKGROUND = 'background',
    IMAGE = 'image',
    TABLE = 'table',
    UNORDER_LIST = 'unorder-list',
    ORDER_LIST = 'order-list',
}

export class UniToolbarService extends Disposable {
    private _items: IUniToolbarItem[];
    constructor() {
        super();
        this._init();
    }

    private _init() {
        this._items = [
            {
                id: BuiltinUniToolbarItemId.UNDO,
                impl: [{ id: UndoCommand.id, type: UniverInstanceType.UNIVER_UNKNOWN }],
            },
            {
                id: BuiltinUniToolbarItemId.REDO,
                impl: [{ id: RedoCommand.id, type: UniverInstanceType.UNIVER_UNKNOWN }],
            },
            {
                id: BuiltinUniToolbarItemId.FONT_FAMILY,
                impl: [{ id: FAKE_FONT_FAMILY_MENU_ID, type: UniverInstanceType.UNIVER_UNKNOWN }],
            },
            {
                id: BuiltinUniToolbarItemId.FONT_SIZE,
                impl: [{ id: FAKE_FONT_SIZE_MENU_ID, type: UniverInstanceType.UNIVER_UNKNOWN }],
            },
            {
                id: BuiltinUniToolbarItemId.FONT_GROUP,
                impl: [
                    { id: FAKE_FONT_GROUP_MENU_ID, type: UniverInstanceType.UNIVER_UNKNOWN },
                    { id: FONT_GROUP_MENU_ID, type: UniverInstanceType.UNIVER_SHEET },
                    { id: FONT_GROUP_MENU_ID, type: UniverInstanceType.UNIVER_DOC },
                ],
            },
            {
                id: BuiltinUniToolbarItemId.COLOR,
                impl: [{ id: FAKE_FONT_COLOR_MENU_ID, type: UniverInstanceType.UNIVER_UNKNOWN }],
            },
            {
                id: BuiltinUniToolbarItemId.BACKGROUND,
                impl: [{ id: FAKE_BG_COLOR_MENU_ID, type: UniverInstanceType.UNIVER_UNKNOWN }],
            },
            {
                id: BuiltinUniToolbarItemId.IMAGE,
                impl: [{ id: FAKE_IMAGE_MENU_ID, type: UniverInstanceType.UNIVER_UNKNOWN }],
            },
            {
                id: BuiltinUniToolbarItemId.UNORDER_LIST,
                impl: [{ id: FAKE_UNORDER_LIST_MENU_ID, type: UniverInstanceType.UNIVER_UNKNOWN }],
            },
            {
                id: BuiltinUniToolbarItemId.ORDER_LIST,
                impl: [{ id: FAKE_ORDER_LIST_MENU_ID, type: UniverInstanceType.UNIVER_UNKNOWN }],
            },
            {
                id: BuiltinUniToolbarItemId.TABLE,
                impl: [{ id: FAKE_TABLE_MENU_ID, type: UniverInstanceType.UNIVER_UNKNOWN }],
            },
        ];
    }

    addItem(item: IUniToolbarItem) {
        this._items.push(item);
        return toDisposable(() => {
            this._items = this._items.filter((i) => i.id !== item.id);
        });
    }

    getItems() {
        return this._items;
    }

    implementItem(id: string, impl: IItemImpl) {
        const item = this._items.find((item) => item.id === id);
        if (item) {
            item.impl.push(impl);
            return toDisposable(() => {
                item.impl = item.impl.filter((i) => i.id !== impl.id);
            });
        }
        return toDisposable(() => {});
    }
}
