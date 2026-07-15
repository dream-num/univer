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

import { addLocale } from '../api';
import { numfmtTest } from './test-utils';

const date = 3290.1278435; // 1909-01-02 03:04:05.678

numfmtTest('locale options', (t) => {
    // default locale
    t.format('dddd, dd. mmmm yyy', date, 'Saturday, 02. January 1909');

    // General is localized
    addLocale({
        decimal: '·',
        positive: 'ᐩ',
        negative: '÷',
        percent: '٪',
        exponent: 'X',
    }, 'xx');
    t.format('General', 123456700000000, '1·23457Xᐩ14', { locale: 'xx' });
    t.format('General', 10000000000, '10000000000', { locale: 'xx' });
    t.format('General', 0.000000001, '0·000000001', { locale: 'xx' });
    t.format('General', 1234.56, '1234·56', { locale: 'xx' });
    t.format('General', 0.1, '0·1', { locale: 'xx' });

    // general should respect locale in all cases
    t.format('General', 0.0001, '0,0001', { locale: 'de' });
    t.format('General', 10000000000, '10000000000', { locale: 'de' });
    t.format('General', 1.1, '1,1', { locale: 'de' });
    t.format('General', 1.1, '1,1', { locale: 'de' });
    t.format('General', 1000000000.1, '1000000000', { locale: 'de' });
    t.format('General', 1.1111111111, '1,111111111', { locale: 'de' });
    t.format('General', 1.1e-9, '1,1E-09', { locale: 'de' });
    t.format('General', 1.1e-10, '1,1E-10', { locale: 'de' });
    t.format('General', 1.1e-10, '1,1E-10', { locale: 'de' });

    // #59
    t.format('General', 111.1111111, '111,1111111', { locale: 'de' });
    t.format('General', 111.11111111, '111,1111111', { locale: 'de' });
    t.format('General', 111.111111111, '111,1111111', { locale: 'de' });

    // different locale address modes (both is-IS and is_IS are supported)
    t.format('[$-is]dddd, dd. mmmm yyy', date, 'laugardagur, 02. janúar 1909');
    t.format('[$-is_IS]dddd, dd. mmmm yyy', date, 'laugardagur, 02. janúar 1909');
    t.format('[$-is_IS]dddd, dd. mmmm yyy', date, 'laugardagur, 02. janúar 1909');
    t.format('[$-is_IS]dddd, dd. mmmm yyy', date, 'laugardagur, 02. janúar 1909');
    t.format('[$-is-IS]dddd, dd. mmmm yyy', date, 'laugardagur, 02. janúar 1909');
    t.format('[$-040F]dddd, dd. mmmm yyy', date, 'laugardagur, 02. janúar 1909');
    t.format('[$-01040F]dddd, dd. mmmm yyy', date, 'laugardagur, 02. janúar 1909');
    t.format('[$-00040F]dddd, dd. mmmm yyy', date, 'laugardagur, 02. janúar 1909');
    t.format('[$-0000040F]dddd, dd. mmmm yyy', date, 'laugardagur, 02. janúar 1909');
    t.format('[$-0101040F]dddd, dd. mmmm yyy', date, 'laugardagur, 02. janúar 1909');
    t.format('dddd, dd. mmmm yyy', date, 'laugardagur, 02. janúar 1909', { locale: 'is' });
    // setting a locale does not overwrite the format locale
    t.format('[$-040F]dddd, dd. mmmm yyy', date, 'laugardagur, 02. janúar 1909', { locale: 'fr' });

    // all types are present
    t.format('d dd ddd dddd ddddd', date, '2 02 lau. laugardagur laugardagur', { locale: 'is' });
    t.format('m mm mmm mmmm mmmmm', date, '1 01 jan. janúar j', { locale: 'is' });
    t.format('#,##0.000', date, '3.290,128', { locale: 'is' });
    t.format('h AM/PM', date, '3 f.h.', { locale: 'is' });

    t.format('d dd ddd dddd ddddd', date, '2 02 周六 星期六 星期六', { locale: 'zh-CH' });
    t.format('m mm mmm mmmm mmmmm', date, '1 01 1月 一月 一', { locale: 'zh-CH' });
    t.format('#,##0.000', date, '3,290.128', { locale: 'zh-CH' });
    t.format('h AM/PM', date, '3 上午', { locale: 'zh-CH' });

    t.format('d dd ddd dddd ddddd', date, '2 02 сб суббота суббота', { locale: 0x0419 as never });
    t.format('m mm mmm mmmm mmmmm', date, '1 01 янв. января я', { locale: 0x0419 as never });
    t.format('#,##0.000', date, '3\u00A0290,128', { locale: 0x0419 as never });
    t.format('h AM/PM', date, '3 AM', { locale: 0x0419 as never });

    // Currency
    t.format('[$$-409]#,##0', 1234, '$1,234');
    t.format('#,##0\\ [$kr-438]', 1234, '1,234 kr');
    t.format('[$ISK] #,##0', 1234, 'ISK 1,234');
    t.format('[$ISK-] #,##0', 1234, 'ISK 1,234');
    t.format('[$NZ$-481]#,##0', 1234, 'NZ$1,234');
    t.format('[$whatever is here just gets through] #,##0', 1234, 'whatever is here just gets through 1,234');

    // Hijri month names are emitted
    t.format('[$-060409]mmmm', 42999, 'Muharram');
    t.format('[$-060409]mmmm', 43029, 'Safar');
    t.format('[$-060409]mmmm', 43058, 'Rabiʻ I');
    t.format('[$-060409]mmmm', 43088, 'Rabiʻ II');
    t.format('[$-060409]mmmm', 43118, 'Jumada I');
    t.format('[$-060409]mmmm', 43148, 'Jumada II');
    t.format('[$-060409]mmmm', 43177, 'Rajab');
    t.format('[$-060409]mmmm', 43207, 'Shaʻban');
    t.format('[$-060409]mmmm', 43237, 'Ramadan');
    t.format('[$-060409]mmmm', 43266, 'Shawwal');
    t.format('[$-060409]mmmm', 43295, 'Dhuʻl-Qiʻdah');
    t.format('[$-060409]mmmm', 43324, 'Dhuʻl-Hijjah');

    t.format('[$Fr.-807] #,##0.00', 12345.67, 'Fr. 12\'345.67');

    // TODO: names for hijri months
    // Next test is known to be incorrect, Excel emits "1439 محرم 1"
    t.format('B2yyyy mmmm d', 42999, '1439 Muharram 1', 'B2yyyy mmmm d' as never);

    t.format('[$-060409]yyyy mmmm d', 42999, '1439 Muharram 1', '[$-060409]yyyy mmmm d' as never);
    t.format('[$-060C01]yyyy mmmm d', 42999, '1439 رمضان 1', '[$-060C01]yyyy mmmm d' as never);
    t.format('[$-010C01]yyyy mmmm d', 42999, '2017 سبتمبر 21', '[$-010C01]yyyy mmmm d' as never);

    t.format('[$-0409]B2yyyy mmmm d', 42999, '2017 September 21', '[$-0409]yyyy mmmm d' as never);

    t.format('General', true, 'TRUE', { locale: 'en' });
    t.format('General', false, 'FALSE', { locale: 'en' });
    t.format('General', true, 'VRAI', { locale: 'fr' });
    t.format('General', false, 'FAUX', { locale: 'fr' });
    t.format('General', true, 'TRUE', { locale: 'is' });
    t.format('General', false, 'FALSE', { locale: 'is' });
    t.format('General', true, 'WAAR', { locale: 'nl' });
    t.format('General', false, 'ONWAAR', { locale: 'nl' });
});
