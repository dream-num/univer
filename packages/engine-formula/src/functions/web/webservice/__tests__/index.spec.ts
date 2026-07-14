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
import { ErrorType } from '../../../../basics/error-type';
import { StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_WEB } from '../../function-names';
import { Webservice } from '../index';

describe('Test webservice function', () => {
    it('returns N/A without issuing a network request until web requests are supported', () => {
        const testFunction = new Webservice(FUNCTION_NAMES_WEB.WEBSERVICE);

        const result = testFunction.calculate(StringValueObject.create('https://example.com'));

        expect(getObjectValue(result)).toBe(ErrorType.NA);
    });
});
