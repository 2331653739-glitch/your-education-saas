"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/escape-string-regexp";
exports.ids = ["vendor-chunks/escape-string-regexp"];
exports.modules = {

/***/ "(action-browser)/./node_modules/escape-string-regexp/index.js":
/*!****************************************************!*\
  !*** ./node_modules/escape-string-regexp/index.js ***!
  \****************************************************/
/***/ ((module) => {

eval("\n\nmodule.exports = string => {\n\tif (typeof string !== 'string') {\n\t\tthrow new TypeError('Expected a string');\n\t}\n\n\t// Escape characters with special meaning either inside or outside character sets.\n\t// Use a simple backslash escape when it’s always valid, and a \\unnnn escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.\n\treturn string\n\t\t.replace(/[|\\\\{}()[\\]^$+*?.]/g, '\\\\$&')\n\t\t.replace(/-/g, '\\\\x2d');\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFjdGlvbi1icm93c2VyKS8uL25vZGVfbW9kdWxlcy9lc2NhcGUtc3RyaW5nLXJlZ2V4cC9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3lvdXItZWR1Y2F0aW9uLXNhYXMvLi9ub2RlX21vZHVsZXMvZXNjYXBlLXN0cmluZy1yZWdleHAvaW5kZXguanM/OTRkYiJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gc3RyaW5nID0+IHtcblx0aWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYSBzdHJpbmcnKTtcblx0fVxuXG5cdC8vIEVzY2FwZSBjaGFyYWN0ZXJzIHdpdGggc3BlY2lhbCBtZWFuaW5nIGVpdGhlciBpbnNpZGUgb3Igb3V0c2lkZSBjaGFyYWN0ZXIgc2V0cy5cblx0Ly8gVXNlIGEgc2ltcGxlIGJhY2tzbGFzaCBlc2NhcGUgd2hlbiBpdOKAmXMgYWx3YXlzIHZhbGlkLCBhbmQgYSBcXHVubm5uIGVzY2FwZSB3aGVuIHRoZSBzaW1wbGVyIGZvcm0gd291bGQgYmUgZGlzYWxsb3dlZCBieSBVbmljb2RlIHBhdHRlcm5z4oCZIHN0cmljdGVyIGdyYW1tYXIuXG5cdHJldHVybiBzdHJpbmdcblx0XHQucmVwbGFjZSgvW3xcXFxce30oKVtcXF1eJCsqPy5dL2csICdcXFxcJCYnKVxuXHRcdC5yZXBsYWNlKC8tL2csICdcXFxceDJkJyk7XG59O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(action-browser)/./node_modules/escape-string-regexp/index.js\n");

/***/ })

};
;