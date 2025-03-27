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
import { ComponentManager } from '@univerjs/ui';
import { DocCreateTableOperation } from '../commands/operations/doc-create-table.operation';
import { COMPONENT_DOC_CREATE_TABLE_CONFIRM } from '../views/table/create/component-name';
import { DocCreateTableConfirm } from '../views/table/create/TableCreate';

export class DocTableController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this._init();
        this._registerCommands();
        this._initCustomComponents();
    }

    private _registerCommands() {
        [
            DocCreateTableOperation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _initCustomComponents(): void {
        const componentManager = this._componentManager;
        this.disposeWithMe(componentManager.register(COMPONENT_DOC_CREATE_TABLE_CONFIRM, DocCreateTableConfirm));
    }

    private _init() {}
}
