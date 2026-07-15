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

// Derived from numfmt 3.2.6 (MIT), commit c2cfdfa01bb1f24df51e985825671eb480daed4c.
// See packages/core/src/shared/numfmt/LICENSE.

// @vitest-environment node

import { numfmtTest } from './test-utils';

const date = 3290.1278435; // 1909-01-02 03:04:05.678

numfmtTest('Date specifiers:', (t) => {
    t.format('s', date, '6');
    t.format('ss', date, '06');
    t.format('sss', date, '06');
    t.format('ssss', date, '06');
    t.format('sssss', date, '06');
    t.format('ssssss', date, '06');
    t.format('S', date, '6');
    t.format('SS', date, '06');
    t.format('SSS', date, '06');
    t.format('SSSS', date, '06');
    t.format('SSSSS', date, '06');
    t.format('SSSSSS', date, '06');
    t.format('m', date, '1');
    t.format('mm', date, '01');
    t.format('mmm', date, 'Jan');
    t.format('mmmm', date, 'January');
    t.format('mmmmm', date, 'J');
    t.format('mmmmmm', date, 'January');
    t.format('M', date, '1');
    t.format('MM', date, '01');
    t.format('MMM', date, 'Jan');
    t.format('MMMM', date, 'January');
    t.format('MMMMM', date, 'J');
    t.format('MMMMMM', date, 'January');
    t.format('h', date, '3');
    t.format('hh', date, '03');
    t.format('hhh', date, '03');
    t.format('hhhh', date, '03');
    t.format('hhhhh', date, '03');
    t.format('hhhhhh', date, '03');
    t.format('H', date, '3');
    t.format('HH', date, '03');
    t.format('HHH', date, '03');
    t.format('HHHH', date, '03');
    t.format('HHHHH', date, '03');
    t.format('HHHHHH', date, '03');
    t.format('a', date, 'a');
    t.format('aa', date, 'aa');
    t.format('aaa', date, 'Sat');
    t.format('aaaa', date, 'Saturday');
    t.format('aaaaa', date, 'Saturday');
    t.format('aaaaaa', date, 'Saturday');
    t.format('d', date, '2');
    t.format('dd', date, '02');
    t.format('ddd', date, 'Sat');
    t.format('dddd', date, 'Saturday');
    t.format('ddddd', date, 'Saturday');
    t.format('dddddd', date, 'Saturday');
    t.format('D', date, '2');
    t.format('DD', date, '02');
    t.format('DDD', date, 'Sat');
    t.format('DDDD', date, 'Saturday');
    t.format('DDDDD', date, 'Saturday');
    t.format('DDDDDD', date, 'Saturday');
    t.format('y', date, '09');
    t.format('yy', date, '09');
    t.format('yyy', date, '1909');
    t.format('yyyy', date, '1909');
    t.format('yyyyy', date, '1909');
    t.format('yyyyyy', date, '1909');
    t.format('Y', date, '09');
    t.format('YY', date, '09');
    t.format('YYY', date, '1909');
    t.format('YYYY', date, '1909');
    t.format('YYYYY', date, '1909');
    t.format('YYYYYY', date, '1909');
    // elapsed
    t.format('[h]', date, '78963');
    t.format('[hh]', date, '78963');
    t.format('[hhh]', date, '78963');
    t.format('[hhhh]', date, '78963');
    t.format('[hhhhh]', date, '78963');
    t.format('[m]', date, '4737784');
    t.format('[mm]', date, '4737784');
    t.format('[mmm]', date, '4737784');
    t.format('[mmmm]', date, '4737784');
    t.format('[s]', date, '284267046');
    t.format('[ss]', date, '284267046');
    t.format('[sss]', date, '284267046');
    t.format('[ssss]', date, '284267046');
    // fractional seconds
    t.format('[s].0', date, '284267045.7');
    t.format('[s].00', date, '284267045.68');
    t.format('[s].000', date, '284267045.678');
    t.format('s.0', date, '5.7');
    t.format('s.00', date, '5.68');
    t.format('s.000', date, '5.678');
});

numfmtTest('Date specifiers: month vs. minute', (t) => {
    t.format('h', date, '3');
    t.format('m', date, '1');
    t.format('s', date, '6');

    t.format('h-h', date, '3-3');
    t.format('h-m', date, '3-4');
    t.format('h-s', date, '3-6');
    t.format('m-h', date, '1-3');
    t.format('m-m', date, '1-1');
    t.format('m-s', date, '4-6');
    t.format('s-h', date, '6-3');
    t.format('s-m', date, '6-4');
    t.format('s-s', date, '6-6');

    t.format('h-h-m', date, '3-3-4');
    t.format('h-h-s', date, '3-3-6');
    t.format('h-m-h', date, '3-4-3');
    t.format('h-m-m', date, '3-4-1');
    t.format('h-m-s', date, '3-4-6');
    t.format('h-s-h', date, '3-6-3');
    t.format('h-s-m', date, '3-6-4');
    t.format('h-s-s', date, '3-6-6');
    t.format('m-h-h', date, '1-3-3');
    t.format('m-h-m', date, '1-3-4');
    t.format('m-h-s', date, '1-3-6');
    t.format('m-m-h', date, '1-1-3');
    t.format('m-m-m', date, '1-1-1');
    t.format('m-m-s', date, '1-4-6');
    t.format('m-s-h', date, '4-6-3');
    t.format('m-s-m', date, '4-6-1');
    t.format('m-s-s', date, '4-6-6');
    t.format('s-h-h', date, '6-3-3');
    t.format('s-h-m', date, '6-3-4');
    t.format('s-h-s', date, '6-3-6');
    t.format('s-m-h', date, '6-4-3');
    t.format('s-m-m', date, '6-4-1');
    t.format('s-m-s', date, '6-4-6');
    t.format('s-s-h', date, '6-6-3');
    t.format('s-s-m', date, '6-6-4');

    t.format('h-m-m-s', date, '3-4-4-6');
    t.format('h-m-s-m', date, '3-4-6-1');
    t.format('h-s-m-m', date, '3-6-4-1');
    t.format('m-h-m-s', date, '1-3-4-6');
    t.format('m-h-s-m', date, '1-3-6-4');
    t.format('m-m-h-s', date, '1-1-3-6');
    t.format('m-m-s-h', date, '1-4-6-3');
    t.format('m-s-h-m', date, '4-6-3-4');
    t.format('m-s-m-h', date, '4-6-1-3');
    t.format('s-h-m-m', date, '6-3-4-1');
    t.format('s-m-h-m', date, '6-4-3-4');
    t.format('s-m-m-h', date, '6-4-1-3');

    t.format('y-m-d', date, '09-1-2');
    t.format('d-m-y', date, '2-1-09');
    t.format('yy-mm-dd', date, '09-01-02');

    t.format('yyyy', date, '1909');
    t.format('yyyy-mm', date, '1909-01');
    t.format('yyyy-mm-dd', date, '1909-01-02');
    t.format('yyyy-mm-dd\\Thh', date, '1909-01-02T03');
    t.format('yyyy-mm-dd\\Thh-mm', date, '1909-01-02T03-04');
    t.format('yyyy-mm-dd\\Thh-mm-ss', date, '1909-01-02T03-04-06');
    t.format('yyyy-mm-dd\\Thh-mm-ss.000', date, '1909-01-02T03-04-05.678');

    t.format('yyyy-mm-dd\\Thh-mm-ss.000', 60, '1900-02-29T00-00-00.000');
    t.format('yyyy-mm-dd\\Thh-mm-ss.000', 61, '1900-03-01T00-00-00.000');
});
