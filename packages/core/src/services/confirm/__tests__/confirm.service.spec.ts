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

import { describe, expect, it } from 'vitest';
import { Injector } from '../../../common/di';
import { IConfirmService, TestConfirmService } from '../confirm.service';

function createService(): IConfirmService {
    const injector = new Injector();
    injector.add([IConfirmService, { useClass: TestConfirmService }]);
    return injector.get(IConfirmService);
}

describe('TestConfirmService', () => {
    it('lets non-UI environments approve confirm requests by default', async () => {
        const service = createService();

        await expect(service.confirm({ id: 'delete-sheet' })).resolves.toBe(true);
    });

    it('keeps modal-only entry points unavailable for tests without a confirm UI', () => {
        const service = createService();

        expect(() => service.open({ id: 'delete-sheet' })).toThrow('This is not implemented in the test service!');
        expect(() => service.close('delete-sheet')).toThrow('This is not implemented in the test service!');
    });

    it('completes confirmation option streams when the test service is disposed', () => {
        const service = createService();
        let completed = false;
        service.confirmOptions$.subscribe({ complete: () => completed = true });

        (service as TestConfirmService<{ id: string }>).dispose();

        expect(completed).toBe(true);
    });
});
