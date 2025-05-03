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

import React from 'react';

// TODO@jikkai: this component should be moved to the design package
// so it could be reused.

interface ISpinProps {
    loading: boolean;
    children: React.ReactNode;
}

const Spin = ({ loading, children }: ISpinProps) => {
    return (
        <div className="univer-relative univer-h-full univer-w-full">
            {loading && (
                <div
                    className={`
                      univer-absolute -univer-bottom-0.5 -univer-left-0.5 -univer-right-0.5 -univer-top-0.5 univer-z-10
                      univer-flex univer-items-center univer-justify-center univer-bg-white univer-backdrop-blur
                      dark:univer-bg-black
                    `}
                >
                    <div
                        className={`
                          univer-size-10 univer-animate-spin univer-rounded-full univer-border-4 univer-border-solid
                          univer-border-gray-100 univer-border-t-primary-500
                        `}
                    />

                </div>
            )}
            <div className={loading ? 'univer-pointer-events-none univer-blur-sm' : ''}>
                {children}
            </div>
        </div>
    );
};

export default Spin;
