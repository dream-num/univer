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

import type { ButtonHTMLAttributes } from 'react';
import { MoreRightIcon } from '@univerjs/icons';
import { useContext, useMemo, useState } from 'react';
import { clsx } from '../../helper/clsx';
import { Button } from '../button/Button';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { DropdownMenu } from '../dropdown-menu/DropdownMenu';
import { Dropdown } from '../dropdown/Dropdown';
import { TimeInput } from '../time-input/TimeInput';
import { VirtualList } from '../virtual-list';

const DEFAULT_YEAR_RANGE = 100;
const YEAR_ITEM_HEIGHT = 32;
const YEAR_LIST_HEIGHT = 224;

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

function DayButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
    const { className, ...restProps } = props;

    return (
        <button
            className={clsx(`
              univer-size-7 univer-rounded-md univer-border-none univer-bg-transparent univer-p-1 univer-transition-all
              hover:univer-bg-gray-200
              dark:hover:!univer-bg-gray-600
            `, className)}
            type="button"
            {...restProps}
        />
    );
}

interface ICalendarProps {
    className?: string;
    showTime?: boolean;
    max?: Date;
    min?: Date;
    value?: Date;
    onValueChange?: (date: Date) => void;
}

export function Calendar(props: ICalendarProps) {
    const { className, max, min, showTime = false, value, onValueChange } = props;

    const { direction = 'ltr', locale } = useContext(ConfigContext);

    const { ariaLabels, year, weekDays, months } = locale?.Calendar as {
        ariaLabels: {
            previousMonth: string;
            nextMonth: string;
            selectYear: string;
            selectMonth: string;
        };
        year: string;
        weekDays: string[];
        months: string[];
    };

    const today = new Date();
    const [currentYear, setCurrentYear] = useState((value ?? today).getFullYear());
    const [currentMonth, setCurrentMonth] = useState((value ?? today).getMonth());
    const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

    function prevMonth() {
        setCurrentMonth((prev) => {
            if (prev === 0) {
                setCurrentYear((y) => y - 1);
                return 11;
            }
            return prev - 1;
        });
    }

    function nextMonth() {
        setCurrentMonth((prev) => {
            if (prev === 11) {
                setCurrentYear((y) => y + 1);
                return 0;
            }
            return prev + 1;
        });
    }

    function handleChangeMonth(month: string) {
        setCurrentMonth(Number(month));
    }

    function handleChangeYear(year: number) {
        setCurrentYear(year);
        setYearDropdownOpen(false);
    }

    const yearOptions = useMemo(() => {
        const startYear = min?.getFullYear() ?? currentYear - DEFAULT_YEAR_RANGE;
        const endYear = max?.getFullYear() ?? currentYear + DEFAULT_YEAR_RANGE;

        return Array.from(
            { length: Math.max(0, endYear - startYear + 1) },
            (_, index) => ({ year: startYear + index })
        );
    }, [currentYear, max, min]);

    const currentYearIndex = Math.max(0, yearOptions.findIndex((item) => item.year === currentYear));

    const monthMenuItems = useMemo(() => [{
        type: 'radio' as const,
        value: String(currentMonth),
        hideIndicator: true,
        options: months.map((month, index) => ({
            label: month,
            value: String(index),
        })),
        onSelect: handleChangeMonth,
    }], [currentMonth, months]);

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfWeek(currentYear, currentMonth);

    const days = useMemo(() => {
        const daysArray = [];
        for (let i = 0; i < firstDay; i++) {
            daysArray.push(null);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            daysArray.push(d);
        }
        return daysArray;
    }, [daysInMonth, firstDay]);

    function isSelected(day: number) {
        return day && currentYear === value?.getFullYear() && currentMonth === value?.getMonth() && day === value?.getDate();
    }

    function isToday(day: number) {
        return day && currentYear === today.getFullYear() && currentMonth === today.getMonth() && day === today.getDate();
    }

    function isDisabled(day: number) {
        if (!day) return false;
        const hours = value?.getHours() ?? today.getHours();
        const minutes = value?.getMinutes() ?? today.getMinutes();
        const seconds = value?.getSeconds() ?? today.getSeconds();
        const d = new Date(currentYear, currentMonth, day, hours, minutes, seconds);
        if (min && d < min) return true;
        if (max && d > max) return true;
        return false;
    }

    function handleChangeDate(day: number) {
        if (isDisabled(day)) return;
        const hours = value?.getHours() ?? today.getHours();
        const minutes = value?.getMinutes() ?? today.getMinutes();
        const seconds = value?.getSeconds() ?? today.getSeconds();

        const selectedDate = new Date(currentYear, currentMonth, day, hours, minutes, seconds);

        onValueChange?.(selectedDate);
    }

    function handleChangeTime(time: Date) {
        const hours = time.getHours();
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();

        const updatedDate = new Date(currentYear, currentMonth, value?.getDate() ?? today.getDate(), hours, minutes, seconds);

        onValueChange?.(updatedDate);
    }

    return (
        <div
            data-u-comp="calendar"
            dir={direction}
            className={clsx(`
              univer-mx-auto univer-max-w-xs univer-select-none univer-rounded univer-bg-white univer-text-gray-900
              dark:!univer-bg-gray-900 dark:!univer-text-white
            `, className)}
        >
            <nav
                className="univer-mb-4 univer-flex univer-items-center univer-justify-between"
            >
                <DayButton
                    className={`
                      univer-text-lg univer-text-gray-500
                      dark:!univer-text-gray-200
                    `}
                    aria-label={ariaLabels.previousMonth}
                    onClick={prevMonth}
                >
                    <MoreRightIcon
                        className="
                          univer-rotate-180
                          rtl:!univer-rotate-0
                        "
                    />
                </DayButton>
                <span className="univer-flex univer-items-center univer-gap-0.5 univer-text-sm univer-font-medium">
                    <Dropdown
                        align="center"
                        className="univer-w-24 univer-p-1.5"
                        open={yearDropdownOpen}
                        overlay={(
                            <VirtualList
                                className="univer-rounded"
                                data={yearOptions}
                                height={YEAR_LIST_HEIGHT}
                                initialScrollIndex={currentYearIndex}
                                itemHeight={YEAR_ITEM_HEIGHT}
                                itemKey="year"
                            >
                                {(item) => (
                                    <button
                                        className={clsx(`
                                          univer-flex univer-h-8 univer-w-full univer-items-center univer-justify-center
                                          univer-rounded univer-border-none univer-bg-transparent univer-px-2
                                          univer-text-sm univer-text-gray-900 univer-transition-colors
                                          hover:univer-bg-gray-100
                                          dark:!univer-text-white
                                          dark:hover:!univer-bg-gray-600
                                        `, {
                                            'univer-bg-gray-200 dark:!univer-bg-gray-500': item.year === currentYear,
                                        })}
                                        type="button"
                                        onClick={() => handleChangeYear(item.year)}
                                    >
                                        {item.year}
                                    </button>
                                )}
                            </VirtualList>
                        )}
                        onOpenChange={setYearDropdownOpen}
                    >
                        <Button
                            variant="text"
                            type="button"
                            aria-label={ariaLabels.selectYear}
                        >
                            {currentYear}
                            {year}
                        </Button>
                    </Dropdown>
                    <DropdownMenu
                        align="center"
                        className="univer-max-h-80 univer-min-w-28 univer-overflow-auto"
                        items={monthMenuItems}
                    >
                        <Button
                            variant="text"
                            type="button"
                            aria-label={ariaLabels.selectMonth}
                        >
                            {months[currentMonth]}
                        </Button>
                    </DropdownMenu>
                </span>
                <DayButton
                    className={`
                      univer-text-lg univer-text-gray-500
                      dark:!univer-text-gray-200
                    `}
                    aria-label={ariaLabels.nextMonth}
                    onClick={nextMonth}
                >
                    <MoreRightIcon className="rtl:univer-rotate-180" />
                </DayButton>
            </nav>

            <div
                className={`
                  univer-mb-1 univer-grid univer-grid-cols-7 univer-gap-1 univer-text-center univer-text-sm
                  univer-text-gray-500
                  dark:!univer-text-gray-200
                `}
            >
                {weekDays.map((wd) => (
                    <div key={wd}>{wd}</div>
                ))}
            </div>

            <div className="univer-grid univer-grid-cols-7 univer-gap-1 univer-text-center">
                {days.map((day, idx) =>
                    day
                        ? (
                            <DayButton
                                key={idx}
                                className={clsx({
                                    '!univer-bg-primary-600 univer-font-bold univer-text-white': !isToday(day) && isSelected(day),
                                    'dark:!univer-text-white': !isToday(day) && !isSelected(day),
                                    '!univer-bg-primary-600 univer-text-white': isToday(day) && isSelected(day),
                                    'univer-font-semibold univer-text-primary-600 dark:!univer-text-primary-500': isToday(day) && !isSelected(day),
                                    'univer-cursor-not-allowed univer-opacity-40': isDisabled(day),
                                    'univer-hover:bg-primary-100 univer-cursor-pointer univer-text-gray-800': !isSelected(day) && !isDisabled(day),
                                })}
                                onClick={() => handleChangeDate(day)}
                                disabled={isDisabled(day)}
                            >
                                {day}
                            </DayButton>
                        )
                        : <div key={idx} />
                )}
            </div>

            {/* time input */}
            {showTime && (
                <TimeInput
                    value={value}
                    onValueChange={handleChangeTime}
                />
            )}
        </div>
    );
};
