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

import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DeleteSearchKeyCommand } from '../../commands/commands/doc-quick-insert.command';
import { KeywordInputPlaceholder } from '../../views/KeywordInputPlaceholder';
import { QuickInsertPopup } from '../../views/QuickInsertPopup';
import { DocQuickInsertPopupService } from '../doc-quick-insert-popup.service';

function createPopupDisposable() {
    return {
        dispose: vi.fn(),
        canDispose: vi.fn(() => true),
    };
}

function createServiceTestBed() {
    let dataStream = '/';
    const paragraphBound = {
        firstLine: { left: 0, top: 0, right: 10, bottom: 20 },
    };
    const popupEntries: Array<{
        rect: unknown;
        popup: { componentKey: string; extraProps?: unknown };
        disposable: ReturnType<typeof createPopupDisposable>;
    }> = [];
    const activeRange = {
        startOffset: 1,
        endOffset: 1,
        segmentId: '',
        segmentPage: -1,
    };
    const glyph = {
        content: '\r',
        ts: { fs: 11, ff: 'Arial' },
        fontStyle: {
            fontString: '14.6666666667px Arial',
            fontFamily: 'Arial',
        },
        bBox: {
            ba: 10,
            bd: 4,
        },
    };
    const docDataModel = {
        getBody: () => ({
            dataStream,
            paragraphs: [{ startIndex: 1 }],
        }),
    };
    const docEventManagerService = {
        findParagraphBoundByIndex: vi.fn(() => paragraphBound),
    };
    const skeleton = {
        findNodeByCharIndex: vi.fn(() => glyph),
        findNodePositionByCharIndex: vi.fn(() => undefined),
    };
    const currentRender = {
        with: vi.fn((token: unknown) => {
            const name = (token as { name?: string })?.name;
            if (name === 'DocEventManagerService') {
                return docEventManagerService;
            }
            if (name === 'DocSkeletonManagerService') {
                return { getSkeleton: () => skeleton };
            }
            return undefined;
        }),
        mainComponent: {
            getOffsetConfig: () => ({ docsLeft: 0, docsTop: 0 }),
        },
    };
    const docCanvasPopupManagerService = {
        attachPopupToRect: vi.fn((rect: unknown, popup: { componentKey: string; extraProps?: unknown }) => {
            const disposable = createPopupDisposable();
            popupEntries.push({ rect, popup, disposable });
            return disposable;
        }),
    };
    const commandService = {
        syncExecuteCommand: vi.fn(() => true),
    };

    const service = new DocQuickInsertPopupService(
        docCanvasPopupManagerService as never,
        {
            getCurrentUnitOfType: vi.fn(() => docDataModel),
            getUnit: vi.fn(() => docDataModel),
        } as never,
        commandService as never,
        {
            getRenderById: vi.fn(() => currentRender),
        } as never,
        {
            getActiveTextRange: vi.fn(() => activeRange),
        } as never
    );

    return {
        service,
        popupEntries,
        commandService,
        paragraphBound,
        setDataStream: (value: string) => {
            dataStream = value;
        },
    };
}

describe('DocQuickInsertPopupService', () => {
    it('registers popups, resolves them by trigger and emits selected menus after deleting the search key', () => {
        vi.useFakeTimers();

        const { service, commandService } = createServiceTestBed();
        const popup = {
            keyword: '/',
            menus$: of([]),
        };
        const menu = {
            id: 'menu-1',
            title: 'Text',
        };
        const onSelected = vi.fn();

        const unregisterPopup = service.registerPopup(popup);
        const unregisterHandler = service.onMenuSelected(onSelected);

        expect(service.resolvePopup('/')).toBe(popup);

        service.setInputOffset({ start: 2, end: 4 });
        service.emitMenuSelected(menu as never);

        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(DeleteSearchKeyCommand.id, { start: 2, end: 4 });
        expect(onSelected).not.toHaveBeenCalled();

        vi.runAllTimers();
        expect(onSelected).toHaveBeenCalledWith(menu);

        unregisterHandler();
        unregisterPopup();
        expect(service.resolvePopup('/')).toBeUndefined();

        service.dispose();
        vi.useRealTimers();
    });

    it('shows the popup on an empty line and remounts the keyword placeholder as input state changes', () => {
        const { service, popupEntries, setDataStream } = createServiceTestBed();
        const popup = {
            keyword: '/',
            menus$: of([]),
        };

        service.showPopup({ popup, index: 0, unitId: 'doc-1' });

        expect(popupEntries).toHaveLength(2);
        expect(popupEntries[0].popup.componentKey).toBe(KeywordInputPlaceholder.componentKey);
        expect(popupEntries[1].popup.componentKey).toBe(QuickInsertPopup.componentKey);
        expect(service.editPopup).toEqual(expect.objectContaining({ popup, anchor: 0, unitId: 'doc-1' }));

        setDataStream('/a');
        service.setInputOffset({ start: 0, end: 2 });
        expect(popupEntries[0].disposable.dispose).toHaveBeenCalledTimes(1);

        setDataStream('/');
        service.setInputOffset({ start: 0, end: 1 });
        expect(popupEntries).toHaveLength(3);
        expect(popupEntries[2].popup.componentKey).toBe(KeywordInputPlaceholder.componentKey);

        service.setIsComposing(true);
        expect(popupEntries[2].disposable.dispose).toHaveBeenCalledTimes(1);

        service.setIsComposing(false);
        expect(popupEntries).toHaveLength(4);
        expect(popupEntries[3].popup.componentKey).toBe(KeywordInputPlaceholder.componentKey);

        service.closePopup();
        expect(popupEntries[1].disposable.dispose).toHaveBeenCalledTimes(1);
        expect(popupEntries[3].disposable.dispose).toHaveBeenCalledTimes(1);
        expect(service.editPopup).toBeNull();

        service.dispose();
    });
});
