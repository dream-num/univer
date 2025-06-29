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

import { borderClassName, clsx } from '@univerjs/design';

export const RangeLoading = () => {
    return (
        <div
            className={clsx(`
              univer-flex univer-size-full univer-origin-top-left univer-items-center univer-justify-center
              univer-bg-white
              dark:!univer-bg-gray-900
            `, borderClassName)}
        >
            Loading...
        </div>
    );
};
