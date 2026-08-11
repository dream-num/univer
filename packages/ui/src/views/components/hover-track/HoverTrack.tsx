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

import type { CSSProperties } from 'react';
import { clsx } from '@univerjs/design';

export const HOVER_TRACK_HOST_CLASS_NAME = 'univer-group/hover-track';

const HOVER_TRACK_MASK = 'linear-gradient(currentColor 0 0) content-box, linear-gradient(currentColor 0 0)';
const HOVER_TRACK_MASK_STYLE: CSSProperties = {
    WebkitMask: HOVER_TRACK_MASK,
    WebkitMaskComposite: 'xor',
    mask: HOVER_TRACK_MASK,
    maskComposite: 'exclude',
};

export function HoverTrack(props: { className?: string }) {
    return (
        <span
            aria-hidden="true"
            className={clsx(
                `
                  univer-pointer-events-none univer-absolute univer-inset-0 univer-box-border univer-overflow-hidden
                  univer-rounded-[inherit] univer-p-px univer-opacity-0 univer-transition-opacity univer-duration-150
                  group-hover/hover-track:univer-opacity-100
                `,
                props.className
            )}
            data-u-comp="hover-track"
            style={HOVER_TRACK_MASK_STYLE}
        >
            <span
                className="
                  univer-absolute -univer-inset-full
                  univer-bg-[conic-gradient(from_0deg,transparent_0deg,transparent_282deg,var(--univer-primary-700)_318deg,var(--univer-primary-500)_342deg,transparent_360deg)]
                  motion-safe:group-hover/hover-track:univer-animate-[spin_5s_linear_infinite]
                  motion-reduce:univer-bg-primary-700
                  dark:univer-bg-[conic-gradient(from_0deg,transparent_0deg,transparent_282deg,var(--univer-primary-300)_318deg,var(--univer-primary-500)_342deg,transparent_360deg)]
                  dark:motion-reduce:univer-bg-primary-300
                "
            />
        </span>
    );
}
