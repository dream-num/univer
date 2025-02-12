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

export const DEFAULT_TOKEN_TYPE_PARAMETER = 'P_1';

export const DEFAULT_TOKEN_TYPE_ROOT = 'R_1';

export const DEFAULT_TOKEN_TYPE_LAMBDA_PARAMETER = 'L_1';

export const DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER = 'LR_1';

export const DEFAULT_TOKEN_TYPE_LAMBDA_OMIT_PARAMETER = 'LO_1';

export const DEFAULT_TOKEN_LET_FUNCTION_NAME = 'LET';

export const DEFAULT_TOKEN_LAMBDA_FUNCTION_NAME = 'LAMBDA';

export const DEFAULT_TOKEN_CUBE_FUNCTION_NAME = 'CUBE';

export const FORCED_RECALCULATION_FUNCTION_NAME = new Set<string>(['RAND', 'RANDBETWEEN', 'NOW', 'TODAY']);
