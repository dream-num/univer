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

import { generateRandomId, IUndoRedoService } from '@univerjs/core';

const HISTORY_GROUP_WINDOW = 1_000;

export class UndoRedoGroupService {
    private readonly _sessions = new Map<string, { expiresAt: number; id: string }>();

    constructor(
        @IUndoRedoService private readonly _undoRedoService: Pick<IUndoRedoService, 'beginUndoRedoGroup'>
    ) {}

    run<T>(unitId: string, action: () => T, mode: 'replace' | 'append' = 'append'): T {
        return this._run(unitId, generateRandomId(8), mode, action);
    }

    createRunner(unitId: string, mode: 'replace' | 'append' = 'append') {
        const groupId = generateRandomId(8);
        return <T>(action: () => T): T => this._run(unitId, groupId, mode, action);
    }

    runTimed<T>(unitId: string, scope: string, action: () => T, mode: 'replace' | 'append' = 'replace'): T {
        const now = Date.now();
        const sessionKey = `${unitId}:${scope}`;
        const current = this._sessions.get(sessionKey);
        const groupId = current && current.expiresAt >= now ? current.id : generateRandomId(8);

        this._sessions.set(sessionKey, { id: groupId, expiresAt: now + HISTORY_GROUP_WINDOW });
        if (this._sessions.size > 100) {
            this._sessions.forEach((session, key) => {
                if (session.expiresAt < now) {
                    this._sessions.delete(key);
                }
            });
        }

        return this._run(unitId, groupId, mode, action);
    }

    private _run<T>(unitId: string, groupId: string, mode: 'replace' | 'append', action: () => T): T {
        const group = this._undoRedoService.beginUndoRedoGroup(unitId, groupId, mode);
        try {
            return action();
        } finally {
            group.dispose();
        }
    }
}
