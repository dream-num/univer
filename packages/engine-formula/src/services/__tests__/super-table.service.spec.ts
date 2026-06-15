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
import { TableOptionType } from '../../basics/common';
import { ISuperTableService, SuperTableService } from '../super-table.service';

describe('SuperTableService', () => {
    let service: ISuperTableService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([ISuperTableService, { useClass: SuperTableService }]);
        service = injector.get(ISuperTableService);
    });

    it('registers workbook tables case-insensitively for structured references', () => {
        const table = { name: 'SalesTable' };

        service.registerTable('book-1', 'SalesTable', table as never);

        expect(service.hasTable('book-1', 'salestable')).toBe(true);
        expect(service.getTable('book-1', 'SalesTable')).toBe(table);
    });

    it('notifies subscribers when structured-reference tables change', () => {
        const changes: unknown[] = [];
        service.update$.subscribe((change) => changes.push(change));

        service.registerTable('book-1', 'SalesTable', { name: 'SalesTable' } as never);
        service.remove('book-1', 'SalesTable');

        expect(changes).toEqual([null, null]);
        expect(service.hasTable('book-1', 'SalesTable')).toBe(false);
    });

    it('keeps built-in table options available for formula parsing', () => {
        expect(service.getTableOptionMap().get(TableOptionType.DATA)).toBe(TableOptionType.DATA);
        service.registerTableOptionMap('自定义', TableOptionType.ALL);
        expect(service.getTableOptionMap().get('自定义')).toBe(TableOptionType.ALL);
    });
});
