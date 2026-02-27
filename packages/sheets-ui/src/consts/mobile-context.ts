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

/**
 * Context key indicating that pinch-to-zoom gesture is in progress on mobile.
 * Used to prevent selection operations during pinch zoom.
 */
export const MOBILE_PINCH_ZOOMING = 'MOBILE_PINCH_ZOOMING';

/**
 * Context key indicating that selection is being expanded on mobile (dragging fill controls).
 * Used to prevent scroll/inertia/zoom operations during selection expansion.
 */
export const MOBILE_EXPANDING_SELECTION = 'MOBILE_EXPANDING_SELECTION';
