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

export const BorderWaveDouble = ({ className }: { className: string }) => (
    <svg className={className} width="120" height="8" viewBox="0 0 120 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M0 2 C7.5 -2, 15 6, 22.5 2 C30 -2, 37.5 6, 45 2 C52.5 -2, 60 6, 67.5 2 C75 -2, 82.5 6, 90 2 C97.5 -2, 105 6, 112.5 2 C120 -2, 127.5 6, 135 2"
            stroke="currentColor"
            strokeWidth="0.8"
            fill="none"
        />
        <path
            d="M0 6 C7.5 2, 15 10, 22.5 6 C30 2, 37.5 10, 45 6 C52.5 2, 60 10, 67.5 6 C75 2, 82.5 10, 90 6 C97.5 2, 105 10, 112.5 6 C120 2, 127.5 10, 135 6"
            stroke="currentColor"
            strokeWidth="0.8"
            fill="none"
        />
    </svg>
);
