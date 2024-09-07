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

import { IUniverInstanceService } from '../services/instance/instance.service.ts';
import { ICommandService } from '../services/command/command.service.ts';
import { Inject, Injector } from './di';

export class FBase {
    private static _constructorQueue: Array<() => void> = [];

    _initialize() {}

    constructor() {
        FBase._constructorQueue.forEach((fn) => {
            fn();
        });
    }

    static extend(source: any): void {
        // 合并实例方法
        Object.getOwnPropertyNames(source.prototype).forEach((name) => {
            if (name === '_initialize') {
                FBase._constructorQueue.push(
                    source.prototype._initialize.bind(source.prototype)
                );
            } else if (name !== 'constructor') {
                // @ts-ignore
                this.prototype[name] = source.prototype[name];
            }
        });

            // 合并静态方法
        Object.getOwnPropertyNames(source).forEach((name) => {
            if (name !== 'prototype' && name !== 'name' && name !== 'length') {
                // @ts-ignore
                this[name] = source[name];
            }
        });
    }
}

export class FUniver extends FBase {
    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
    }
}
