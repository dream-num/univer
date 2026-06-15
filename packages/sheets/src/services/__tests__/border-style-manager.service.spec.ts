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

import { BorderStyleTypes, BorderType, Injector } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { BorderStyleManagerService } from '../border-style-manager.service';

describe('BorderStyleManagerService', () => {
    let service: BorderStyleManagerService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([BorderStyleManagerService]);
        service = injector.get(BorderStyleManagerService);
    });

    it('publishes the border style selected from the toolbar', () => {
        const snapshots: Array<{ type: BorderType; color: string | undefined; style: BorderStyleTypes; activeBorderType: boolean }> = [];
        service.borderInfo$.subscribe((borderInfo) => snapshots.push({ ...borderInfo }));

        service.setType(BorderType.TOP);
        service.setColor('#ff0000');
        service.setStyle(BorderStyleTypes.DASHED);

        expect(snapshots.at(-1)).toEqual({
            type: BorderType.TOP,
            color: '#ff0000',
            style: BorderStyleTypes.DASHED,
            activeBorderType: true,
        });
    });
});
