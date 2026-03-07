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
import type { IFindReplaceProvider } from '../../../services/find-replace.service';
import { ICommandService } from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestBed, IFindReplaceService } from '../../../__tests__/create-test-bed';
import { FindReplaceService } from '../../../services/find-replace.service';
import {
    FocusSelectionOperation,
    GoToNextMatchOperation,
    GoToPreviousMatchOperation,
    OpenFindDialogOperation,
    OpenReplaceDialogOperation,
} from '../find-replace.operation';

function createProvider(): IFindReplaceProvider {
    return {
        find: vi.fn(async () => []),
        terminate: vi.fn(),
    };
}

describe('find-replace.operation', () => {
    let univer: Univer;
    let get: Injector['get'];

    beforeEach(() => {
        const testBed = createTestBed(undefined, [[IFindReplaceService, { useClass: FindReplaceService }]]);
        univer = testBed.univer;
        get = testBed.get;

        const commandService = get(ICommandService);
        [
            OpenFindDialogOperation,
            OpenReplaceDialogOperation,
            GoToNextMatchOperation,
            GoToPreviousMatchOperation,
            FocusSelectionOperation,
        ].forEach((op) => commandService.registerCommand(op));
    });

    afterEach(() => {
        univer.dispose();
    });

    it('should open find dialog or focus input based on reveal state', () => {
        const commandService = get(ICommandService);
        const findReplaceService = get(IFindReplaceService);
        findReplaceService.registerFindReplaceProvider(createProvider());

        const startSpy = vi.spyOn(findReplaceService, 'start');
        const focusSpy = vi.spyOn(findReplaceService, 'focusFindInput');

        expect(commandService.syncExecuteCommand(OpenFindDialogOperation.id)).toBe(true);
        expect(startSpy).toHaveBeenCalledTimes(1);
        expect(focusSpy).not.toHaveBeenCalled();

        expect(commandService.syncExecuteCommand(OpenFindDialogOperation.id)).toBe(true);
        expect(focusSpy).toHaveBeenCalledTimes(1);
    });

    it('should open replace dialog with proper branching', () => {
        const commandService = get(ICommandService);

        const hiddenService = get(IFindReplaceService);
        hiddenService.registerFindReplaceProvider(createProvider());
        const hiddenStartSpy = vi.spyOn(hiddenService, 'start');
        expect(commandService.syncExecuteCommand(OpenReplaceDialogOperation.id)).toBe(true);
        expect(hiddenStartSpy).toHaveBeenCalledWith(true);
        hiddenService.terminate();

        const revealService = get(IFindReplaceService);
        revealService.registerFindReplaceProvider(createProvider());
        revealService.start();
        const revealSpy = vi.spyOn(revealService, 'revealReplace');
        expect(commandService.syncExecuteCommand(OpenReplaceDialogOperation.id)).toBe(true);
        expect(revealSpy).toHaveBeenCalledTimes(1);
        revealService.terminate();

        const focusService = get(IFindReplaceService);
        focusService.registerFindReplaceProvider(createProvider());
        focusService.start(true);
        const focusSpy = vi.spyOn(focusService, 'focusFindInput');
        expect(commandService.syncExecuteCommand(OpenReplaceDialogOperation.id)).toBe(true);
        expect(focusSpy).toHaveBeenCalledTimes(1);
    });

    it('should route next/previous/focus operations to the service', () => {
        const commandService = get(ICommandService);
        const service = get(IFindReplaceService);

        const nextSpy = vi.spyOn(service, 'moveToNextMatch');
        const previousSpy = vi.spyOn(service, 'moveToPreviousMatch');
        const focusSpy = vi.spyOn(service, 'focusSelection');

        expect(commandService.syncExecuteCommand(GoToNextMatchOperation.id)).toBe(true);
        expect(commandService.syncExecuteCommand(GoToPreviousMatchOperation.id)).toBe(true);
        expect(commandService.syncExecuteCommand(FocusSelectionOperation.id)).toBe(true);

        expect(nextSpy).toHaveBeenCalledTimes(1);
        expect(previousSpy).toHaveBeenCalledTimes(1);
        expect(focusSpy).toHaveBeenCalledTimes(1);
    });
});
