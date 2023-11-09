const currencySymbols = [
    '¤',
    '$',
    '£',
    '¥',
    '֏',
    '؋',
    '৳',
    '฿',
    '៛',
    '₡',
    '₦',
    '₩',
    '₪',
    '₫',
    '€',
    '₭',
    '₮',
    '₱',
    '₲',
    '₴',
    '₸',
    '₹',
    '₺',
    '₼',
    '₽',
    '₾',
    '₿',
];

export const getCurrencyType = (pattern: string) => {
    const item = currencySymbols.find((code) => pattern.includes(code));
    return item;
};
