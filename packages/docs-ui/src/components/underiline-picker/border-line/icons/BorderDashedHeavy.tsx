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

export const BorderDashedHeavy = ({ className }: { className: string }) => (
    <svg className={className} width="118" height="3" viewBox="0 0 118 3" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line
            x1="0"
            y1="1.5"
            x2="118"
            y2="1.5"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="8 4"
            shapeRendering="crispEdges"
        />
    </svg>
);
