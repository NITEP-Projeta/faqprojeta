"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = void 0;
const admin = require("firebase-admin");
exports.admin = admin;
const path_1 = require("path");
const serviceAccount = require((0, path_1.join)(__dirname, 'firebase-credentials.json'));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
//# sourceMappingURL=firebase.admin.js.map