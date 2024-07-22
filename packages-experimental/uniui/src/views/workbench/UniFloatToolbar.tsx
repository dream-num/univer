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

import { flip, offset, shift, useFloating } from '@floating-ui/react-dom';
import React, { useEffect, useImperativeHandle } from 'react';
import type { Nullable } from '@univerjs/core';
import type { IUnitRendererProps } from './UniWorkbench';

export interface FloatingToolbarRef {
    update: () => void;
}

export const UniFloatingToolbar = React.forwardRef<FloatingToolbarRef, { node: Nullable<IUnitRendererProps>; anchorRef: React.MutableRefObject<HTMLElement | null> }>(({ node, anchorRef }, ref) => {
    const { x, y, refs, strategy, update } = useFloating({
        placement: 'top',
        middleware: [offset(10), flip(), shift({ padding: 5 })],
    });

    const { setReference, setFloating } = refs;

    useImperativeHandle(ref, () => ({
        update: () => update(),
    }), [update]);

    useEffect(() => {
        if (anchorRef.current) {
            setReference(anchorRef.current);
        }
    }, [anchorRef.current, setReference]);

    if (!node || !anchorRef.current) {
        return null;
    }

    return (
        <div
            className="floatingToolBar"
            ref={setFloating}
            style={{ position: strategy, top: y ?? 0, left: x ?? 0, backgroundColor: 'white', padding: '10px', border: '1px solid black' }}
        >
            <button>Here is a placeholder for floating toolbar</button>
        </div>
    );
});
