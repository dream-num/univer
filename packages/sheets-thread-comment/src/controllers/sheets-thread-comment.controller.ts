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

import { Disposable, ICommandService, LifecycleStages, LocaleService, OnLifecycle } from '@univerjs/core';
import { ComponentManager, IMenuService } from '@univerjs/ui';
import { Inject, Injector } from '@wendellhu/redi';
import { CommentSingle } from '@univerjs/icons';
import { SetActiveCommentOperation, THREAD_COMMENT_PANEL, ThreadCommentPanelService } from '@univerjs/thread-comment-ui';
import type { ISetSelectionsOperationParams } from '@univerjs/sheets';
import { SelectionMoveType, SetSelectionsOperation } from '@univerjs/sheets';
import { singleReferenceToGrid } from '@univerjs/engine-formula';
import { ScrollToCellCommand } from '@univerjs/sheets-ui';
import { SheetsThreadCommentCell } from '../views/sheets-thread-comment-cell';
import { COMMENT_SINGLE_ICON, SHEETS_THREAD_COMMENT_MODAL } from '../types/const';
import { SheetsThreadCommentPanel } from '../views/sheets-thread-comment-panel';
import { enUS, zhCN } from '../locales';
import { SheetsThreadCommentPopupService } from '../services/sheets-thread-comment-popup.service';
import { SheetsThreadCommentModel } from '../models/sheets-thread-comment.model';
import { threadCommentMenu, threadPanelMenu } from './menu';

@OnLifecycle(LifecycleStages.Starting, SheetsThreadCommentController)
export class SheetsThreadCommentController extends Disposable {
    constructor(
        @IMenuService private readonly _menuService: IMenuService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @Inject(SheetsThreadCommentPopupService) private readonly _sheetsThreadCommentPopupService: SheetsThreadCommentPopupService,
        @Inject(SheetsThreadCommentModel) private readonly _sheetsThreadCommentModel: SheetsThreadCommentModel,
        @Inject(ThreadCommentPanelService) private readonly _threadCommentPanelService: ThreadCommentPanelService
    ) {
        super();
        this._initMenu();
        this._initComponent();
        this._initLocale();
        this._initCommandListener();
        this._initPanelListener();
    }

    private _initCommandListener() {
        this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetSelectionsOperation.id) {
                const params = commandInfo.params as ISetSelectionsOperationParams;

                if (params.type === SelectionMoveType.MOVE_END && params.selections[0].primary) {
                    const unitId = params.unitId;
                    const subUnitId = params.subUnitId;
                    const row = params.selections[0].primary.actualRow;
                    const col = params.selections[0].primary.actualColumn;
                    if (!this._sheetsThreadCommentModel.showCommentMarker(unitId, subUnitId, row, col)) {
                        return;
                    }
                    const commentId = this._sheetsThreadCommentModel.getByLocation(unitId, subUnitId, row, col);
                    if (commentId) {
                        this._commandService.executeCommand(SetActiveCommentOperation.id, {
                            unitId,
                            subUnitId,
                            commentId,
                        });
                    }
                }
            }
        });
    }


    private _initMenu() {
        [
            threadCommentMenu,
            threadPanelMenu,
        ].forEach((menu) => {
            this._menuService.addMenuItem(menu(this._injector));
        });
    }

    private _initComponent() {
        ([
            [SHEETS_THREAD_COMMENT_MODAL, SheetsThreadCommentCell],
            [THREAD_COMMENT_PANEL, SheetsThreadCommentPanel],
            [COMMENT_SINGLE_ICON, CommentSingle],
        ] as const).forEach(([key, comp]) => {
            this._componentManager.register(key, comp);
        });
    }

    private _initLocale() {
        this._localeService.load({
            zhCN,
            enUS,
        });
    }

    private _initPanelListener() {
        this.disposeWithMe(this._threadCommentPanelService.activeCommentId$.subscribe((commentInfo) => {
            if (commentInfo) {
                const { unitId, subUnitId, commentId } = commentInfo;
                const comment = this._sheetsThreadCommentModel.getComment(unitId, subUnitId, commentId);
                if (!comment || comment.resolved) {
                    return;
                }

                const location = singleReferenceToGrid(comment.ref);
                this._commandService.executeCommand(ScrollToCellCommand.id, {
                    range: {
                        startColumn: location.column,
                        endColumn: location.column,
                        startRow: location.row,
                        endRow: location.column,
                    },
                });
                this._sheetsThreadCommentPopupService.showPopup({
                    unitId,
                    subUnitId,
                    row: location.row,
                    col: location.column,
                    commentId: comment.id,
                });
            }
        }));
    }
}
