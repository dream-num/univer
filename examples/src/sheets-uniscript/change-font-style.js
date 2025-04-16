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

// eslint-disable-next-line no-undef
const activeSheet = univerAPI.getActiveWorkbook().getActiveSheet();

// Set A1:B2 to bold
activeSheet.getRange(0, 0, 2, 2).setFontWeight('bold');
// Set B2 to normal
activeSheet.getRange(1, 1, 1, 1).setFontWeight('normal');

setTimeout(() => {
    // reset A1 to normal
    activeSheet.getRange(0, 0, 1, 1).setFontWeight(null);
}, 3000);
