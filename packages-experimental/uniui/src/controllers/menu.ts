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

import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY, type IAccessor, IUniverInstanceService } from '@univerjs/core';
import { TextSelectionManagerService } from '@univerjs/docs';
import { type IMenuButtonItem, type IMenuItem, type IMenuSelectorItem, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import { map, Observable } from 'rxjs';
import { DisposeUnitOperation } from '../commands/operations/uni.operation';

export const UNIT_LINE_COLOR_MENU_ID = 'UNIT_LINE_COLOR_MENU_ID';
export const DOWNLOAD_MENU_ID = 'DOWNLOAD_MENU_ID';
export const SHARE_MENU_ID = 'SHARE_MENU_ID';
export const LOCK_MENU_ID = 'LOCK_MENU_ID';
export const PRINT_MENU_ID = 'PRINT_MENU_ID';
export const ZEN_MENU_ID = 'ZEN_MENU_ID';
export const DELETE_MENU_ID = DisposeUnitOperation.id;
export const FRAME_SIZE_MENU_ID = 'FRAME_SIZE_MENU_ID';

export const FONT_GROUP_MENU_ID = 'FONT_GROUP_MENU_ID';

export const FAKE_FONT_FAMILY_MENU_ID = 'FAKE_FONT_FAMILY_MENU_ID';
export const FAKE_FONT_SIZE_MENU_ID = 'FAKE_FONT_SIZE_MENU_ID';
export const FAKE_FONT_COLOR_MENU_ID = 'FAKE_FONT_COLOR_MENU_ID';
export const FAKE_BG_COLOR_MENU_ID = 'FAKE_BG_COLOR_MENU_ID';
export const FAKE_IMAGE_MENU_ID = 'FAKE_IMAGE_MENU_ID';
export const FAKE_FONT_GROUP_MENU_ID = 'FAKE_FONT_GROUP_MENU_ID';

export enum UNI_MENU_POSITIONS {
    TOOLBAR_MAIN = 'toolbar_main',
    TOOLBAR_FLOAT = 'toolbar_float',
}

export function FakeFontFamilySelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: FAKE_FONT_FAMILY_MENU_ID,
        tooltip: 'toolbar.font',
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.SELECTOR,
        label: 'UI_PLUGIN_DOCS_FONT_FAMILY_COMPONENT',
        positions: [MenuPosition.TOOLBAR_START],
        selections: [],
        disabled$: new Observable((subscriber) => { subscriber.next(true); }),
    };
}

export function FakeFontSizeSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<number> {
    return {
        id: FAKE_FONT_SIZE_MENU_ID,
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.SELECTOR,
        tooltip: 'toolbar.fontSize',
        label: {
            name: 'UI_PLUGIN_DOCS_FONT_SIZE_COMPONENT',
            props: {
                min: 1,
                max: 400,
            },
        },
        positions: [MenuPosition.TOOLBAR_START],
        selections: [],
        disabled$: new Observable((subscriber) => { subscriber.next(true); }),
    };
}

export function FakeTextColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: FAKE_FONT_COLOR_MENU_ID,
        icon: 'FontColor',
        tooltip: 'toolbar.textColor.main',

        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON_SELECTOR,
        positions: [MenuPosition.TOOLBAR_START],
        selections: [],
        disabled$: new Observable((subscriber) => { subscriber.next(true); }),
    };
}

export function FakeBackgroundColorSelectorMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: FAKE_BG_COLOR_MENU_ID,
        tooltip: 'toolbar.fillColor.main',
        group: MenuGroup.TOOLBAR_FORMAT,
        type: MenuItemType.BUTTON_SELECTOR,
        positions: [MenuPosition.TOOLBAR_START],
        icon: 'PaintBucket',
        selections: [],
        disabled$: new Observable((subscriber) => { subscriber.next(true); }),
    };
}

