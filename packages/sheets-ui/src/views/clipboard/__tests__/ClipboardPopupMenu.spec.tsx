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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import type { ReactElement } from 'react';
import type { Root } from 'react-dom/client';
import {
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    ObjectMatrix,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { SheetOptionalPasteCommand } from '../../../commands/commands/clipboard.command';
import { ISheetClipboardService, PREDEFINED_HOOK_NAME_PASTE } from '../../../services/clipboard/clipboard.service';
import { ISheetSelectionRenderService } from '../../../services/selection/base-selection-render.service';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';
import { ClipboardPopupMenu } from '../ClipboardPopupMenu';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const UNIT_ID = 'clipboard-popup-unit';
const SHEET_ID = 'sheet-1';

class TestSheetClipboardService {
    private readonly _showMenu$ = new BehaviorSubject(false);
    readonly showMenu$ = this._showMenu$.asObservable();

    private readonly _pasteOptionsCache$ = new BehaviorSubject({
        target: {
            unitId: UNIT_ID,
            subUnitId: SHEET_ID,
            pastedRange: { rows: [0, 1], cols: [0, 1] },
        },
        cellMatrix: new ObjectMatrix(),
        pasteType: PREDEFINED_HOOK_NAME_PASTE.DEFAULT_PASTE,
    });

    readonly pasteOptionsCache$ = this._pasteOptionsCache$.asObservable();
    readonly selectedPasteTypes: string[] = [];

    setShowMenu(show: boolean): void {
        this._showMenu$.next(show);
    }

    getPasteMenuVisible(): boolean {
        return this._showMenu$.getValue();
    }

    getPasteOptionsCache(): unknown {
        return this._pasteOptionsCache$.getValue();
    }

    updatePasteOptionsCache(cache: unknown): void {
        this._pasteOptionsCache$.next(cache as never);
    }

    rePasteWithPasteType(type: string): boolean {
        this.selectedPasteTypes.push(type);
        return true;
    }
}

class TestSheetSkeletonManagerService {
    getCurrentSkeleton() {
        return {
            getNoMergeCellWithCoordByIndex: () => ({ endX: 80, endY: 40 }),
        };
    }
}

class TestSheetSelectionRenderService {
    getViewPort(): object {
        return {};
    }
}

class TestRenderUnit {
    readonly components = new Map();
    readonly mainComponent = {};
    readonly engine = {};
    readonly sheetSkeletonManagerService = new TestSheetSkeletonManagerService();
    readonly selectionRenderService = new TestSheetSelectionRenderService();
    readonly scene = {
        scaleX: 1,
        scaleY: 1,
        getViewportScrollXY: () => ({ x: 0, y: 0 }),
        getEngine: () => ({
            getCanvas: () => ({
                getWidth: () => 400,
                getHeight: () => 300,
            }),
        }),
    };

    with(token: unknown): unknown {
        if (token === SheetSkeletonManagerService) {
            return this.sheetSkeletonManagerService;
        }

        if (token === ISheetSelectionRenderService) {
            return this.selectionRenderService;
        }

        return null;
    }
}

class TestRenderManagerService {
    readonly renderUnit = new TestRenderUnit();

    getRenderById(): TestRenderUnit {
        return this.renderUnit;
    }
}

function createWorkbookData(): IWorkbookData {
    return {
        id: UNIT_ID,
        appVersion: '3.0.0-alpha',
        locale: LocaleType.EN_US,
        name: 'Clipboard Popup',
        sheetOrder: [SHEET_ID],
        styles: {},
        sheets: {
            [SHEET_ID]: {
                id: SHEET_ID,
                name: 'Sheet1',
                cellData: {},
            },
        },
    };
}

function createClipboardPopupTestBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();

    injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    injector.add([ISheetClipboardService, { useClass: TestSheetClipboardService as never }]);

    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, createWorkbookData());
    injector.get(IUniverInstanceService).focusUnit(UNIT_ID);
    injector.get(LocaleService).load({ [LocaleType.EN_US]: {} });
    injector.get(LocaleService).setLocale(LocaleType.EN_US);
    injector.get(ICommandService).registerCommand(SheetOptionalPasteCommand);

    return { univer, injector, workbook };
}

function renderWithDependencies(element: ReactElement, injector: ReturnType<typeof createClipboardPopupTestBed>['injector']) {
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

async function clickElement(element: HTMLElement): Promise<void> {
    await act(async () => {
        element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await Promise.resolve();
    });
}

function getByText(text: string): HTMLElement {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
        if (node.textContent === text) {
            const element = node.parentElement;
            if (element) {
                return element;
            }
        }
        node = walker.nextNode();
    }

    throw new Error(`Text not found: ${text}`);
}

describe('ClipboardPopupMenu', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;
    let currentBed: ReturnType<typeof createClipboardPopupTestBed> | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        currentBed?.univer.dispose();
        document.body.innerHTML = '';
        root = undefined;
        container = undefined;
        currentBed = undefined;
    });

    it('runs optional paste through the command service with the selected paste option', async () => {
        currentBed = createClipboardPopupTestBed();
        const clipboardService = currentBed.injector.get(ISheetClipboardService) as unknown as TestSheetClipboardService;
        const rendered = renderWithDependencies(<ClipboardPopupMenu />, currentBed.injector);
        root = rendered.root;
        container = rendered.container;

        act(() => {
            clipboardService.setShowMenu(true);
        });

        const trigger = rendered.container.querySelector('[data-slot="dropdown-menu-trigger"]');
        if (!(trigger instanceof HTMLElement)) {
            throw new TypeError('Clipboard menu trigger not found');
        }

        await clickElement(trigger);
        await clickElement(getByText('sheets-ui.rightClick.pasteValue'));

        expect(clipboardService.selectedPasteTypes).toEqual(['SPECIAL_PASTE_VALUE']);
    });
});
