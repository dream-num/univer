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

import { describe, expect, it } from 'vitest';
import {
    ContextMenuGroup,
    ContextMenuPosition,
    MenuManagerPosition,
    RibbonDataGroup,
    RibbonFormulasGroup,
    RibbonInsertGroup,
    RibbonOthersGroup,
    RibbonPosition,
    RibbonStartGroup,
    RibbonViewGroup,
} from '../types';

describe('menu type enums', () => {
    it('should expose ribbon positions and groups', () => {
        expect(MenuManagerPosition.RIBBON).toBe('ribbon');
        expect(RibbonPosition.START).toBe('ribbon.start');
        expect(RibbonPosition.OTHERS).toBe('ribbon.others');
        expect(RibbonStartGroup.HISTORY).toBe('ribbon.start.history');
        expect(RibbonInsertGroup.MEDIA).toBe('ribbon.insert.media');
        expect(RibbonFormulasGroup.BASIC).toBe('ribbon.formulas.basic');
        expect(RibbonDataGroup.RULES).toBe('ribbon.data.rules');
        expect(RibbonViewGroup.VISIBILITY).toBe('ribbon.view.Visibility');
        expect(RibbonOthersGroup.OTHERS).toBe('ribbon.others.others');
    });

    it('should expose context menu positions and groups', () => {
        expect(MenuManagerPosition.CONTEXT_MENU).toBe('contextMenu');
        expect(ContextMenuPosition.MAIN_AREA).toBe('contextMenu.mainArea');
        expect(ContextMenuPosition.PARAGRAPH).toBe('contextMenu.paragraph');
        expect(ContextMenuGroup.QUICK).toBe('contextMenu.quick');
        expect(ContextMenuGroup.OTHERS).toBe('contextMenu.others');
    });
});
