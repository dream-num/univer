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

import { ILocalStorageService, Inject } from '@univerjs/core';
import { createContext } from 'react';

type HabitValue = string | number;
interface IUserHabitController {
    addHabit(habit: string, initValue: HabitValue[]): Promise<void>;
    markHabit(habit: string, value: HabitValue): void;
    deleteHabit(habit: string): void;
    getHabit(habit: string, sortList?: HabitValue[]): Promise<HabitValue[]>;
}

export const UserHabitCurrencyContext = createContext<string[]>([]);

export class UserHabitController implements IUserHabitController {
    constructor(@Inject(ILocalStorageService) private _localStorageService: ILocalStorageService) {
        // super
    }

    private _getKey(habit: string) {
        return `userHabitController_${habit}`;
    }

    async addHabit<T = unknown[]>(habit: string, initValue: T) {
        const key = this._getKey(habit);
        return this._localStorageService.getItem<T>(key).then((item) => {
            if (!item) {
                this._localStorageService.setItem(key, initValue);
            }
        });
    }

    markHabit(habit: string, value: HabitValue) {
        const key = this._getKey(habit);
        this._localStorageService.getItem<HabitValue[]>(key).then((list) => {
            if (list) {
                const index = list.findIndex((item) => item === value);
                index > -1 && list.splice(index, 1);
                list.unshift(value);
                this._localStorageService.setItem(key, list);
            }
        });
    }

    async getHabit(habit: string, sortList: HabitValue[]) {
        const key = this._getKey(habit);
        const result = await this._localStorageService.getItem<HabitValue[]>(key);
        if (sortList && result) {
            const priority = result.map((item, index, arr) => {
                const length = arr.length;
                return {
                    value: item,
                    priority: length - index,
                };
            });
            return sortList.sort((a, b) => {
                const ap = priority.find((item) => item.value === a)?.priority || -1;
                const bp = priority.find((item) => item.value === b)?.priority || -1;
                return bp - ap;
            });
        }
        return result || [];
    }

    deleteHabit(habit: string) {
        this._localStorageService.removeItem(habit);
    }
}
