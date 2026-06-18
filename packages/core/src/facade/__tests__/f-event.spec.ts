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

import { describe, expect, it } from 'vitest';
import { FEventName } from '../f-event';

describe('FEventName', () => {
    it('should expose the event names used by document, command and undo-redo facade flows', () => {
        FEventName._instance = null;

        const eventName = FEventName.get();

        expect(eventName).toBe(FEventName.get());
        expect(eventName.DocCreated).toBe('DocCreated');
        expect(eventName.DocDisposed).toBe('DocDisposed');
        expect(eventName.LifeCycleChanged).toBe('LifeCycleChanged');
        expect(eventName.Redo).toBe('Redo');
        expect(eventName.Undo).toBe('Undo');
        expect(eventName.BeforeRedo).toBe('BeforeRedo');
        expect(eventName.BeforeUndo).toBe('BeforeUndo');
        expect(eventName.CommandExecuted).toBe('CommandExecuted');
        expect(eventName.BeforeCommandExecute).toBe('BeforeCommandExecute');
    });

    it('should let plugins extend event facade instances and static metadata', () => {
        class EventSource {
            static label = 'event-source';

            extraEvent(this: { marker: string }) {
                return `${this.marker}:event`;
            }
        }

        class ExtendedEventName extends FEventName {
            marker = 'extended';
        }

        ExtendedEventName.extend(EventSource);

        const extendedEvent = new ExtendedEventName() as ExtendedEventName & { extraEvent(): string };

        expect(extendedEvent.extraEvent()).toBe('extended:event');
        expect((ExtendedEventName as typeof ExtendedEventName & { label: string }).label).toBe('event-source');
    });
});
