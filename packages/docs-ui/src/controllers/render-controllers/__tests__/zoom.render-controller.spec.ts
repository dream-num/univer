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

import { DocumentFlavor } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { shouldHandleDocWheelZoom } from '../zoom.render-controller';

describe('DocZoomRenderController', () => {
    it('handles wheel zoom intent for focused modern docs', () => {
        expect(shouldHandleDocWheelZoom({ ctrlKey: true, metaKey: false }, true, DocumentFlavor.MODERN)).toBe(true);
    });

    it('handles platform zoom modifier variants only while docs are focused', () => {
        expect(shouldHandleDocWheelZoom({ ctrlKey: false, metaKey: true }, true, DocumentFlavor.TRADITIONAL)).toBe(true);
        expect(shouldHandleDocWheelZoom({ ctrlKey: false, metaKey: false }, true, DocumentFlavor.TRADITIONAL)).toBe(false);
        expect(shouldHandleDocWheelZoom({ ctrlKey: true, metaKey: false }, false, DocumentFlavor.TRADITIONAL)).toBe(false);
    });
});
