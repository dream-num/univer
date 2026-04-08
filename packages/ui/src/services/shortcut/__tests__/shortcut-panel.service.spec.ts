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
import { ShortcutPanelService } from '../shortcut-panel.service';

describe('ShortcutPanelService', () => {
    it('should open and close panel state', () => {
        const service = new ShortcutPanelService();

        expect(service.isOpen).toBe(false);

        service.open();
        expect(service.isOpen).toBe(true);

        service.close();
        expect(service.isOpen).toBe(false);
    });

    it('should emit distinct state values and complete on dispose', () => {
        const service = new ShortcutPanelService();
        const values: boolean[] = [];
        let completed = false;

        const sub = service.open$.subscribe({
            next: (value) => values.push(value),
            complete: () => {
                completed = true;
            },
        });

        service.close();
        service.open();
        service.open();
        service.close();

        expect(values).toEqual([false, true, false]);

        service.dispose();
        expect(completed).toBe(true);

        sub.unsubscribe();
    });
});
