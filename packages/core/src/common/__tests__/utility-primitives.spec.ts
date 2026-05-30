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

import { afterEach, describe, expect, it, vi } from 'vitest';
import { isBooleanString } from '../boolean';
import { noop, throttle } from '../function';
import { mixinClass } from '../mixin';
import { isNumeric, isSafeNumeric, willLoseNumericPrecision } from '../number';
import { requestImmediateMacroTask } from '../request-immediate-macro-task';
import { mergeSets } from '../set';

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('common utility primitives', () => {
    it('should classify boolean strings case-insensitively', () => {
        expect(isBooleanString('true')).toBe(true);
        expect(isBooleanString('FALSE')).toBe(true);
        expect(isBooleanString('yes')).toBe(false);
    });

    it('should keep noop side-effect free and throttle rapid invocations', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

        const calls: Array<[number, number]> = [];
        const context = {
            base: 7,
            throttled: throttle(function (this: { base: number }, step: number) {
                calls.push([this.base, step]);
            }, 16),
        };

        expect(noop()).toBeUndefined();

        context.throttled(1);
        expect(calls).toEqual([[7, 1]]);

        vi.setSystemTime(new Date('2026-01-01T00:00:00.005Z'));
        context.throttled(2);
        vi.setSystemTime(new Date('2026-01-01T00:00:00.010Z'));
        context.throttled(3);
        expect(calls).toEqual([[7, 1]]);

        vi.advanceTimersByTime(16);
        expect(calls).toEqual([[7, 1], [7, 3]]);
    });

    it('should mix enumerable methods into a class prototype', () => {
        class Greeter {
            prefix = 'hi';
        }

        mixinClass(Greeter.prototype, {
            greet(this: Greeter, name: string) {
                return `${this.prefix}, ${name}`;
            },
        });

        const greeter = new Greeter() as Greeter & { greet(name: string): string };
        expect(greeter.greet('univer')).toBe('hi, univer');
    });

    it('should recognize numeric strings and precision boundaries', () => {
        expect(isNumeric('-12.5')).toBe(true);
        expect(isNumeric('12e3')).toBe(false);

        expect(isSafeNumeric(`${Number.MAX_SAFE_INTEGER}`)).toBe(true);
        expect(isSafeNumeric('9007199254740992')).toBe(false);

        expect(willLoseNumericPrecision('123456789123456789')).toBe(true);
        expect(willLoseNumericPrecision('12345')).toBe(false);
    });

    it('should merge sets into the first instance', () => {
        const left = new Set(['alpha', 'beta']);
        const right = new Set(['beta', 'gamma']);

        const merged = mergeSets(left, right);

        expect(merged).toBe(left);
        expect(Array.from(merged)).toEqual(['alpha', 'beta', 'gamma']);
    });

    it('should schedule immediate macro tasks and allow cancellation', async () => {
        const events: string[] = [];

        await new Promise<void>((resolve) => {
            requestImmediateMacroTask(() => {
                events.push('ran');
                resolve();
            });
        });

        expect(events).toEqual(['ran']);

        await new Promise<void>((resolve) => {
            const cancel = requestImmediateMacroTask(() => {
                events.push('cancelled');
            });

            cancel();
            setTimeout(resolve, 0);
        });

        expect(events).toEqual(['ran']);
    });
});
