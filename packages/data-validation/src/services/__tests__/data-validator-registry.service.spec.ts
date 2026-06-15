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

import { Injector } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { DataValidatorRegistryScope, DataValidatorRegistryService } from '../data-validator-registry.service';

describe('DataValidatorRegistryService', () => {
    let service: DataValidatorRegistryService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([DataValidatorRegistryService]);
        service = injector.get(DataValidatorRegistryService);
    });

    it('registers validators by business scope and unregisters them with the disposable', () => {
        const changes: number[] = [];
        service.validatorsChange$.subscribe(() => changes.push(1));
        const validator = { id: 'decimal', scopes: DataValidatorRegistryScope.SHEET };

        const disposable = service.register(validator as never);

        expect(service.getValidatorItem('decimal')).toBe(validator);
        expect(service.getValidatorsByScope(DataValidatorRegistryScope.SHEET)).toEqual([validator]);

        disposable.dispose();

        expect(service.getValidatorItem('decimal')).toBeUndefined();
        expect(service.getValidatorsByScope(DataValidatorRegistryScope.SHEET)).toEqual([]);
        expect(changes.length).toBe(3);
    });

    it('rejects duplicate validators in the same scope', () => {
        service.register({ id: 'decimal', scopes: DataValidatorRegistryScope.SHEET } as never);

        expect(() => service.register({ id: 'decimal', scopes: DataValidatorRegistryScope.SHEET } as never)).toThrow(
            'Validator item with the same id decimal has already been added!'
        );
    });
});
