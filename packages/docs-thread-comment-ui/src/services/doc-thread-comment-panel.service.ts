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

import type { ITextRange, Nullable } from '@univerjs/core';
import { ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import { ISidebarService } from '@univerjs/ui';
import { Inject } from '@wendellhu/redi';
import { BehaviorSubject, Subject } from 'rxjs';

export type EditingComment = {
    type: 'add';
    range: ITextRange;
} | {
    type: 'edit';
    commentId: string;
};

export class DocThreadCommentPanelService {
    readonly _visible$ = new BehaviorSubject(false);

    readonly _editing$ = new Subject<Nullable<EditingComment>>();
    readonly editing$ = this._editing$.asObservable();

    constructor(
        @ISidebarService private readonly _sidebarService: ISidebarService,
        @Inject(ThreadCommentPanelService) private readonly _threadCommentPanelService: ThreadCommentPanelService
    ) {
    }

    showPanel(editing: Nullable<EditingComment>) {
        this._visible$.next(true);
        this._editing$.next(editing);
    }

    closePanel() {
        this._visible$.next(false);
        this._editing$.next(null);
    }

    switchActiveComment(editing: EditingComment) {
        this._editing$.next(editing);
    }
}
