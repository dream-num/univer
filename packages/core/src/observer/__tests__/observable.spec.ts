/**
 * Copyright 2023-present DreamNum Inc.
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
import { EventState, Observable, Observer } from '../observable';

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

describe('Observer', () => {
    it('should create an observer with a callback', () => {
        const callback = (eventData: any, eventState: EventState) => {};
        const observable = new Observable();
        const observer = new Observer(callback, observable);
        expect(observer.callback).toBe(callback);
        expect(observer.observable).toBe(observable);
    });

    it('should dispose an observer', () => {
        const callback = (eventData: any, eventState: EventState) => {};
        const observable = new Observable();
        // const observer = new Observer(callback, observable);
        const observer = observable.add(callback);
        observer?.dispose();
        expect(observable.observers.length).toBe(0);
    });
});

describe('Observable', () => {
    it('should add observers', () => {
        const observable = new Observable();
        const callback = (eventData: any, eventState: EventState) => {};
        observable.add(callback);
        expect(observable.observers.length).toBe(1);
    });

    it('should notify observers', () => {
        const observable = new Observable();
        const callback = (eventData: any, eventState: EventState) => {
            eventState.lastReturnValue = eventData;
            return eventData; // Ensure the callback returns the eventData
        };
        observable.add(callback);
        const result = observable.notifyObservers('testData');
        expect(result?.lastReturnValue).toBe('testData');
    });

    it('should skip observers when skipNextObservers is set', () => {
        const observable = new Observable();
        const callback1 = (eventData: any, eventState: EventState) => {
            eventState.skipNextObservers = true;
        };
        const callback2 = (eventData: any, eventState: EventState) => {
            eventState.lastReturnValue = 'should not be called';
        };
        observable.add(callback1);
        observable.add(callback2);
        const result = observable.notifyObservers('testData');
        expect(result?.lastReturnValue).not.toBe('should not be called');
    });
});
