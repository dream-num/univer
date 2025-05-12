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

import type { IThreadComment } from '../types/interfaces/i-thread-comment';
import { Disposable, Inject, IResourceManagerService, UniverInstanceType } from '@univerjs/core';
import { ThreadCommentModel } from '../models/thread-comment.model';
import { IThreadCommentDataSourceService } from '../services/tc-datasource.service';
import { TC_PLUGIN_NAME } from '../types/const';

export type UnitThreadCommentJSON = Record<string, IThreadComment[]>;

export const SHEET_UNIVER_THREAD_COMMENT_PLUGIN = `SHEET_${TC_PLUGIN_NAME}`;

export class ThreadCommentResourceController extends Disposable {
    constructor(
        @IResourceManagerService private readonly _resourceManagerService: IResourceManagerService,
        @Inject(ThreadCommentModel) private readonly _threadCommentModel: ThreadCommentModel,
        @IThreadCommentDataSourceService private readonly _threadCommentDataSourceService: IThreadCommentDataSourceService
    ) {
        super();
        this._initSnapshot();
    }

    private _initSnapshot() {
        const toJson = (unitID: string) => {
            const map = this._threadCommentModel.getUnit(unitID);
            const resultMap: UnitThreadCommentJSON = {};
            if (map) {
                map.forEach((info) => {
                    const subUnitComments = resultMap[info.subUnitId] ?? [];
                    subUnitComments.push({
                        ...info.root,
                        children: info.children,
                    });
                    resultMap[info.subUnitId] = subUnitComments;
                });

                return JSON.stringify(this._threadCommentDataSourceService.saveToSnapshot(resultMap, unitID));
            }
            return '';
        };
        const parseJson = (json: string): UnitThreadCommentJSON => {
            if (!json) {
                return {};
            }
            try {
                return JSON.parse(json);
            } catch (err) {
                return {};
            }
        };

        this.disposeWithMe(
            this._resourceManagerService.registerPluginResource({
                pluginName: SHEET_UNIVER_THREAD_COMMENT_PLUGIN,
                businesses: [UniverInstanceType.UNIVER_SHEET, UniverInstanceType.UNIVER_DOC],
                toJson: (unitID) => toJson(unitID),
                parseJson: (json) => parseJson(json),
                onUnLoad: (unitID) => {
                    this._threadCommentModel.deleteUnit(unitID);
                },
                onLoad: async (unitID, value) => {
                    Object.keys(value).forEach((subunitId) => {
                        const commentList = value[subunitId];
                        commentList.forEach((comment: IThreadComment) => {
                            this._threadCommentModel.addComment(unitID, subunitId, comment);
                        });

                        this._threadCommentModel.syncThreadComments(unitID, subunitId, commentList.map((i) => i.threadId));
                    });
                },
            })
        );
    }
}
