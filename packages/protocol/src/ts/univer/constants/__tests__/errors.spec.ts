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

import { describe, expect, it } from 'vitest';
import { ErrorCode } from '../errors';

describe('Office export error protocol', () => {
    it.each([
        ['LICENSE_EXPORT_SIZE_EXCEEDED', 9004],
        ['LICENSE_EXPORT_QUOTA_EXCEEDED', 9006],
        ['LICENSE_POLICY_INVALID', 9007],
        ['LICENSE_USAGE_STATE_INVALID', 9008],
        ['LICENSE_USAGE_STORAGE_ERROR', 9009],
        ['LICENSE_CONCURRENCY_TIMEOUT', 9010],
        ['LICENSE_VERSION_NOT_ALLOWED', 9012],
        ['LICENSE_NOT_YET_EFFECTIVE', 9013],
        ['LICENSE_UNIT_TYPE_REJECTED', 9014],
        ['LICENSE_INVALID', 9015],
        ['LICENSE_EDITING_CONNECTIONS_EXCEEDED', 9016],
        ['LICENSE_NODES_EXCEEDED', 9017],
        ['LICENSE_DOMAIN_REJECTED', 9018],
    ] as const)('preserves the public wire value %s = %i', (name, code) => {
        expect(ErrorCode[name]).toBe(code);
    });
});
