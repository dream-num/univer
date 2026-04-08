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

import type { Injector, Univer } from '@univerjs/core';
import { EDITOR_ACTIVATED, FOCUSING_SHEET, IContextService } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestBed } from '../../__tests__/create-test-bed';
import {
    FIND_REPLACE_DIALOG_FOCUS,
    FIND_REPLACE_INPUT_FOCUS,
    FIND_REPLACE_REPLACE_REVEALED,
} from '../../services/context-keys';
import {
    FocusSelectionShortcutItem,
    GoToNextFindMatchShortcutItem,
    GoToPreviousFindMatchShortcutItem,
    MacOpenFindDialogShortcutItem,
    OpenFindDialogShortcutItem,
    OpenReplaceDialogShortcutItem,
} from '../find-replace.shortcut';

describe('find-replace.shortcut', () => {
    let univer: Univer;
    let get: Injector['get'];
    let contextService: IContextService;

    beforeEach(() => {
        const testBed = createTestBed();
        univer = testBed.univer;
        get = testBed.get;
        contextService = get(IContextService);
    });

    afterEach(() => {
        univer.dispose();
    });

    it('should require sheet focus and editor inactivity for opening find dialog', () => {
        contextService.setContextValue(FIND_REPLACE_DIALOG_FOCUS, false);
        contextService.setContextValue(FOCUSING_SHEET, true);
        contextService.setContextValue(EDITOR_ACTIVATED, false);

        expect(OpenFindDialogShortcutItem.preconditions!(contextService)).toBe(true);
        expect(MacOpenFindDialogShortcutItem.preconditions!(contextService)).toBe(true);

        contextService.setContextValue(FIND_REPLACE_DIALOG_FOCUS, true);
        expect(OpenFindDialogShortcutItem.preconditions!(contextService)).toBe(false);
    });

    it('should open replace dialog only when dialog is hidden or replace is not revealed', () => {
        contextService.setContextValue(FIND_REPLACE_DIALOG_FOCUS, false);
        contextService.setContextValue(FIND_REPLACE_REPLACE_REVEALED, false);
        contextService.setContextValue(FOCUSING_SHEET, true);
        contextService.setContextValue(EDITOR_ACTIVATED, false);
        expect(OpenReplaceDialogShortcutItem.preconditions!(contextService)).toBe(true);

        contextService.setContextValue(FIND_REPLACE_DIALOG_FOCUS, true);
        contextService.setContextValue(FIND_REPLACE_REPLACE_REVEALED, true);
        expect(OpenReplaceDialogShortcutItem.preconditions!(contextService)).toBe(false);
    });

    it('should require input and dialog focus for next/previous actions', () => {
        contextService.setContextValue(FIND_REPLACE_INPUT_FOCUS, true);
        contextService.setContextValue(FIND_REPLACE_DIALOG_FOCUS, true);
        expect(GoToNextFindMatchShortcutItem.preconditions!(contextService)).toBe(true);
        expect(GoToPreviousFindMatchShortcutItem.preconditions!(contextService)).toBe(true);

        contextService.setContextValue(FIND_REPLACE_INPUT_FOCUS, false);
        expect(GoToNextFindMatchShortcutItem.preconditions!(contextService)).toBe(false);
    });

    it('should focus selection when dialog is focused', () => {
        contextService.setContextValue(FIND_REPLACE_DIALOG_FOCUS, true);
        expect(FocusSelectionShortcutItem.preconditions!(contextService)).toBe(true);
        contextService.setContextValue(FIND_REPLACE_DIALOG_FOCUS, false);
        expect(FocusSelectionShortcutItem.preconditions!(contextService)).toBe(false);
    });
});
