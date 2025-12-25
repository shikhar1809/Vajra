"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.vajraShield = exports.vajraProtect = exports.createVajraShield = exports.VajraClient = void 0;
// Main exports
var client_1 = require("./client");
Object.defineProperty(exports, "VajraClient", { enumerable: true, get: function () { return client_1.VajraClient; } });
var nextjs_1 = require("./nextjs");
Object.defineProperty(exports, "createVajraShield", { enumerable: true, get: function () { return nextjs_1.createVajraShield; } });
Object.defineProperty(exports, "vajraProtect", { enumerable: true, get: function () { return nextjs_1.vajraProtect; } });
var express_1 = require("./express");
Object.defineProperty(exports, "vajraShield", { enumerable: true, get: function () { return express_1.vajraShield; } });
__exportStar(require("./types"), exports);
// Default export
var client_2 = require("./client");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return client_2.VajraClient; } });
