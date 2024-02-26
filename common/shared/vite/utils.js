/**
 * Convert package name to library name
 * @examples `@univerjs/core` -> `UniverCore`
 * @examples `@univerjs/foo-bar-baz` -> `UniverFooBarBaz`
 * @examples `@univerjs-foo/bar` -> `UniverBar`
 * @param {*} name package name
 * @returns {string} library name
 */
exports.convertLibNameFromPackageName = function convertLibNameFromPackageName(name) {
    return name
        .replace(/^@univerjs(?:-[^/]+)?\//, 'univer-')
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
};
