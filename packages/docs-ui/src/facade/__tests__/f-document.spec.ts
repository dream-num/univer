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

import type { Injector } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import { ICommandService } from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { InsertCommand } from '@univerjs/docs-ui';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestBed } from './create-test-bed';

import '@univerjs/docs-ui/facade';

describe('Test FDocument', () => {
    let get: Injector['get'];
    let commandService: ICommandService;
    let univerAPI: FUniver;

    beforeEach(() => {
        const testBed = createTestBed();
        get = testBed.get;
        univerAPI = testBed.univerAPI;

        commandService = get(ICommandService);
        commandService.registerCommand(InsertCommand);
        commandService.registerCommand(RichTextEditingMutation);
    });

    it('Document appendText', async () => {
        const activeDoc = univerAPI.getActiveDocument()!;
        expect(await activeDoc.appendText('Univer')).toBeTruthy();

        const dataStream = activeDoc.getSnapshot().body!.dataStream;
        expect(dataStream.substring(0, dataStream.length - 2)).toEqual('Hello,Univer');
    });
});
