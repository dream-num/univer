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

import type {
    IDisposable,
    IDocumentData,
    IListMentionParam,
    IListMentionResponse,
    IMention,
    ITypeMentionList,
    Univer,
} from '@univerjs/core';
import type { Root } from 'react-dom/client';
import { CustomRangeType, ICommandService, IMentionIOService, MentionType, toDisposable } from '@univerjs/core';
import { DocSelectionManagerService, RichTextEditingMutation, SetTextSelectionsOperation } from '@univerjs/docs';
import { DocCanvasPopManagerService, IEditorService } from '@univerjs/docs-ui';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDocUiTestBed } from '../../__tests__/create-doc-ui-test-bed';
import { AddDocMentionCommand } from '../../commands/commands/doc-mention.command';
import { DocMentionPopupService } from '../../services/doc-mention-popup.service';
import { DocMentionService } from '../../services/doc-mention.service';
import { MentionEditPopup } from '../MentionEditPopup';
import { MentionList } from '../MentionList';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const unitId = 'test-doc';

const peopleMentions: ITypeMentionList[] = [{
    type: MentionType.PERSON,
    title: 'PEOPLE',
    metadata: {},
    mentions: [{
        objectType: MentionType.PERSON,
        objectId: 'alice',
        label: 'Alice',
        metadata: {
            icon: 'alice.png',
            email: 'alice@example.invalid',
        },
    }, {
        objectType: MentionType.PERSON,
        objectId: 'alex',
        label: 'Alex',
        metadata: {
            icon: 'alex.png',
            email: 'alex@example.invalid',
        },
    }],
}];

class TestMentionState {
    static selectedLabels: string[] = [];
    static popupClicks = 0;

    static reset(): void {
        this.selectedLabels = [];
        this.popupClicks = 0;
    }
}

class TestMentionIOService {
    readonly requests: IListMentionParam[] = [];

    async list(params: IListMentionParam): Promise<IListMentionResponse> {
        this.requests.push(params);

        return {
            list: peopleMentions,
            total: peopleMentions[0].mentions.length,
        };
    }
}

class TestEditorService {
    readonly focusedUnitIds: string[] = [];
    readonly blur$ = new Subject<unknown>();
    readonly focus$ = new Subject<unknown>();

    getEditor(): null {
        return null;
    }

    register(): IDisposable {
        return toDisposable(() => {});
    }

    getAllEditor(): Map<string, never> {
        return new Map();
    }

    isEditor(): boolean {
        return true;
    }

    getEditorRenderConfig(): null {
        return null;
    }

    isSheetEditor(): boolean {
        return false;
    }

    blur(): void {
        this.blur$.next(null);
    }

    focus(editorUnitId: string): void {
        this.focusedUnitIds.push(editorUnitId);
        this.focus$.next({ startOffset: 0, endOffset: 0 });
    }

    getFocusId(): string | null {
        return this.focusedUnitIds.at(-1) ?? null;
    }

    getFocusEditor(): null {
        return null;
    }
}

class TestDocCanvasPopManagerService {
    readonly attached: unknown[] = [];
    readonly disposed: unknown[] = [];

    attachPopupToRange(range: unknown, popup: unknown, editorUnitId: string) {
        this.attached.push({ range, popup, unitId: editorUnitId });

        return {
            dispose: () => this.disposed.push({ range, popup, unitId: editorUnitId }),
        };
    }
}

function createMentionDraftDocData(): IDocumentData {
    return {
        id: unitId,
        body: {
            dataStream: 'Hello @al\r\n',
        },
        documentStyle: {
            pageSize: {
                width: 594.3,
                height: 840.51,
            },
            marginTop: 72,
            marginBottom: 72,
            marginRight: 90,
            marginLeft: 90,
        },
    };
}

function renderIntoDocument(element: React.ReactElement, injector: ReturnType<typeof createDocUiTestBed>['injector']) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
        root.render(
            <RediContext.Provider value={{ injector }}>
                {element}
            </RediContext.Provider>
        );
    });

    return { container, root };
}

function disposeRender(root?: Root, container?: HTMLElement): IDisposable {
    return toDisposable(() => {
        if (root) {
            act(() => root.unmount());
        }
        container?.remove();
    });
}

function listItems(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>('div[data-editorid] div[data-editorid]'));
}

function hasClassToken(element: HTMLElement, token: string): boolean {
    return element.className.split(/\s+/).includes(token);
}

