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

export enum InterpolationPointType {
    INTERPOLATION_POINT_TYPE_UNSPECIFIED, // The default value, do not use.
    MIN, // The interpolation point uses the minimum value in the cells over the range of the conditional formatting.
    MAX, // The interpolation point uses the maximum value in the cells over the range of the conditional formatting.
    NUMBER, // The interpolation point uses exactly the value in InterpolationPoint.value
    PERCENT, // The interpolation point is the given percentage over all the cells in the range of the conditional formatting. This is equivalent to NUMBER if the value was: =(MAX(FLATTEN(range)) * (value / 100)) + (MIN(FLATTEN(range)) * (1 - (value / 100))) (where errors in the range are ignored when flattening).
    PERCENTILE, // The interpolation point is the given percentile over all the cells in the range of the conditional formatting. This is equivalent to NUMBER if the value was: =PERCENTILE(FLATTEN(range), value / 100) (where errors in the range are ignored when flattening).
}
