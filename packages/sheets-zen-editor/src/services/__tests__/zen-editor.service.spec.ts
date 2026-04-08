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

import { describe, expect, it } from 'vitest';
import { ZenEditorManagerService } from '../zen-editor.service';

describe('ZenEditorManagerService', () => {
    it('should expose and publish position updates', () => {
        const service = new ZenEditorManagerService();
        const values: Array<DOMRect | null | undefined | void> = [];
        const subscription = service.position$.subscribe((value) => values.push(value));

        const rect = new DOMRect(10, 20, 300, 200);
        service.setPosition(rect);

        expect(service.getPosition()).toBe(rect);
        expect(values).toEqual([null, rect]);

        subscription.unsubscribe();
        service.dispose();
        expect(service.getPosition()).toBeNull();
    });
});
