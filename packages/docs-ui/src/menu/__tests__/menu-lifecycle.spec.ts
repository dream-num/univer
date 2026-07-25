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

import type { Subscriber } from 'rxjs';
import { ICommandService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { DocumentEditArea, IRenderManagerService } from '@univerjs/engine-render';
import { Observable } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { HeaderFooterMenuItemFactory, TableMenuFactory } from '../menu';

function createTrackedObservable<T>() {
    const subscribers = new Set<Subscriber<T>>();
    const observable = new Observable<T>((subscriber) => {
        subscribers.add(subscriber);
        return () => subscribers.delete(subscriber);
    });

    return {
        observable,
        emit: (value: T) => subscribers.forEach((subscriber) => subscriber.next(value)),
        get subscriberCount() {
            return subscribers.size;
        },
    };
}

describe('doc menu observable lifecycles', () => {
    it('disposes header and footer menu listeners when no document is active', () => {
        const focused = createTrackedObservable<string | null>();
        let commandListenerCount = 0;
        const univerInstanceService = {
            focused$: focused.observable,
            getCurrentUnitOfType: () => null,
            getFocusedUnit: () => null,
            getUnit: () => null,
            getUnitType: () => UniverInstanceType.UNIVER_DOC,
        };
        const commandService = {
            onCommandExecuted: () => {
                commandListenerCount++;
                return { dispose: () => commandListenerCount-- };
            },
        };
        const accessor = {
            get: (token: unknown) => {
                if (token === IUniverInstanceService) return univerInstanceService;
                if (token === ICommandService) return commandService;
                throw new Error('Unexpected dependency');
            },
        };

        const subscription = HeaderFooterMenuItemFactory(accessor as never).hidden$!.subscribe();
        expect(focused.subscriberCount).toBe(2);
        expect(commandListenerCount).toBe(1);

        subscription.unsubscribe();
        expect(focused.subscriberCount).toBe(0);
        expect(commandListenerCount).toBe(0);
    });

    it('replaces and disposes the table menu edit-area listener when focus changes', () => {
        const focused = createTrackedObservable<string | null>();
        const editArea = createTrackedObservable<DocumentEditArea>();
        const viewModel = { editAreaChange$: editArea.observable };
        const univerInstanceService = {
            focused$: focused.observable,
            getCurrentUnitOfType: () => null,
            getFocusedUnit: () => null,
            getUnitType: () => UniverInstanceType.UNIVER_DOC,
        };
        const renderManagerService = {
            getRenderUnitById: () => ({
                with: () => ({ getViewModel: () => viewModel }),
            }),
        };
        const accessor = {
            get: (token: unknown) => {
                if (token === IUniverInstanceService) return univerInstanceService;
                if (token === IRenderManagerService) return renderManagerService;
                if (token === DocSelectionManagerService) return {};
                throw new Error('Unexpected dependency');
            },
        };

        const subscription = TableMenuFactory(accessor as never).hidden$!.subscribe();
        focused.emit('doc-1');
        expect(editArea.subscriberCount).toBe(1);

        focused.emit('doc-2');
        expect(editArea.subscriberCount).toBe(1);

        editArea.emit(DocumentEditArea.BODY);
        subscription.unsubscribe();
        expect(editArea.subscriberCount).toBe(0);
    });
});
