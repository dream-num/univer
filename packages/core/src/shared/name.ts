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
 * The name you entered for the worksheet or chart is invalid. Please ensure:

    The name is no more than 31 characters.
    The first and last characters cannot be '
    The name does not contain any of the following characters: : \ / ? * [ or ].
    The name is not empty.
 * @param name
 * @returns
 */
export function nameCharacterCheck(name: string) {
    // Excel sheet name cannot be empty
    if (name.length === 0) {
        return false;
    }

    // Excel sheet name cannot exceed 31 characters
    if (name.length > 31) {
        return false;
    }

    // Excel sheet name cannot start or end with a single quote
    if (name.startsWith("'") || name.endsWith("'")) {
        return false;
    }

    // Excel sheet name cannot contain invalid characters
    const invalidChars = /[:\\\/\?\*\[\]]/;
    if (invalidChars.test(name)) {
        return false;
    }

    return true;
}
