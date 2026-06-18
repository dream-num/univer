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

import { DocumentBlockRangeType, UniverInstanceType } from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { ContextMenuPosition } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { DocContextMenuRenderController } from '../doc-contextmenu.render-controller';

function createEventSubject() {
    const subscribers = new Set<(evt: any) => void>();

    return {
        subscribeEvent: vi.fn((handler: (evt: any) => void) => {
            subscribers.add(handler);
            const unsubscribe = vi.fn(() => subscribers.delete(handler));
            return { dispose: unsubscribe, unsubscribe };
        }),
        emit: (evt: any) => subscribers.forEach((handler) => handler(evt)),
    };
}

function createController(options?: {
    pointerOnBullet?: boolean;
    textRanges?: Array<{ startOffset: number; endOffset: number }>;
    blockRanges?: Array<{ startIndex: number; endIndex: number; blockType: DocumentBlockRangeType }>;
    menuVisible?: boolean;
}) {
    const onPointerDown$ = createEventSubject();
    let commandHandler: ((command: { id: string }) => void) | undefined;
    const contextMenuService = {
        visible: options?.menuVisible ?? false,
        triggerContextMenu: vi.fn(),
        hideContextMenu: vi.fn(),
    };
    const controller = new DocContextMenuRenderController(
        {
            unitId: 'doc-1',
            mainComponent: { onPointerDown$ },
        } as never,
        contextMenuService as never,
        {
            onCommandExecuted: vi.fn((handler) => {
                commandHandler = handler;
                return { dispose: vi.fn() };
            }),
        } as never,
        { isPointerOnNonChecklistBullet: vi.fn(() => options?.pointerOnBullet ?? false) } as never,
        { getTextRanges: vi.fn(() => options?.textRanges ?? []) } as never,
        {
            getCurrentUnitOfType: vi.fn((type) => type === UniverInstanceType.UNIVER_DOC
                ? { getBody: () => ({ blockRanges: options?.blockRanges ?? [] }) }
                : null),
        } as never
    );

    return { controller, onPointerDown$, contextMenuService, commandHandler: () => commandHandler };
}

describe('DocContextMenuRenderController', () => {
    it('opens the main-area context menu on right click when the selection is normal document text', () => {
        const { controller, onPointerDown$, contextMenuService } = createController();
        const event = { button: 2, offsetX: 10, offsetY: 20 };

        onPointerDown$.emit(event);

        expect(contextMenuService.triggerContextMenu).toHaveBeenCalledWith(event, ContextMenuPosition.MAIN_AREA);
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
        codeBlock.onPointerDown$.emit({ button: 2, offsetX: 10, offsetY: 20 });
        expect(codeBlock.contextMenuService.triggerContextMenu).not.toHaveBeenCalled();
        codeBlock.controller.dispose();
    });

    it('hides an open context menu after document text is edited', () => {
        const { controller, contextMenuService, commandHandler } = createController({ menuVisible: true });

        commandHandler()?.({ id: RichTextEditingMutation.id });

        expect(contextMenuService.hideContextMenu).toHaveBeenCalled();
        controller.dispose();
    });
});
