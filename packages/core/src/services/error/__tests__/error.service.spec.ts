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

import { beforeEach, describe, expect, it } from 'vitest';
import { Injector } from '../../../common/di';
import { ErrorService } from '../error.service';

describe('ErrorService', () => {
    let service: ErrorService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([ErrorService]);
        service = injector.get(ErrorService);
    });

    it('emits business error keys to subscribers in order', () => {
        const errors: string[] = [];
        service.error$.subscribe((error) => errors.push(error.errorKey));

        service.emit('permission-denied');
        service.emit('network-timeout');

        expect(errors).toEqual(['permission-denied', 'network-timeout']);
    });

    it('completes the error stream when its injector is disposed', () => {
        const injector = new Injector([[ErrorService]]);
        const disposableService = injector.get(ErrorService);
        let completed = false;

        disposableService.error$.subscribe({ complete: () => completed = true });
        injector.dispose();

        expect(completed).toBe(true);
    });
});
