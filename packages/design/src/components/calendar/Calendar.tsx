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

import type { ButtonHTMLAttributes, KeyboardEvent } from 'react';
import { MoreDownIcon, MoreLeftIcon, MoreRightIcon } from '@univerjs/icons';
import { forwardRef, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { borderTopClassName, focusClassName } from '../../helper/class-utilities';
import { clsx } from '../../helper/clsx';
import { Button } from '../button/Button';
import { ConfigContext } from '../config-provider/ConfigProvider';
import { DropdownMenu } from '../dropdown-menu/DropdownMenu';
import { Dropdown } from '../dropdown/Dropdown';
import { TimeInput } from '../time-input/TimeInput';
import { VirtualList } from '../virtual-list/VirtualList';

const DEFAULT_YEAR_RANGE = 100;
const YEAR_ITEM_HEIGHT = 32;
const YEAR_LIST_HEIGHT = 224;

const FALLBACK_CALENDAR_LOCALE = {
    ariaLabels: {
        previousMonth: 'Previous month',
        nextMonth: 'Next month',
        selectYear: 'Select year',
        selectMonth: 'Select month',
    },
    year: '',
    weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

const DayButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => {
    const { className, ...restProps } = props;

    return (
        <button
            ref={ref}
            className={clsx(
                `
                  univer-box-border univer-inline-flex univer-size-8 univer-items-center univer-justify-center
                  univer-rounded-md univer-border-none univer-bg-transparent univer-p-0 univer-text-sm
                  univer-tabular-nums univer-transition-colors univer-duration-200
                  motion-reduce:univer-transition-none
                `,
                focusClassName,
                className
            )}
            type="button"
            {...restProps}
        />
    );
});

export interface ICalendarProps {
    className?: string;
    showTime?: boolean;
    showSelection?: boolean;
    max?: Date;
    min?: Date;
    value?: Date;
    onValueChange?: (date: Date, changeType: 'date' | 'time') => void;
}

export function Calendar(props: ICalendarProps) {
    const { className, max, min, showSelection = true, showTime = false, value, onValueChange } = props;

    const { direction = 'ltr', locale } = useContext(ConfigContext);

    const calendarLocale = (locale?.Calendar ?? FALLBACK_CALENDAR_LOCALE) as typeof FALLBACK_CALENDAR_LOCALE;
    const { ariaLabels, year, weekDays, months } = calendarLocale;

    const today = new Date();
    const initialDate = value ?? today;
    const [viewState, setViewState] = useState(() => ({
        year: initialDate.getFullYear(),
        month: initialDate.getMonth(),
    }));
    const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
    const dayButtonsRef = useRef<Map<number, HTMLButtonElement>>(new Map());
    const pendingFocusDayRef = useRef<number | null>(null);
    const prevValueTimeRef = useRef<number | undefined>(value?.getTime());

    const valueTime = value?.getTime();
    if (valueTime !== undefined && !Number.isNaN(valueTime) && valueTime !== prevValueTimeRef.current) {
        prevValueTimeRef.current = valueTime;
        const nextYear = value!.getFullYear();
        const nextMonth = value!.getMonth();
        if (viewState.year !== nextYear || viewState.month !== nextMonth) {
            setViewState({ year: nextYear, month: nextMonth });
        }
    }

    const currentYear = viewState.year;
    const currentMonth = viewState.month;

    useEffect(() => {
        if (pendingFocusDayRef.current !== null) {
            const targetDay = pendingFocusDayRef.current;
            pendingFocusDayRef.current = null;
            dayButtonsRef.current.get(targetDay)?.focus();
        }
    }, [currentYear, currentMonth]);

    function prevMonth() {
        setViewState((prev) => (prev.month === 0
            ? { year: prev.year - 1, month: 11 }
            : { year: prev.year, month: prev.month - 1 }));
    }

    function nextMonth() {
        setViewState((prev) => (prev.month === 11
            ? { year: prev.year + 1, month: 0 }
            : { year: prev.year, month: prev.month + 1 }));
    }

    function handleChangeMonth(month: string) {
        setViewState((prev) => ({ ...prev, month: Number(month) }));
    }

    function handleChangeYear(nextYear: number) {
        setViewState((prev) => ({ ...prev, year: nextYear }));
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

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    const days = useMemo(() => {
        const daysArray: Array<number | null> = [];
        for (let i = 0; i < firstDay; i++) {
            daysArray.push(null);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            daysArray.push(d);
        }
        return daysArray;
    }, [daysInMonth, firstDay]);

    function isSelected(day: number) {
        return Boolean(
            showSelection &&
            day &&
            currentYear === value?.getFullYear() &&
            currentMonth === value?.getMonth() &&
            day === value?.getDate()
        );
    }

    function isToday(day: number) {
        return Boolean(
            day &&
            currentYear === today.getFullYear() &&
            currentMonth === today.getMonth() &&
            day === today.getDate()
        );
    }

    function isDisabled(day: number) {
        if (!day) return false;
        const hours = value?.getHours() ?? today.getHours();
        const minutes = value?.getMinutes() ?? today.getMinutes();
        const seconds = value?.getSeconds() ?? today.getSeconds();
        const milliseconds = value?.getMilliseconds() ?? today.getMilliseconds();
        const d = new Date(currentYear, currentMonth, day, hours, minutes, seconds, milliseconds);
        if (min && d < min) return true;
        if (max && d > max) return true;
        return false;
    }

    function handleChangeDate(day: number) {
        if (isDisabled(day)) return;
        const hours = value?.getHours() ?? today.getHours();
        const minutes = value?.getMinutes() ?? today.getMinutes();
        const seconds = value?.getSeconds() ?? today.getSeconds();
        const milliseconds = value?.getMilliseconds() ?? today.getMilliseconds();

        const selectedDate = new Date(currentYear, currentMonth, day, hours, minutes, seconds, milliseconds);

        onValueChange?.(selectedDate, 'date');
    }

    function handleDayKeyDown(event: KeyboardEvent<HTMLButtonElement>, day: number) {
        const rtlFactor = direction === 'rtl' ? -1 : 1;
        let offset = 0;
        if (event.key === 'ArrowRight') {
            offset = 1 * rtlFactor;
        } else if (event.key === 'ArrowLeft') {
            offset = -1 * rtlFactor;
        } else if (event.key === 'ArrowDown') {
            offset = 7;
        } else if (event.key === 'ArrowUp') {
            offset = -7;
        } else {
            return;
        }

        event.preventDefault();
        const nextDate = new Date(currentYear, currentMonth, day + offset);
        const targetYear = nextDate.getFullYear();
        const targetMonth = nextDate.getMonth();
        const targetDay = nextDate.getDate();

        if (targetYear === currentYear && targetMonth === currentMonth) {
            dayButtonsRef.current.get(targetDay)?.focus();
        } else {
            pendingFocusDayRef.current = targetDay;
            setViewState({ year: targetYear, month: targetMonth });
        }
    }

    function handleChangeTime(time: Date) {
        const hours = time.getHours();
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();
        const milliseconds = time.getMilliseconds();

        const updatedDate = new Date(currentYear, currentMonth, value?.getDate() ?? today.getDate(), hours, minutes, seconds, milliseconds);

        onValueChange?.(updatedDate, 'time');
    }

    return (
        <div
            data-u-comp="calendar"
            dir={direction}
            className={clsx(`
              univer-mx-auto univer-w-fit univer-max-w-full univer-select-none univer-rounded-md univer-bg-gray-0
              univer-text-gray-900
              dark:!univer-bg-gray-700 dark:!univer-text-gray-0
            `, className)}
        >
            <nav className="univer-mb-2 univer-flex univer-items-center univer-justify-between univer-gap-1">
                <DayButton
                    className="
                      univer-cursor-pointer univer-text-gray-500
                      hover:univer-bg-gray-100 hover:univer-text-gray-900
                      dark:!univer-text-gray-300
                      dark:hover:!univer-bg-gray-600 dark:hover:!univer-text-gray-0
                    "
                    aria-label={ariaLabels.previousMonth}
                    onClick={prevMonth}
                >
                    <MoreLeftIcon
                        aria-hidden="true"
                        preserveStrokeWidth
                        className="
                          univer-size-4
                          rtl:univer-rotate-180
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
                                        className={clsx(
                                            `
                                              univer-flex univer-h-8 univer-w-full univer-cursor-pointer
                                              univer-items-center univer-justify-center univer-rounded
                                              univer-border-none univer-bg-transparent univer-px-2 univer-text-sm
                                              univer-tabular-nums univer-text-gray-900 univer-transition-colors
                                              univer-duration-200
                                              hover:univer-bg-gray-100
                                              motion-reduce:univer-transition-none
                                              dark:!univer-text-gray-0
                                              dark:hover:!univer-bg-gray-600
                                            `,
                                            focusClassName,
                                            item.year === currentYear && `
                                              univer-bg-primary-50 univer-font-medium univer-text-primary-600
                                              dark:!univer-bg-gray-600 dark:!univer-text-primary-300
                                            `
                                        )}
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
                            className="univer-h-7 univer-gap-1 univer-px-2 univer-tabular-nums"
                            aria-label={ariaLabels.selectYear}
                        >
                            <span>
                                {currentYear}
                                {year}
                            </span>
                            <MoreDownIcon
                                aria-hidden="true"
                                preserveStrokeWidth
                                className="
                                  !univer-size-3 univer-text-gray-500
                                  dark:!univer-text-gray-300
                                "
                            />
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
                            className="univer-h-7 univer-gap-1 univer-px-2"
                            aria-label={ariaLabels.selectMonth}
                        >
                            <span>{months[currentMonth]}</span>
                            <MoreDownIcon
                                aria-hidden="true"
                                preserveStrokeWidth
                                className="
                                  !univer-size-3 univer-text-gray-500
                                  dark:!univer-text-gray-300
                                "
                            />
                        </Button>
                    </DropdownMenu>
                </span>
                <DayButton
                    className="
                      univer-cursor-pointer univer-text-gray-500
                      hover:univer-bg-gray-100 hover:univer-text-gray-900
                      dark:!univer-text-gray-300
                      dark:hover:!univer-bg-gray-600 dark:hover:!univer-text-gray-0
                    "
                    aria-label={ariaLabels.nextMonth}
                    onClick={nextMonth}
                >
                    <MoreRightIcon
                        aria-hidden="true"
                        preserveStrokeWidth
                        className="
                          univer-size-4
                          rtl:univer-rotate-180
                        "
                    />
                </DayButton>
            </nav>

            <div
                className="
                  univer-mb-1 univer-grid univer-grid-cols-7 univer-gap-0.5 univer-text-center univer-text-xs
                  univer-font-medium univer-text-gray-500
                  dark:!univer-text-gray-300
                "
            >
                {weekDays.map((wd) => (
                    <div key={wd} className="univer-flex univer-size-8 univer-items-center univer-justify-center">
                        {wd}
                    </div>
                ))}
            </div>

            <div className="univer-grid univer-grid-cols-7 univer-gap-0.5 univer-text-center">
                {days.map((day, idx) => {
                    if (!day) {
                        return <div key={`empty-${idx}`} className="univer-size-8" />;
                    }

                    const selected = isSelected(day);
                    const todayCell = isToday(day);
                    const disabled = isDisabled(day);

                    return (
                        <DayButton
                            key={day}
                            aria-pressed={selected}
                            aria-current={todayCell ? 'date' : undefined}
                            className={clsx(
                                selected && `
                                  univer-cursor-pointer !univer-bg-primary-600 univer-font-medium univer-text-gray-0
                                  hover:!univer-bg-primary-500
                                  active:!univer-bg-primary-700
                                `,
                                !selected && todayCell && !disabled && `
                                  univer-cursor-pointer univer-bg-primary-50 univer-font-medium univer-text-primary-600
                                  hover:univer-bg-primary-100
                                  dark:!univer-bg-primary-900 dark:!univer-text-primary-300
                                  dark:hover:!univer-bg-primary-800
                                `,
                                !selected && !todayCell && !disabled && `
                                  univer-cursor-pointer univer-text-gray-900
                                  hover:univer-bg-gray-100
                                  active:univer-bg-gray-200
                                  dark:!univer-text-gray-0
                                  dark:hover:!univer-bg-gray-600
                                `,
                                disabled && `
                                  univer-cursor-not-allowed univer-text-gray-400 univer-opacity-50
                                  dark:!univer-text-gray-500
                                `
                            )}
                            disabled={disabled}
                            onClick={() => handleChangeDate(day)}
                            onKeyDown={(event) => handleDayKeyDown(event, day)}
                            ref={(el) => {
                                if (el) {
                                    dayButtonsRef.current.set(day, el);
                                } else {
                                    dayButtonsRef.current.delete(day);
                                }
                            }}
                        >
                            {day}
                        </DayButton>
                    );
                })}
            </div>

            {/* time input */}
            {showTime && (
                <div className={clsx('univer-mt-2.5 univer-pt-2.5', borderTopClassName)}>
                    <TimeInput
                        value={value}
                        onValueChange={handleChangeTime}
                    />
                </div>
            )}
        </div>
    );
}
