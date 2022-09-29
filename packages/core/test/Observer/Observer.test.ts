import { EventState, Observable, Observer } from '../../src';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Observable add', () => {
    const observable = new Observable((observer: Observer) => {});
    observable.add((eventData, eventState: EventState) => {}, false, false);
});

test('Observable addOnce', () => {
    const observable = new Observable((observer: Observer) => {});
    observable.addOnce((eventData, eventState: EventState) => {});
});
