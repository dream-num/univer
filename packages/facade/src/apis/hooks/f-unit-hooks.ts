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

import type { IDisposable, UnitModel, UniverInstanceType } from '@univerjs/core';
import { IUniverInstanceService, toDisposable } from '@univerjs/core';
import type { FHooks } from '../f-hooks';

/**
 * The IUnit interface represents a unit.
 */
interface IUnit {
    /**
     * Get the unit ID.
     * @returns The unit ID
     */
    getUnitId: () => string;
    /**
     * Get the unit type.
     * @returns The unit type
     */
    getType: () => UniverInstanceType;
}
export const FUnitHooks = {
    /**
     * The beforeCreateUnit event is fired before a unit is created.
     * @param callback Callback function that will be called when the event is fired, return false to cancel the creation of the unit
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    beforeCreateUnit(this: FHooks, callback: (unit: IUnit) => boolean | void): IDisposable {
        const _univerInstanceService = this._injector.get(IUniverInstanceService);

        const wrapped = (unit: UnitModel): boolean | void => {
            return callback({
                getUnitId: () => unit.getUnitId(),
                getType: () => unit.type,
            });
        };
        _univerInstanceService.beforeUnitAddCallbacks.add(wrapped);

        return toDisposable(() => {
            _univerInstanceService.beforeUnitAddCallbacks.delete(wrapped);
        });
    },
    /**
     * The afterCreateUnit event is fired after a unit is created.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    afterCreateUnit(this: FHooks, callback: (
        unit: IUnit,
    ) => void): IDisposable {
        const _univerInstanceService = this._injector.get(IUniverInstanceService);
        return toDisposable(
            _univerInstanceService.unitAdded$.subscribe((unit) => {
                callback({
                    getUnitId: () => unit.getUnitId(),
                    getType: () => unit.type,
                });
            })
        );
    },

    /**
     * The beforeDisposeUnit event is fired before a unit is disposed.
     * @param callback Callback function that will be called when the event is fired, return false to cancel the disposal of the unit
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    beforeDisposeUnit(this: FHooks, callback: (unit: IUnit) => void): IDisposable {
        const _univerInstanceService = this._injector.get(IUniverInstanceService);
        const wrapped = (unit: UnitModel): boolean | void => {
            return callback({
                getUnitId: () => unit.getUnitId(),
                getType: () => unit.type,
            });
        };
        _univerInstanceService.beforeUnitDisposeCallbacks.add(wrapped);

        return toDisposable(() => {
            _univerInstanceService.beforeUnitDisposeCallbacks.delete(wrapped);
        });
    },

    /**
     * The afterDisposeUnit event is fired after a unit is disposed.
     * @param callback Callback function that will be called when the event is fired
     * @returns A disposable object that can be used to unsubscribe from the event
     */
    afterDisposeUnit(this: FHooks, callback: (unit: IUnit) => void): IDisposable {
        const _univerInstanceService = this._injector.get(IUniverInstanceService);
        return toDisposable(
            _univerInstanceService.unitDisposed$.subscribe((unit) => {
                callback({
                    getUnitId: () => unit.getUnitId(),
                    getType: () => unit.type,
                });
            })
        );
    },

};
