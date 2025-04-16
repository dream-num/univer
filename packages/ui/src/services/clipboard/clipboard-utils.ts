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
 * This function is used to check if the system supports full clipboard API,
 * especially for the clipboard.readText() API.
 *
 * @returns if the system supports clipboard API
 */
export function supportClipboardAPI(): boolean {
    // In unsecure context, navigator.clipboard does not exist.
    return typeof navigator.clipboard !== 'undefined' && typeof navigator.clipboard.readText !== 'undefined';
}
