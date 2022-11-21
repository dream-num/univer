export interface OptionsData {
    overflow?: string;
    dateErrorThrows?: boolean;
    dateSpanLarge?: boolean;
    dateErrorNumber?: boolean;
    invalid?: string;
    locale?: string;
    leap1900?: boolean;
    nbsp?: boolean;
    throws?: boolean;
    ignoreTimezone?: boolean;
}

const defaultOptions: OptionsData = {
    // Overflow error string
    overflow: '######', // dateErrorThrow needs to be off! [prev in locale]
    // Should it throw when there is an overflow error?
    dateErrorThrows: false,
    // Should it emit a number is an overflow error? (Sheets does this)
    dateErrorNumber: true, // dateErrorThrow needs to be off!
    // Sheets mode (see #3)
    dateSpanLarge: true,
    // Simulate the Lotus 1-2-3 leap year bug
    leap1900: true,
    // Emit regular vs. non-breaking spaces
    nbsp: true,
    // Robust/throw mode
    throws: true,
    // What is emitted when robust mode fails to parse (###### currently)
    invalid: '######',
    // Locale
    locale: '',
    // Don't adjust dates to UTC when converting them to serial time
    ignoreTimezone: false,
};

const globalOptions = { ...defaultOptions };

export function options(opts: OptionsData = {}): OptionsData {
    // passing in a null will reset to defaults
    if (opts === null) {
        opts = defaultOptions;
    }
    if (opts) {
        for (const key in opts) {
            if (key in defaultOptions) {
                const value = opts[key];
                if (value == null) {
                    // set back to default
                    globalOptions[key] = defaultOptions[key];
                } else {
                    globalOptions[key] = value;
                }
            }
        }
    }
    return { ...globalOptions };
}
