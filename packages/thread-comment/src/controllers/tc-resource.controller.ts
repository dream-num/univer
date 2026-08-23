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
import { isThreadCommentDocumentBody } from '../services/thread-comment-api.service';
import { TC_PLUGIN_NAME } from '../types/const';

export type UnitThreadCommentJSON = Record<string, IThreadComment[]>;

export const SHEET_UNIVER_THREAD_COMMENT_PLUGIN = `SHEET_${TC_PLUGIN_NAME}`;

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isSnapshotComment(value: unknown, allowChildren = true): value is IThreadComment {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const comment = value as Record<string, unknown>;
    return typeof comment.id === 'string'
        && comment.id.length > 0
        && typeof comment.threadId === 'string'
        && comment.threadId.length > 0
        && typeof comment.ref === 'string'
        && (comment.text === undefined || isThreadCommentDocumentBody(comment.text))
        && (comment.attachments === undefined || isStringArray(comment.attachments))
        && (comment.mentions === undefined || isStringArray(comment.mentions))
        && (!allowChildren || comment.children === undefined || (
            Array.isArray(comment.children)
            && comment.children.every((child) => isSnapshotComment(child, false))
        ));
}

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
                const value: unknown = JSON.parse(json);
                if (!value || typeof value !== 'object' || Array.isArray(value)) {
                    return {};
                }
                return Object.fromEntries(Object.entries(value).flatMap(([subUnitId, comments]) => (
                    Array.isArray(comments)
                        ? [[subUnitId, comments.filter((comment) => isSnapshotComment(comment))]]
                        : []
                )));
            } catch {
                return {};
            }
        };

        this.disposeWithMe(
            this._resourceManagerService.registerPluginResource({
                pluginName: SHEET_UNIVER_THREAD_COMMENT_PLUGIN,
                businesses: [
                    UniverInstanceType.UNIVER_SHEET,
                    UniverInstanceType.UNIVER_DOC,
                    UniverInstanceType.UNIVER_SLIDE,
                    UniverInstanceType.UNIVER_BOARD,
                    UniverInstanceType.UNIVER_BASE,
                ],
                toJson: (unitID) => toJson(unitID),
                parseJson: (json) => parseJson(json),
                onUnLoad: (unitID) => {
                    this._threadCommentModel.deleteUnit(unitID);
                },
                onLoad: async (unitID, value) => {
                    Object.keys(value).forEach((subunitId) => {
                        const commentList = value[subunitId];
                        commentList.forEach((comment: IThreadComment) => {
                            const seenIds = new Set([comment.id]);
                            const children = comment.children?.filter((child) => {
                                if (child.threadId !== comment.threadId || seenIds.has(child.id)) {
                                    return false;
                                }
                                seenIds.add(child.id);
                                return true;
                            }).map((child) => ({ ...child, unitId: unitID, subUnitId: subunitId }));
                            this._threadCommentModel.addComment(unitID, subunitId, {
                                ...comment,
                                unitId: unitID,
                                subUnitId: subunitId,
                                children,
                            });
                        });

                        this._threadCommentModel.syncThreadComments(unitID, subunitId, commentList.map((i) => i.threadId));
                    });
                },
            })
        );
    }
}
