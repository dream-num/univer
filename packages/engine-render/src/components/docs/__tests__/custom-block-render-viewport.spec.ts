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

import { afterEach, describe, expect, it } from 'vitest';
import { getDocsCustomBlockRenderViewport, setDocsCustomBlockRenderViewportProvider } from '../custom-block-render-viewport';

describe('docs custom block render viewport provider registry', () => {
    afterEach(() => {
        setDocsCustomBlockRenderViewportProvider(null);
    });

    it('keeps providers for multiple document render units isolated by unit id', () => {
        const unregisterHost = setDocsCustomBlockRenderViewportProvider((unitId) =>
            unitId === 'host-doc'
                ? { height: 700, width: 900, contentHeight: 700 }
                : null
        );
        const unregisterChild = setDocsCustomBlockRenderViewportProvider((unitId) =>
            unitId === 'child-doc'
                ? { height: 120, width: 180, contentHeight: 120 }
                : null
        );

        expect(getDocsCustomBlockRenderViewport('host-doc', 'block-1', {
            fallbackHeight: 480,
            fallbackWidth: 960,
        })).toMatchObject({ height: 700, width: 900 });
        expect(getDocsCustomBlockRenderViewport('child-doc', 'block-1', {
            fallbackHeight: 480,
            fallbackWidth: 960,
        })).toMatchObject({ height: 120, width: 180 });

        unregisterChild();
        expect(getDocsCustomBlockRenderViewport('host-doc', 'block-1', {
            fallbackHeight: 480,
            fallbackWidth: 960,
        })).toMatchObject({ height: 700, width: 900 });

        unregisterHost();
        expect(getDocsCustomBlockRenderViewport('host-doc', 'block-1', {
            fallbackHeight: 480,
            fallbackWidth: 960,
        })).toBeNull();
    });
});
