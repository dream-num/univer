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

import { Disposable, ICommandService, Inject } from '@univerjs/core';
import { IFindReplaceService } from '@univerjs/find-replace';
import { IMenuManagerService } from '@univerjs/ui';
import { DocsReplaceCommand } from '../commands/commands/docs-replace.command';
import { menuSchema } from '../menu/schema';
import { DocsFindReplaceProvider } from '../services/docs-find-replace.provider';

export class DocsFindReplaceController extends Disposable {
    constructor(
        @Inject(DocsFindReplaceProvider) provider: DocsFindReplaceProvider,
        @IFindReplaceService findReplaceService: IFindReplaceService,
        @ICommandService commandService: ICommandService,
        @IMenuManagerService menuManagerService: IMenuManagerService
    ) {
        super();

        this.disposeWithMe(provider);
        this.disposeWithMe(findReplaceService.registerFindReplaceProvider(provider));
        this.disposeWithMe(commandService.registerCommand(DocsReplaceCommand));
        menuManagerService.mergeMenu(menuSchema);
    }
}
