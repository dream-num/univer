import { ILocalStorageService } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

type HabitValue = string | number;
interface IUserHabitController {
    addHabit(habit: string, initValue: HabitValue[]): Promise<void>;
    markHabit(habit: string, value: HabitValue): void;
    deleteHabit(habit: string): void;
    getHabit(habit: string, sortList?: HabitValue[]): Promise<HabitValue[]>;
}

export class UserHabitController implements IUserHabitController {
    constructor(@Inject(ILocalStorageService) private _localStorageService: ILocalStorageService) {}
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
