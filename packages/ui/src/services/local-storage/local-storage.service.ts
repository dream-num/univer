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

import type { ILocalStorageService } from '@univerjs/core';
import localforage from 'localforage';

export class DesktopLocalStorageService implements ILocalStorageService {
    getItem<T>(key: string): Promise<T | null> {
        return localforage.getItem<T>(key);
    }

    setItem<T>(key: string, value: T): Promise<T> {
        return localforage.setItem(key, value);
    }

    removeItem(key: string): Promise<void> {
        return localforage.removeItem(key);
    }

    clear(): Promise<void> {
        return localforage.clear();
    }

    key(index: number): Promise<string | null> {
        return localforage.key(index);
    }

    keys(): Promise<string[]> {
        return localforage.keys();
    }

    iterate<T, U>(iteratee: (value: T, key: string, iterationNumber: number) => U): Promise<U> {
        return localforage.iterate(iteratee);
    }
}
