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

import '@univerjs/sheets/facade';
import '@univerjs/ui/facade';
import '@unvierjs/docs-ui/facade';
import '@univerjs/sheets-ui/facade';
import '@univerjs/sheets-data-validation/facade';
import '@univerjs/engine-formula/facade';
import '@univerjs/sheets-filter/facade';
import '@unvierjs/sheets-formula/facade';
import '@unvierjs/sheets-numfmt/facade'; // TODO: extract
import '@univerjs/sheets-hyper-link-ui/facade'; // TODO: extract

export { FHooks, FUniver } from '@univerjs/core';
export { FFormula } from '@univerjs/engine-formula/facade';

// #region

export { FPermission, FRange, FSelection, FWorkbook, FWorksheet } from '@univerjs/sheets/facade';
export { FDataValidation, FDataValidationBuilder } from '@univerjs/sheets-data-validation/facade';
export { FFilter } from '@univerjs/sheets-filter/facade';
export { FThreadComment } from '@univerjs/sheets-thread-comment/facade';
export { FSheetHooks } from '@univerjs/sheets-ui/facade';

// #endregion
