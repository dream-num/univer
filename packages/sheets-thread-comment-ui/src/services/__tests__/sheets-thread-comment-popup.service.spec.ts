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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createThreadCommentUiTestBed } from '../../__tests__/create-thread-comment-ui-test-bed';
import { SHEETS_THREAD_COMMENT_MODAL } from '../../types/const';
import { SheetsThreadCommentPopupService } from '../sheets-thread-comment-popup.service';

describe('SheetsThreadCommentPopupService', () => {
    const onHide = vi.fn();
    let testBed: ReturnType<typeof createThreadCommentUiTestBed>;

    beforeEach(() => {
        onHide.mockReset();
        vi.stubGlobal('document', {
            querySelectorAll: vi.fn(() => []),
            getElementById: vi.fn(() => null),
        });
        testBed = createThreadCommentUiTestBed();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        testBed.univer.dispose();
    });

    it('shows, persists and hides the active popup through the popup manager boundary', () => {
        const service = testBed.injector.createInstance(SheetsThreadCommentPopupService);

        service.showPopup({
            unitId: 'test',
            subUnitId: 'sheet1',
            row: 1,
            col: 2,
            commentId: 'comment-1',
            temp: true,
            trigger: 'hover',
        }, onHide);

        expect(service.activePopup).toEqual({
            unitId: 'test',
            subUnitId: 'sheet1',
            row: 1,
            col: 2,
            commentId: 'comment-1',
            temp: true,
            trigger: 'hover',
        });
        expect(testBed.cellPopupManagerService.showPopup).toHaveBeenCalledWith({
            unitId: 'test',
            subUnitId: 'sheet1',
            row: 1,
            col: 2,
        }, expect.objectContaining({
            componentKey: SHEETS_THREAD_COMMENT_MODAL,
            direction: 'horizontal',
        }));

        service.persistPopup();
        expect(service.activePopup).toEqual(expect.objectContaining({
            temp: false,
        }));

        service.hidePopup();
        expect(service.activePopup).toBeNull();
        expect(testBed.popupDisposable.dispose).toHaveBeenCalled();
        expect(onHide).toHaveBeenCalledTimes(1);
    });

    it('does not open while zen mode is visible and hides when zen mode turns on', () => {
        const service = testBed.injector.createInstance(SheetsThreadCommentPopupService);

        testBed.zenVisible$.next(true);
        service.showPopup({
            unitId: 'test',
            subUnitId: 'sheet1',
            row: 4,
            col: 5,
            commentId: 'comment-2',
        });
        expect(service.activePopup).toBeUndefined();
        expect(testBed.cellPopupManagerService.showPopup).not.toHaveBeenCalled();

        testBed.zenVisible$.next(false);
        service.showPopup({
            unitId: 'test',
            subUnitId: 'sheet1',
            row: 4,
            col: 5,
            commentId: 'comment-2',
        });
        expect(service.activePopup).toEqual(expect.objectContaining({
            commentId: 'comment-2',
        }));

        testBed.zenVisible$.next(true);
        expect(service.activePopup).toBeNull();
    });
});
