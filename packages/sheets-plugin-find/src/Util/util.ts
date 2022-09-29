export const getRegExpStr = (str: string) => str.replace('~*', '\\*').replace('~?', '\\?').replace('.', '\\.').replace('*', '.*').replace('?', '.');
