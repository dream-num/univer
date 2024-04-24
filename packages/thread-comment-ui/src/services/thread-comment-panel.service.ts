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

import { Subject } from 'rxjs';

export class ThreadCommentPanelService {
    private _panelVisible = false;
    private _panelVisible$ = new Subject<boolean>();

    private _activeCommentId: string | undefined;
    private _activeCommentId$ = new Subject<string | undefined>();

    panelVisible$ = this._panelVisible$.asObservable();

    get panelVisible() {
        return this._panelVisible;
    }

    get activeCommentId() {
        return this._activeCommentId;
    }

    setPanelVisible(visible: boolean) {
        this._panelVisible = visible;
        this._panelVisible$.next(visible);
    }

    setActiveComment(commentId: string | undefined) {
        this._activeCommentId = commentId;
        this._activeCommentId$.next(commentId);
    }
}
