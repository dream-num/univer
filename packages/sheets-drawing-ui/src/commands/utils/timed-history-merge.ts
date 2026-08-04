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

import { generateRandomId } from '@univerjs/core';

const sessions = new Map<string, { id: string; expiresAt: number }>();

export function getTimedDrawingHistoryMergeId(scope: string, now = Date.now(), window = 1_000): string {
    const session = sessions.get(scope);
    if (session && session.expiresAt >= now) {
        session.expiresAt = now + window;
        return session.id;
    }

    const id = `drawing-history-${generateRandomId(8)}`;
    sessions.set(scope, { id, expiresAt: now + window });
    return id;
}
