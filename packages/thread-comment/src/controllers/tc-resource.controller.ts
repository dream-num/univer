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

import { Disposable, IResourceManagerService, LifecycleStages, OnLifecycle } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';
import { UniverType } from '@univerjs/protocol';
import { ThreadCommentModel } from '../models/thread-comment.model';
import { TC_PLUGIN_NAME } from '../types/const';
import type { IThreadComment } from '../types/interfaces/i-thread-comment';
import { IThreadCommentDataSourceService } from '../services/tc-datasource.service';

export type UnitThreadCommentJSON = Record<string, IThreadComment[]>;

@OnLifecycle(LifecycleStages.Starting, ThreadCommentResourceController)
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
                map.forEach(([key, v]) => {
                    resultMap[key] = v;
                });

                return JSON.stringify(this._threadCommentDataSourceService.saveToSnapshot(resultMap));
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
                pluginName: `SHEET_${TC_PLUGIN_NAME}`,
                businesses: [UniverType.UNIVER_SHEET],
                toJson: (unitID) => toJson(unitID),
                parseJson: (json) => parseJson(json),
                onUnLoad: (unitID) => {
                    this._threadCommentModel.deleteUnit(unitID);
                },
                onLoad: async (unitID, value) => {
                    const unitComments = await this._threadCommentDataSourceService.loadFormSnapshot(value);
                    Object.keys(unitComments).forEach((subunitId) => {
                        const commentList = value[subunitId];
                        commentList.forEach((comment) => {
                            this._threadCommentModel.addComment(unitID, subunitId, comment);
                        });
                    });
                },
            })
        );
    }
}
