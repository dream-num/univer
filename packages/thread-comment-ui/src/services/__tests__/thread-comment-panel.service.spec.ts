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

import type { IWorkbookData } from '@univerjs/core';
import { LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { DesktopSidebarService, ISidebarService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ThreadCommentPanelService } from '../thread-comment-panel.service';

const workbookData: IWorkbookData = {
    id: 'panel-service-workbook',
    appVersion: '3.0.0-alpha',
    locale: LocaleType.EN_US,
    name: 'panel service workbook',
    sheetOrder: ['sheet-1'],
    styles: {},
    sheets: {
        'sheet-1': {
            id: 'sheet-1',
            name: 'Sheet 1',
            cellData: {},
        },
    },
};

describe('ThreadCommentPanelService', () => {
    let univer: Univer;
    let service: ThreadCommentPanelService;
    let sidebarService: ISidebarService;

    beforeEach(() => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([ISidebarService, { useClass: DesktopSidebarService }]);
        injector.add([ThreadCommentPanelService]);

        univer.createUnit(UniverInstanceType.UNIVER_SHEET, workbookData);
        service = injector.get(ThreadCommentPanelService);
        sidebarService = injector.get(ISidebarService);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('hides the comment panel when the host sidebar closes', () => {
        const visibleStates: boolean[] = [];
        service.panelVisible$.subscribe((visible) => visibleStates.push(visible));

        service.setPanelVisible(true);
        service.setHoveredComment({ unitId: 'book-1', subUnitId: 'sheet-1', commentId: 'c-1' });
        sidebarService.open({});
        sidebarService.close();

        expect(service.panelVisible).toBe(false);
        expect(service.hoveredCommentId).toBeUndefined();
        expect(visibleStates).toEqual([false, true, false]);
    });

    it('publishes the active thread comment selected by the user', () => {
        const activeComments: unknown[] = [];
        service.activeCommentId$.subscribe((comment) => activeComments.push(comment));

        service.setActiveComment({ unitId: 'book-1', subUnitId: 'sheet-1', commentId: 'c-1', trigger: 'cell' });

        expect(service.activeCommentId).toEqual({ unitId: 'book-1', subUnitId: 'sheet-1', commentId: 'c-1', trigger: 'cell' });
        expect(activeComments.at(-1)).toEqual({ unitId: 'book-1', subUnitId: 'sheet-1', commentId: 'c-1', trigger: 'cell' });
    });

    it('publishes the thread comment hovered in the panel', () => {
        const hoveredComments: unknown[] = [];
        service.hoveredCommentId$.subscribe((comment) => hoveredComments.push(comment));

        service.setHoveredComment({
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            commentId: 'c-1',
            trigger: 'panel-hover',
        });
        service.setHoveredComment(undefined);

        expect(service.hoveredCommentId).toBeUndefined();
        expect(hoveredComments).toEqual([
            undefined,
            {
                unitId: 'book-1',
                subUnitId: 'sheet-1',
                commentId: 'c-1',
                trigger: 'panel-hover',
            },
            undefined,
        ]);
    });
});
