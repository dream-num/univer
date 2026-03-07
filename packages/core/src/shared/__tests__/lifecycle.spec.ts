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

import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Disposable, DisposableCollection, RCDisposable, RxDisposable, toDisposable } from '../lifecycle';

class TestDisposable extends Disposable {
    assertUsable() {
        this.ensureNotDisposed();
    }
}

class TestRxDisposable extends RxDisposable {
    getDispose$() {
        return this.dispose$;
    }
}

describe('lifecycle helpers', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should convert callbacks, subscriptions and empty values to disposables', () => {
        const callback = vi.fn();
        const callbackDisposable = toDisposable(callback);
        callbackDisposable.dispose();
        callbackDisposable.dispose();
        expect(callback).toHaveBeenCalledTimes(1);

        const subject = new Subject<void>();
        const unsubscribeSpy = vi.spyOn(subject, 'unsubscribe');
        toDisposable(subject).dispose();
        expect(unsubscribeSpy).toHaveBeenCalledTimes(1);

        expect(() => toDisposable(undefined as never).dispose()).not.toThrow();
    });

    it('should manage a disposable collection and optional self-retention', () => {
        const collection = new DisposableCollection();
        const callback = vi.fn();
        const handle = collection.add(callback);
        handle.dispose(true);
        expect(callback).not.toHaveBeenCalled();

        collection.add(callback);
        collection.dispose();
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should track disposed state in Disposable and RxDisposable', () => {
        const disposable = new TestDisposable();
        const child = { dispose: vi.fn() };
        disposable.disposeWithMe(child);
        disposable.assertUsable();
        disposable.dispose();

        expect(child.dispose).toHaveBeenCalledTimes(1);
        expect(() => disposable.assertUsable()).toThrowError(/disposed/);

        const rxDisposable = new TestRxDisposable();
        const completed = vi.fn();
        rxDisposable.getDispose$().subscribe({ complete: completed });
        rxDisposable.dispose();
        expect(completed).toHaveBeenCalledTimes(1);
    });

    it('should dispose root resource when RCDisposable reference reaches zero', () => {
        const root = { dispose: vi.fn() };
        const rcDisposable = new RCDisposable(root);

        rcDisposable.inc();
        rcDisposable.inc();
        rcDisposable.dec();
        expect(root.dispose).not.toHaveBeenCalled();

        rcDisposable.dec();
        expect(root.dispose).toHaveBeenCalledTimes(1);
        expect(() => rcDisposable.inc()).toThrowError(/disposed/);
    });
});
