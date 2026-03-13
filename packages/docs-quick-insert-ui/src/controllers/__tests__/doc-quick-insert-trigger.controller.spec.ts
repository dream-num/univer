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

import { DeleteDirection, Direction } from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { DeleteCommand, DeleteLeftCommand, IMEInputCommand, InsertCommand, MoveCursorOperation } from '@univerjs/docs-ui';
import { KeyCode } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { CloseQuickInsertPopupOperation, ShowQuickInsertPopupOperation } from '../../commands/operations/quick-insert-popup.operation';
import { numberedListMenu, textMenu } from '../../menu/built-in-menus';
import { DocQuickInsertTriggerController } from '../doc-quick-insert-trigger.controller';

function createCommandService() {
    const listeners = new Set<(commandInfo: { id: string; params?: unknown }) => void>();

    return {
        executeCommand: vi.fn(() => true),
        onCommandExecuted: vi.fn((callback: (commandInfo: { id: string; params?: unknown }) => void) => {
            listeners.add(callback);
            return {
                dispose: () => listeners.delete(callback),
            };
        }),
        emit(commandInfo: { id: string; params?: unknown }) {
            listeners.forEach((listener) => listener(commandInfo));
        },
    };
}

function createPopupService() {
    let menuSelectedHandler: ((menu: { id: string }) => void) | null = null;
    let editPopup: { anchor: number } | null = null;
    let isComposing = false;
    let inputOffset = { start: 0, end: 0 };

    return {
        get editPopup() {
            return editPopup;
        },
        setEditPopup(value: { anchor: number } | null) {
            editPopup = value;
        },
        get isComposing() {
            return isComposing;
        },
        get inputOffset() {
            return inputOffset;
        },
        setInputOffset: vi.fn((value: { start: number; end: number }) => {
            inputOffset = value;
        }),
        resolvePopup: vi.fn(),
        setIsComposing: vi.fn((value: boolean) => {
            isComposing = value;
        }),
        onMenuSelected: vi.fn((handler: (menu: { id: string }) => void) => {
            menuSelectedHandler = handler;
            return () => {
                menuSelectedHandler = null;
            };
        }),
        triggerMenuSelected(menu: { id: string }) {
            menuSelectedHandler?.(menu);
        },
    };
}

describe('DocQuickInsertTriggerController', () => {
    it('reacts to insert, edit, cursor, delete and IME events like a real quick-insert session', () => {
        vi.useFakeTimers();

        const commandService = createCommandService();
        const popupService = createPopupService();
        const shortcutService = {
            registerShortcut: vi.fn(() => ({ dispose: vi.fn() })),
        };
        const selectionManagerService = {
            getActiveTextRange: vi.fn(() => ({ startOffset: 5, endOffset: 5 })),
        };
        const popup = {
            keyword: '/',
            menus$: { subscribe: vi.fn() },
            preconditions: vi.fn(() => true),
        };
        popupService.resolvePopup.mockReturnValue(popup);

        const controller = new DocQuickInsertTriggerController(
            commandService as never,
            selectionManagerService as never,
            popupService as never,
            shortcutService as never,
            {
                getCurrentUnitOfType: vi.fn(() => ({ getDisabled: () => false })),
            } as never
        );

        expect(shortcutService.registerShortcut).toHaveBeenCalledWith(expect.objectContaining({
            id: CloseQuickInsertPopupOperation.id,
            binding: KeyCode.ESC,
            priority: 1000,
        }));

        commandService.emit({
            id: InsertCommand.id,
            params: {
                body: { dataStream: '/' },
                range: { endOffset: 5 },
                unitId: 'doc-1',
            },
        });

        expect(popupService.setInputOffset).toHaveBeenCalledWith({ start: 4, end: 5 });
        expect(commandService.executeCommand).not.toHaveBeenCalledWith(ShowQuickInsertPopupOperation.id, expect.anything());

        vi.advanceTimersByTime(100);
        expect(commandService.executeCommand).toHaveBeenCalledWith(ShowQuickInsertPopupOperation.id, {
            index: 4,
            unitId: 'doc-1',
            popup,
        });

        popupService.setEditPopup({ anchor: 4 });
        commandService.emit({
            id: InsertCommand.id,
            params: {
                body: { dataStream: 'a' },
                range: { endOffset: 7 },
                unitId: 'doc-1',
            },
        });
        expect(popupService.setInputOffset).toHaveBeenLastCalledWith({ start: 4, end: 8 });

        commandService.emit({
            id: IMEInputCommand.id,
            params: { isCompositionStart: true, isCompositionEnd: false },
        });
        commandService.emit({
            id: IMEInputCommand.id,
            params: { isCompositionStart: false, isCompositionEnd: true },
        });
        expect(popupService.setIsComposing).toHaveBeenNthCalledWith(1, true);
        expect(popupService.setIsComposing).toHaveBeenNthCalledWith(2, false);

        commandService.emit({
            id: RichTextEditingMutation.id,
            params: {
                isCompositionEnd: true,
                textRanges: [{ endOffset: 9 }],
            },
        });
        expect(popupService.setInputOffset).toHaveBeenLastCalledWith({ start: 4, end: 9 });

        commandService.emit({
            id: DeleteCommand.id,
            params: {
                direction: DeleteDirection.LEFT,
                len: 2,
                range: { endOffset: 10 },
            },
        });
        expect(popupService.setInputOffset).toHaveBeenLastCalledWith({ start: 4, end: 8 });

        commandService.emit({
            id: MoveCursorOperation.id,
            params: { direction: Direction.LEFT },
        });
        expect(commandService.executeCommand).toHaveBeenCalledWith(CloseQuickInsertPopupOperation.id);

        selectionManagerService.getActiveTextRange.mockReturnValue({ startOffset: 4, endOffset: 4 });
        commandService.emit({ id: DeleteLeftCommand.id });
        expect(commandService.executeCommand).toHaveBeenCalledWith(CloseQuickInsertPopupOperation.id);

        controller.dispose();
        vi.useRealTimers();
    });

    it('executes built-in menu commands but skips plain text selection', () => {
        const commandService = createCommandService();
        const popupService = createPopupService();

        const controller = new DocQuickInsertTriggerController(
            commandService as never,
            { getActiveTextRange: vi.fn() } as never,
            popupService as never,
            { registerShortcut: vi.fn(() => ({ dispose: vi.fn() })) } as never,
            {
                getCurrentUnitOfType: vi.fn(() => ({ getDisabled: () => false })),
            } as never
        );

        popupService.triggerMenuSelected(textMenu);
        popupService.triggerMenuSelected(numberedListMenu);

        expect(commandService.executeCommand).not.toHaveBeenCalledWith(textMenu.id);
        expect(commandService.executeCommand).toHaveBeenCalledWith(numberedListMenu.id);

        controller.dispose();
    });
});