export function FakeImageMenuFactory(accessor: IAccessor): IMenuItem {
    return {
        id: FAKE_IMAGE_MENU_ID,
        type: MenuItemType.SUBITEMS,
        positions: [MenuPosition.TOOLBAR_START],
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        icon: 'addition-and-subtraction-single',
        tooltip: 'sheetImage.title',
        disabled$: new Observable((subscriber) => { subscriber.next(true); }),
    };
}

export function FontGroupMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    return {
        id: FONT_GROUP_MENU_ID,
        type: MenuItemType.SUBITEMS,
        tooltip: 'Font group',
        icon: 'BoldSingle',
        positions: [MenuPosition.TOOLBAR_START],
        hidden$: univerInstanceService.focused$.pipe(map((focused) => !focused)),
    };
}

export function FakeFontGroupMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: FAKE_FONT_GROUP_MENU_ID,
        type: MenuItemType.SUBITEMS,
        tooltip: 'Font group',
        icon: 'BoldSingle',
        positions: [MenuPosition.TOOLBAR_START],
        disabled$: new Observable((subscriber) => { subscriber.next(true); }),
    };
}

export function UnitLineColorMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: UNIT_LINE_COLOR_MENU_ID,
        type: MenuItemType.BUTTON,
        title: '',
        icon: '',
        positions: [
            UNI_MENU_POSITIONS.TOOLBAR_FLOAT,
        ],

    };
}

export function DownloadMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DOWNLOAD_MENU_ID,
        type: MenuItemType.BUTTON,
        group: MenuGroup.TOOLBAR_OTHERS,
        title: '',
        tooltip: 'Download',
        icon: 'DownloadSingle',
        positions: [
            UNI_MENU_POSITIONS.TOOLBAR_FLOAT,
        ],
    };
}

export function ShareMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: SHARE_MENU_ID,
        type: MenuItemType.BUTTON,
        group: MenuGroup.TOOLBAR_OTHERS,
        title: '',
        tooltip: 'Share',
        icon: 'ShareSingle',
        positions: [
            UNI_MENU_POSITIONS.TOOLBAR_FLOAT,
        ],

    };
}

export function LockMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: LOCK_MENU_ID,
        type: MenuItemType.BUTTON,
        group: MenuGroup.TOOLBAR_OTHERS,
        title: '',
        tooltip: 'Lock',
        icon: 'LockSingle',
        positions: [
            UNI_MENU_POSITIONS.TOOLBAR_FLOAT,
        ],
    };
}

export function PrintMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: PRINT_MENU_ID,
        type: MenuItemType.BUTTON,
        group: MenuGroup.TOOLBAR_OTHERS,
        title: '',
        tooltip: 'Print',
        icon: 'PrintSingle',
        positions: [
            UNI_MENU_POSITIONS.TOOLBAR_FLOAT,
        ],

    };
}

export function ZenMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ZEN_MENU_ID,
        type: MenuItemType.BUTTON,
        title: '',
        icon: 'ZenSingle',
        tooltip: 'Full screen',
        group: MenuGroup.TOOLBAR_OTHERS,
        positions: [
            UNI_MENU_POSITIONS.TOOLBAR_FLOAT,
        ],
    };
}

export function DeleteMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DELETE_MENU_ID,
        type: MenuItemType.BUTTON,
        title: 'Delete',
        tooltip: 'Delete',
        icon: 'DeleteSingle',
        group: MenuGroup.TOOLBAR_OTHERS,
        positions: [
            UNI_MENU_POSITIONS.TOOLBAR_FLOAT,
        ],
    };
}

function getFontStyleAtCursor(accessor: IAccessor) {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const textSelectionService = accessor.get(TextSelectionManagerService);

    const editorDataModel = univerInstanceService.getUniverDocInstance(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
    const activeTextRange = textSelectionService.getActiveRange();

    if (editorDataModel == null || activeTextRange == null) return null;

    const textRuns = editorDataModel.getBody()?.textRuns;
    if (textRuns == null) return;

    const { startOffset } = activeTextRange;
    const textRun = textRuns.find(({ st, ed }) => startOffset >= st && startOffset <= ed);
    return textRun;
}

