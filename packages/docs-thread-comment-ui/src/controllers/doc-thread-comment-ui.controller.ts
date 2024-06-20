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

import { Disposable, ICommandService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import type { MenuConfig } from '@univerjs/ui';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';
import { CommentSingle } from '@univerjs/icons';
import { AddDocCommentComment } from '../commands/commands/add-doc-comment.command';
import { DocThreadCommentPanel } from '../views/doc-thread-comment-panel';
import { ShowCommentPanelOperation, StartAddCommentOperation } from '../commands/operations/show-comment-panel.operation';
import { DeleteDocCommentComment } from '../commands/commands/delete-doc-comment.command';
import { AddDocCommentMenuItemFactory } from './menu';

export interface IDocThreadCommentUIConfig {
    menu: MenuConfig;
}

@OnLifecycle(LifecycleStages.Starting, DocThreadCommentUIController)
export class DocThreadCommentUIController extends Disposable {
    constructor(
        private _config: IDocThreadCommentUIConfig,
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuService private readonly _menuService: IMenuService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super();
        this._initCommands();
        this._initMenus();
        this._initComponents();
    }

    private _initCommands() {
        [
            AddDocCommentComment,
            DeleteDocCommentComment,
            ShowCommentPanelOperation,
            StartAddCommentOperation,
        ].forEach((command) => {
            this.disposeWithMe(this._commandService.registerCommand(command));
        });
    }

    private _initMenus() {
        [AddDocCommentMenuItemFactory].forEach((menuFactory) => {
            this.disposeWithMe(this._menuService.addMenuItem(menuFactory(this._injector), this._config.menu));
        });
    }

    private _initComponents() {
        [DocThreadCommentPanel].forEach((comp) => {
            this.disposeWithMe(this._componentManager.register(comp.componentKey, comp));
        });

        this.disposeWithMe(this._componentManager.register('CommentSingle', CommentSingle));
    }
}
