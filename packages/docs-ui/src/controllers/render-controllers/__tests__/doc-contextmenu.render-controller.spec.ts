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

// @vitest-environment jsdom

import {
    DocumentBlockRangeType,
    FOCUSING_COMMON_DRAWINGS,
    ICommandService,
    IContextService,
    Injector,
    IUniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { ContextMenuPosition, IContextMenuService, IContextMenuShortcutService } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { DocEventManagerService } from '../../../services/doc-event-manager.service';
import { DocContextMenuRenderController } from '../doc-contextmenu.render-controller';

interface IDocPointerEvent {
    button: number;
    offsetX: number;
    offsetY: number;
}

function createEventSubject() {
    const subscribers = new Set<(evt: IDocPointerEvent) => void>();

    return {
        subscribeEvent: vi.fn((handler: (evt: IDocPointerEvent) => void) => {
            subscribers.add(handler);
            const unsubscribe = vi.fn(() => subscribers.delete(handler));
            return { dispose: unsubscribe, unsubscribe };
        }),
        emit: (evt: IDocPointerEvent) => subscribers.forEach((handler) => handler(evt)),
    };
}

function createController(options?: {
    pointerOnBullet?: boolean;
    textRanges?: Array<{ startOffset: number; endOffset: number }>;
    blockRanges?: Array<{ startIndex: number; endIndex: number; blockType: DocumentBlockRangeType }>;
    menuVisible?: boolean;
    focusingDrawing?: boolean;
}) {
    const onPointerDown$ = createEventSubject();
    let commandHandler: ((command: { id: string }) => void) | undefined;
    const contextMenuService = {
        visible: options?.menuVisible ?? false,
        triggerContextMenu: vi.fn(),
        hideContextMenu: vi.fn(),
    };
    const canvas = document.createElement('canvas');
    const unit = {
        getSelfOrHeaderFooterModel: (segment: string) => segment === 'header'
            ? {
                getBody: () => ({ paragraphs: [{ startIndex: 2, paragraphId: 'previous' }, { startIndex: 12, paragraphId: 'selected' }] }),
            }
            : null,
        getBody: () => ({ blockRanges: options?.blockRanges ?? [] }),
    };
    const context = { unitId: 'doc-1', unit, engine: { getCanvasElement: () => canvas }, mainComponent: { onPointerDown$ } };
    const events = { contextMenuParagraph: null, getParagraphByOffset: () => null, isPointerOnNonChecklistBullet: () => options?.pointerOnBullet ?? false };
    const register = vi.fn<IContextMenuShortcutService['register']>(() => ({ dispose() {} }));
    const injector = new Injector([
        [IContextMenuShortcutService, { useValue: { register } }],
        [IContextMenuService, { useValue: contextMenuService }],
        [ICommandService, { useValue: {
            onCommandExecuted(handler: (command: { id: string }) => void) {
                commandHandler = handler;
                return { dispose() {} };
            },
        } }],
        [DocEventManagerService, { useValue: events }],
        [DocSelectionManagerService, { useValue: {
            getTextRanges: () => options?.textRanges ?? [],
            getActiveTextRange: () => ({ segmentId: 'header', startOffset: 5 }),
        } }],
        [IContextService, { useValue: { getContextValue: (key: string) => key === FOCUSING_COMMON_DRAWINGS && options?.focusingDrawing } }],
        [IUniverInstanceService, { useValue: {
            getUnit: () => unit,
            getFocusedUnit: () => unit,
            getCurrentUnitOfType: (type: UniverInstanceType) => type === UniverInstanceType.UNIVER_DOC ? unit : null,
        } }],
    ]);
    const controller = injector.createInstance(DocContextMenuRenderController, context as never);
    const keyboardMenu = () => register.mock.calls[0][0](canvas)?.(new MouseEvent('contextmenu'));
    return { controller, onPointerDown$, contextMenuService, events, keyboardMenu, commandHandler: () => commandHandler };
}

describe('DocContextMenuRenderController', () => {
    it('opens the main-area context menu on right click when the selection is normal document text', () => {
        const { controller, onPointerDown$, contextMenuService } = createController();
        const event = { button: 2, offsetX: 10, offsetY: 20 };

        onPointerDown$.emit(event);

        expect(contextMenuService.triggerContextMenu).toHaveBeenCalledWith(event, ContextMenuPosition.MAIN_AREA);
        controller.dispose();
    });

    it('opens the drawing context menu when a drawing is focused', () => {
        const { controller, onPointerDown$, contextMenuService } = createController({ focusingDrawing: true });
        const event = { button: 2, offsetX: 10, offsetY: 20 };

        onPointerDown$.emit(event);

        expect(contextMenuService.triggerContextMenu).toHaveBeenCalledWith(event, ContextMenuPosition.DRAWING);
        controller.dispose();
    });

    it('does not open context menu for checklist bullets or selections inside code blocks', () => {
        const bullet = createController({ pointerOnBullet: true });
        bullet.onPointerDown$.emit({ button: 2, offsetX: 10, offsetY: 20 });
        expect(bullet.contextMenuService.triggerContextMenu).not.toHaveBeenCalled();
        bullet.controller.dispose();

        const codeBlock = createController({
            textRanges: [{ startOffset: 5, endOffset: 8 }],
            blockRanges: [{ startIndex: 1, endIndex: 10, blockType: DocumentBlockRangeType.CODE }],
        });
        expect(codeBlock.keyboardMenu()).toBeUndefined();
        codeBlock.onPointerDown$.emit({ button: 2, offsetX: 10, offsetY: 20 });
        expect(codeBlock.contextMenuService.triggerContextMenu).not.toHaveBeenCalled();
        codeBlock.controller.dispose();
    });

    it.each([[false, ContextMenuPosition.MAIN_AREA], [true, ContextMenuPosition.DRAWING]] as const)(
        'opens the keyboard menu for the active paragraph in its own segment (drawing focused: %s)',
        (focusingDrawing, position) => {
            const { controller, events, keyboardMenu, contextMenuService } = createController({ focusingDrawing });
            expect(keyboardMenu()).toBe(true);
            expect(events.contextMenuParagraph).toEqual({ unitId: 'doc-1', segmentId: 'header', paragraphId: 'selected' });
            expect(contextMenuService.triggerContextMenu).toHaveBeenCalledWith(expect.anything(), position, { autoFocus: true, unitId: 'doc-1' });
            controller.dispose();
        }
    );

    it('hides an open context menu after document text is edited', () => {
        const { controller, contextMenuService, commandHandler } = createController({ menuVisible: true });

        commandHandler()?.({ id: RichTextEditingMutation.id });

        expect(contextMenuService.hideContextMenu).toHaveBeenCalled();
        controller.dispose();
    });
});
