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

import { ICommandService, Injector } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { IRepeatLastActionService, RepeatLastActionPermission, RepeatLastActionService } from '../repeat-last-action.service';

describe('RepeatLastActionService', () => {
    let service: IRepeatLastActionService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([ICommandService, { useValue: { executeCommand: async () => true } as unknown as ICommandService }]);
        injector.add([IRepeatLastActionService, { useClass: RepeatLastActionService }]);
        service = injector.get(IRepeatLastActionService);
    });

    it('records repeatable commands with the permission type needed by the current selection', () => {
        const disposable = service.registerRepeatableCommand(
            'sheet.command.fill-series',
            () => ({ direction: 'down' }),
            RepeatLastActionPermission.CellValue
        );

        service.setAction({ id: 'sheet.command.fill-series' });

        expect(service.getRepeatableCommands().has('sheet.command.fill-series')).toBe(true);
        expect(service.getActionPermission()).toBe(RepeatLastActionPermission.CellValue);

        disposable.dispose();
        expect(service.getRepeatableCommands().has('sheet.command.fill-series')).toBe(false);
    });
});
