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

interface IconProps {
    className?: string;
}

export const H1Icon: React.FC<IconProps> = ({ className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M3.33301 3.33398V12.6673M12.6663 3.33398V12.6673M3.33301 8.00065H12.6663" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const H2Icon: React.FC<IconProps> = ({ className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M3.33301 3.33398V12.6673M12.6663 3.33398V12.6673M3.33301 8.00065H12.6663" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.33301 6.66732C9.33301 5.93094 9.93329 5.33398 10.6663 5.33398C11.3994 5.33398 11.9997 5.93094 11.9997 6.66732C11.9997 7.40371 11.3994 8.00065 10.6663 8.00065" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const H3Icon: React.FC<IconProps> = ({ className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M3.33301 3.33398V12.6673M12.6663 3.33398V12.6673M3.33301 8.00065H12.6663" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.33301 6.66732C9.33301 5.93094 9.93329 5.33398 10.6663 5.33398C11.3994 5.33398 11.9997 5.93094 11.9997 6.66732C11.9997 7.40371 11.3994 8.00065 10.6663 8.00065M10.6663 8.00065C11.3994 8.00065 11.9997 8.59761 11.9997 9.33398C11.9997 10.0704 11.3994 10.6673 10.6663 10.6673C9.93329 10.6673 9.33301 10.0704 9.33301 9.33398" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const H4Icon: React.FC<IconProps> = ({ className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M3.33301 3.33398V12.6673M12.6663 3.33398V12.6673M3.33301 8.00065H12.6663" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.3337 10.6673V5.33398L9.33366 9.33398H12.0003" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const H5Icon: React.FC<IconProps> = ({ className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M3.33301 3.33398V12.6673M12.6663 3.33398V12.6673M3.33301 8.00065H12.6663" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.9997 7.33398H9.99967V5.33398H11.9997M9.99967 7.33398C9.99967 8.80474 11.1956 10.0007 12.6663 10.0007C11.1956 10.0007 9.99967 8.80474 9.99967 7.33398Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const TextIcon: React.FC<IconProps> = ({ className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M4 4H12M8 4V12" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const UnorderedListIcon: React.FC<IconProps> = ({ className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M5.33301 4H12.6663M5.33301 8H12.6663M5.33301 12H12.6663M3.33301 4V4.00667M3.33301 8V8.00667M3.33301 12V12.0067" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const OrderedListIcon: React.FC<IconProps> = ({ className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M5.33301 4H12.6663M5.33301 8H12.6663M5.33301 12H12.6663M2.66634 4H3.99967M3.33301 8H3.99967M2.66634 12H3.99967M3.33301 2.66732V4.00065M3.33301 6.66732V8.00065M3.33301 10.6673V12.0007" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const QuoteIcon: React.FC<IconProps> = ({ className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M3.33301 8.66667V6C3.33301 5.26362 3.93329 4.66667 4.66634 4.66667H5.99967C6.73272 4.66667 7.33301 5.26362 7.33301 6V8.66667C7.33301 9.40305 6.73272 10 5.99967 10H4.66634C3.93329 10 3.33301 9.40305 3.33301 8.66667Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.66699 8.66667V6C8.66699 5.26362 9.26727 4.66667 10.0003 4.66667H11.3337C12.0667 4.66667 12.667 5.26362 12.667 6V8.66667C12.667 9.40305 12.0667 10 11.3337 10H10.0003C9.26727 10 8.66699 9.40305 8.66699 8.66667Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const CopyIcon: React.FC<IconProps> = ({ className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M10.6663 10.6673H12.6663C13.0345 10.6673 13.333 10.3688 13.333 10.0007V4.00065C13.333 3.63246 13.0345 3.33398 12.6663 3.33398H6.66634C6.29815 3.33398 5.99967 3.63246 5.99967 4.00065V6.00065M9.33301 5.33398H3.33301C2.96482 5.33398 2.66634 5.63246 2.66634 6.00065V12.0007C2.66634 12.3688 2.96482 12.6673 3.33301 12.6673H9.33301C9.7012 12.6673 9.99967 12.3688 9.99967 12.0007V6.00065C9.99967 5.63246 9.7012 5.33398 9.33301 5.33398Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const CutIcon: React.FC<IconProps> = ({ className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M5.33366 12.0007C5.33366 13.1052 4.43814 14.0007 3.33366 14.0007C2.22909 14.0007 1.33366 13.1052 1.33366 12.0007C1.33366 10.8961 2.22909 10.0007 3.33366 10.0007C4.43814 10.0007 5.33366 10.8961 5.33366 12.0007Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.33366 4.00065C5.33366 5.10513 4.43814 6.00065 3.33366 6.00065C2.22909 6.00065 1.33366 5.10513 1.33366 4.00065C1.33366 2.89608 2.22909 2.00065 3.33366 2.00065C4.43814 2.00065 5.33366 2.89608 5.33366 4.00065Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.6663 3.33398L5.33301 12.6673M5.33301 3.33398L14.6663 12.6673" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const DeleteIcon: React.FC<IconProps> = ({ className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M2 4H3.33333M14 4H12.6667M3.33333 4V12.6667C3.33333 13.403 3.93029 14 4.66667 14H11.3333C12.0697 14 12.6667 13.403 12.6667 12.6667V4M3.33333 4H12.6667M10.6667 4V2.66667C10.6667 2.29848 10.3682 2 10 2H6C5.63181 2 5.33333 2.29848 5.33333 2.66667V4M6.66667 6.66667V11.3333M9.33333 6.66667V11.3333" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const TableIcon: React.FC<IconProps> = ({ className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.33" />
        <path d="M2 6H14M2 10H14M6 14V6M10 14V6" stroke="currentColor" strokeWidth="1.33" />
    </svg>
);

export const DividerIcon: React.FC<IconProps> = ({ className }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="1.33" strokeDasharray="2 2" />
    </svg>
);