function createViewsTestBed() {
    const testBed = createDocUiTestBed(createMentionDraftDocData(), [
        [DocCanvasPopManagerService, { useClass: TestDocCanvasPopManagerService as unknown as typeof DocCanvasPopManagerService }],
        [DocMentionService],
        [DocMentionPopupService],
        [IMentionIOService, { useClass: TestMentionIOService }],
        [IEditorService, { useClass: TestEditorService as never }],
    ]);
    const commandService = testBed.get(ICommandService);
    commandService.registerCommand(AddDocMentionCommand);
    commandService.registerCommand(RichTextEditingMutation);
    commandService.registerCommand(SetTextSelectionsOperation);

    const selectionManager = testBed.get(DocSelectionManagerService);
    selectionManager.__TEST_ONLY_setCurrentSelection({
        unitId,
        subUnitId: unitId,
    });

    return {
        ...testBed,
        commandService,
        selectionManager,
        mentionIOService: testBed.get(IMentionIOService) as TestMentionIOService,
        editorService: testBed.get(IEditorService) as unknown as TestEditorService,
        popupService: testBed.get(DocMentionPopupService),
    };
}

describe('mention views', () => {
    let univer: Univer | null = null;
    let disposable: IDisposable | undefined;

    beforeEach(() => {
        TestMentionState.reset();
    });

    afterEach(() => {
        disposable?.dispose();
        disposable = undefined;
        univer?.dispose();
        univer = null;
    });

    it('promotes the hovered mention to the active row and selects that item on click', () => {
        const testBed = createDocUiTestBed();
        univer = testBed.univer;
        const rendered = renderIntoDocument(
            <MentionList
                active="alice"
                editorId={unitId}
                mentions={peopleMentions}
                onClick={() => TestMentionState.popupClicks += 1}
                onSelect={(item: IMention) => TestMentionState.selectedLabels.push(item.label)}
            />,
            testBed.injector
        );
        disposable = disposeRender(rendered.root, rendered.container);

        const items = listItems(rendered.container);
        expect(hasClassToken(items[0], 'univer-bg-gray-50')).toBe(true);
        expect(hasClassToken(items[1], 'univer-bg-gray-50')).toBe(false);

        act(() => {
            items[1].dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: rendered.container }));
        });
        expect(hasClassToken(items[0], 'univer-bg-gray-50')).toBe(false);
        expect(hasClassToken(items[1], 'univer-bg-gray-50')).toBe(true);

        act(() => {
            items[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        expect(TestMentionState.selectedLabels).toEqual(['Alex']);
        expect(TestMentionState.popupClicks).toBe(1);
    });

    it('queries by the current typed mention text and inserts the selected mention into the document', async () => {
        const testBed = createViewsTestBed();
        univer = testBed.univer;
        testBed.popupService.showEditPopup(unitId, 6);
        testBed.selectionManager.__replaceTextRangesWithNoRefresh({
            textRanges: [{
                startOffset: 9,
                endOffset: 9,
                collapsed: true,
                isActive: true,
                segmentId: '',
                style: null as never,
            }],
            rectRanges: [],
            segmentId: '',
            segmentPage: -1,
            isEditing: true,
            style: null as never,
        }, {
            unitId,
            subUnitId: unitId,
        });

        const rendered = renderIntoDocument(<MentionEditPopup />, testBed.injector);
        disposable = disposeRender(rendered.root, rendered.container);

        await act(async () => {
            await Promise.resolve();
        });

        expect(testBed.mentionIOService.requests).toEqual([{
            unitId,
            search: '@al',
        }]);

        const aliceItem = listItems(rendered.container)[0];
        await act(async () => {
            aliceItem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await Promise.resolve();
        });

        const body = testBed.doc.getBody();
        expect(body?.dataStream).toBe('Hello @Alice\r\n');
        expect(body?.customRanges?.[0]).toMatchObject({
            startIndex: 6,
            endIndex: 11,
            rangeType: CustomRangeType.MENTION,
            wholeEntity: true,
            properties: {
                objectType: MentionType.PERSON,
                objectId: 'alice',
                label: 'Alice',
                email: 'alice@example.invalid',
            },
        });
        expect(testBed.popupService.editPopup).toBeNull();
        expect(testBed.editorService.focusedUnitIds).toEqual([unitId, unitId]);
    });
});
