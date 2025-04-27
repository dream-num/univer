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

import type { ISize } from '../../shared';
import { PaperType } from '../interfaces';

export const PAGE_SIZE: Record<PaperType, Required<ISize>> = {
    [PaperType.A3]: {
        width: 1123,
        height: 1587,
    },
    [PaperType.A4]: {
        width: 794,
        height: 1124,
    },
    [PaperType.A5]: {
        width: 559,
        height: 794,
    },
    [PaperType.B4]: {
        width: 944,
        height: 1344,
    },
    [PaperType.B5]: {
        width: 665,
        height: 944,
    },
    [PaperType.Executive]: {
        width: 696,
        height: 1008,
    },
    [PaperType.Folio]: {
        width: 816,
        height: 1248,
    },
    [PaperType.Legal]: {
        width: 816,
        height: 1344,
    },
    [PaperType.Letter]: {
        width: 816,
        height: 1056,
    },
    [PaperType.Statement]: {
        width: 528,
        height: 816,
    },
    [PaperType.Tabloid]: {
        width: 1056,
        height: 1632,
    },
};
