import { ILocalStorageService } from '@univerjs/core';
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
