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

export const HelpHiddenTip = ({ onClick }: { onClick: () => void }) => {
    return (
        <div
            className={`
              univer-z-[15] univer-box-border univer-h-[18px] univer-cursor-pointer univer-overflow-visible
              univer-whitespace-nowrap univer-rounded-l univer-border univer-border-r-0 univer-border-gray-600
              univer-bg-primary-600 univer-p-0.5 univer-text-xs univer-font-bold univer-leading-[13px] univer-text-white
            `}
            onClick={onClick}
        >
            ?
        </div>
    );
};
