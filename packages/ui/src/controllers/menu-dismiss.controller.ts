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

import { Disposable } from '@univerjs/core';
import { IContextMenuHostService } from '../services/contextmenu/contextmenu-host.service';
import { IDialogService } from '../services/dialog/dialog.service';
import { ISidebarService } from '../services/sidebar/sidebar.service';

export class MenuDismissController extends Disposable {
    constructor(
        @IDialogService dialogService: IDialogService,
        @ISidebarService sidebarService: ISidebarService,
        @IContextMenuHostService menuHostService: IContextMenuHostService
    ) {
        super();
        this.disposeWithMe(sidebarService.sidebarOptions$.subscribe((options) => {
            if (options.visible) {
                menuHostService.closeAll();
            }
        }));
        let openDialogIds = new Set<string>();
        this.disposeWithMe(dialogService.getDialogs$().subscribe((dialogs) => {
            const nextIds = new Set(dialogs.filter((dialog) => dialog.open).map((dialog) => dialog.id));
            const opening = [...nextIds].some((id) => !openDialogIds.has(id));
            openDialogIds = nextIds;
            if (opening) {
                menuHostService.closeAll();
            }
        }));
    }
}
