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
import { mergeDocFloatDomRuntimeProps } from './doc-float-dom.controller';

describe('mergeDocFloatDomRuntimeProps', () => {
    it('preserves existing props while adding custom block runtime viewport', () => {
        expect(mergeDocFloatDomRuntimeProps({ keep: true }, {
            customBlockRenderViewport: { bleedLeft: 96, bleedWidth: 1440, contentHeight: 720, contentWidth: 1280, height: 480, viewportHeight: 320 },
        } as never)).toEqual({
            customBlockRenderViewport: { bleedLeft: 96, bleedWidth: 1440, contentHeight: 720, contentWidth: 1280, height: 480, viewportHeight: 320 },
            keep: true,
        });
    });

    it('keeps existing props when no valid runtime viewport is available', () => {
        expect(mergeDocFloatDomRuntimeProps({ keep: true }, {
            customBlockRenderViewport: { contentWidth: 0 },
        } as never)).toEqual({ keep: true });
    });
});
