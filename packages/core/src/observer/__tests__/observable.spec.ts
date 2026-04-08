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

import { describe, expect, it, vi } from 'vitest';
import { EventState, EventSubject, fromEventSubject } from '../observable';

describe('EventState', () => {
    it('should initialize with skipNextObservers set to false', () => {
        const eventState = new EventState();
        expect(eventState.skipNextObservers).toBe(false);
    });

    it('should allow stopPropagation to be set', () => {
        const eventState = new EventState();
        eventState.stopPropagation();
        expect(eventState.isStopPropagation).toBe(true);
    });
});

describe('EventSubject', () => {
    it('should notify observers by priority and keep last return value', () => {
        const subject = new EventSubject<string>();
        const order: string[] = [];

        subject.subscribeEvent({
            priority: 10,
            next: ([event]) => {
                order.push(`late:${event}`);
                return 'late';
            },
        });
        subject.subscribeEvent({
            priority: 1,
            next: ([event]) => {
                order.push(`early:${event}`);
                return 'early';
            },
        });

        const result = subject.emitEvent('evt');

        expect(order).toEqual(['early:evt', 'late:evt']);
        expect(result).toEqual({
            handled: true,
            lastReturnValue: 'late',
            stopPropagation: false,
        });
    });

    it('should stop on skipNextObservers and expose propagation state', () => {
        const subject = new EventSubject<string>();
        const nextSpy = vi.fn();

        subject.subscribeEvent((event, state) => {
            state.stopPropagation();
            state.skipNextObservers = true;
            return `${event}:stopped`;
        });
        subject.subscribeEvent(nextSpy);

        const result = subject.emitEvent('evt');

        expect(nextSpy).not.toHaveBeenCalled();
        expect(result).toEqual({
            handled: true,
            lastReturnValue: 'evt:stopped',
            stopPropagation: true,
        });
    });

    it('should clear observers on complete and throw after unsubscribe', () => {
        const subject = new EventSubject<string>();
        const completeSpy = vi.fn();

        subject.subscribeEvent({ complete: completeSpy });
        subject.clearObservers();
        expect(completeSpy).toHaveBeenCalledTimes(1);
        expect(subject.emitEvent('evt')).toEqual({
            handled: false,
            lastReturnValue: 'evt',
            stopPropagation: false,
        });

        subject.complete();
        expect(subject.emitEvent('evt')).toEqual({
            handled: false,
            lastReturnValue: 'evt',
            stopPropagation: false,
        });

        subject.unsubscribe();
        expect(() => subject.emitEvent('evt')).toThrowError(/closed subject/);
    });

    it('should forward events through fromEventSubject and unsubscribe cleanly', () => {
        const subject = new EventSubject<string>();
        const received: string[] = [];
        const subscription = fromEventSubject(subject).subscribe((value) => {
            received.push(value);
        });

        subject.emitEvent('first');
        subscription.unsubscribe();
        subject.emitEvent('second');
        subject.unsubscribe();

        expect(received).toEqual(['first']);
    });
});
