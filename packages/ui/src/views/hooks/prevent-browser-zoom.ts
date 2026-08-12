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

export function preventBrowserZoomInContainers(containers: readonly HTMLElement[]): () => void {
    const uniqueContainers = new Set(containers);
    const handleWheel = (event: WheelEvent): void => {
        if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
        }
    };
    const handleGesture = (event: Event): void => event.preventDefault();

    uniqueContainers.forEach((container) => {
        container.addEventListener('wheel', handleWheel, { capture: true, passive: false });
        container.addEventListener('gesturestart', handleGesture, { capture: true, passive: false });
        container.addEventListener('gesturechange', handleGesture, { capture: true, passive: false });
    });

    return () => {
        uniqueContainers.forEach((container) => {
            container.removeEventListener('wheel', handleWheel, true);
            container.removeEventListener('gesturestart', handleGesture, true);
            container.removeEventListener('gesturechange', handleGesture, true);
        });
    };
}
