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

import { LocaleService, LocaleType, Univer } from '@univerjs/core';
import { IRefSelectionsService, RefSelectionsService } from '@univerjs/sheets';
import { ContextMenuPosition, IContextMenuService, RediContext, UniverUIPlugin } from '@univerjs/ui';
import enUS from '@univerjs/ui/locale/en-US';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import { FormulaSelectingType } from '../use-formula-selection';
import { useRefactorEffect } from '../use-refactor-effect';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function FormulaEditorInteraction(props: { focused: boolean; selecting: FormulaSelectingType }) {
    useRefactorEffect(props.focused, props.selecting, 'workbook', 'formula-editor');
    return null;
}

it('opens the sheet context menu after clearing a reference and refocusing the empty formula editor', async () => {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const localeService = injector.get(LocaleService);
    localeService.load({ [LocaleType.EN_US]: enUS });
    localeService.setLocale(LocaleType.EN_US);
    localeService.setDirection('ltr');
    const container = document.createElement('div');
    document.body.appendChild(container);
    act(() => univer.registerPlugin(UniverUIPlugin, { container }));
    injector.add([IRefSelectionsService, { useClass: RefSelectionsService }]);
    const menu = injector.get(IContextMenuService);
    const root = createRoot(document.createElement('div'));
    const renderEditor = (focused: boolean, selecting: FormulaSelectingType) => act(() => root.render(
        <RediContext.Provider value={{ injector }}>
            <FormulaEditorInteraction focused={focused} selecting={selecting} />
        </RediContext.Provider>
    ));
    const openSheetMenu = () => act(async () => {
        menu.triggerContextMenu(new MouseEvent('pointerdown', { button: 2 }), ContextMenuPosition.MAIN_AREA);
        await new Promise(requestAnimationFrame);
    });

    try {
        renderEditor(true, FormulaSelectingType.NEED_ADD);
        await openSheetMenu();
        expect(menu.visible).toBe(false);

        renderEditor(true, FormulaSelectingType.NOT_SELECT);
        await openSheetMenu();
        expect(menu.visible).toBe(true);

        act(() => menu.hideContextMenu());
        renderEditor(false, FormulaSelectingType.NOT_SELECT);
        renderEditor(true, FormulaSelectingType.NOT_SELECT);
        await openSheetMenu();
        expect(menu.visible).toBe(true);
    } finally {
        act(() => root.unmount());
        act(() => univer.dispose());
        container.remove();
    }
});
