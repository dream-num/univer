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

import { EDITOR_ACTIVATED, FOCUSING_SHEET, IContextService, Univer } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import { FIND_REPLACE_AVAILABLE } from '../../services/context-keys';
import { FindReplaceMenuItemFactory } from '../find-replace.menu';

describe('FindReplaceMenuItemFactory', () => {
    let univer: Univer | undefined;

    afterEach(() => {
        univer?.dispose();
        univer = undefined;
    });

    it.each([
        { availability: undefined, disabled: true, label: 'not initialized' },
        { availability: false, disabled: true, label: 'unavailable' },
        { availability: true, disabled: false, label: 'available' },
    ])('reflects a $label provider before any context changes', ({ availability, disabled }) => {
        univer = new Univer();
        const injector = univer.__getInjector();
        const contextService = injector.get(IContextService);
        contextService.setContextValue(EDITOR_ACTIVATED, false);
        contextService.setContextValue(FOCUSING_SHEET, true);
        if (availability !== undefined) {
            contextService.setContextValue(FIND_REPLACE_AVAILABLE, availability);
        }

        const values: boolean[] = [];
        const subscription = FindReplaceMenuItemFactory(injector).disabled$!.subscribe((value) => values.push(value));
        try {
            expect(values.length).toBeGreaterThan(0);
            expect(values[values.length - 1]).toBe(disabled);
        } finally {
            subscription.unsubscribe();
        }
    });

    it('tracks provider readiness and removal while preserving editor and focus restrictions', () => {
        univer = new Univer();
        const injector = univer.__getInjector();
        const contextService = injector.get(IContextService);
        contextService.setContextValue(EDITOR_ACTIVATED, false);
        contextService.setContextValue(FOCUSING_SHEET, true);
        const values: boolean[] = [];
        const subscription = FindReplaceMenuItemFactory(injector).disabled$!.subscribe((value) => values.push(value));
        try {
            expect(values[values.length - 1]).toBe(true);
            contextService.setContextValue(FIND_REPLACE_AVAILABLE, true);
            expect(values[values.length - 1]).toBe(false);
            contextService.setContextValue(EDITOR_ACTIVATED, true);
            expect(values[values.length - 1]).toBe(true);
            contextService.setContextValue(EDITOR_ACTIVATED, false);
            expect(values[values.length - 1]).toBe(false);
            contextService.setContextValue(FOCUSING_SHEET, false);
            expect(values[values.length - 1]).toBe(true);
            contextService.setContextValue(FOCUSING_SHEET, true);
            expect(values[values.length - 1]).toBe(false);
            contextService.setContextValue(FIND_REPLACE_AVAILABLE, false);
            expect(values[values.length - 1]).toBe(true);
        } finally {
            subscription.unsubscribe();
        }
        const finalCount = values.length;
        contextService.setContextValue(FIND_REPLACE_AVAILABLE, true);
        expect(values).toHaveLength(finalCount);
    });
});
