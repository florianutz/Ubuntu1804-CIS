"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLink = void 0;
const axios_1 = __importDefault(require("axios"));
const buildLink = async (type, appoitmentId) => {
    let link = await (0, axios_1.default)({
        method: 'POST',
        url: `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyBLjGygInt-PA0AwvhG9yb5T8EQgpavA3g`,
        headers: {
            'Content-Type': 'application/json',
        },
        data: {
            dynamicLinkInfo: {
                domainUriPrefix: 'https://tfacomponent.page.link',
                link: `https://chat.tftcomponents.com/appointment/${appoitmentId}/${type}`,
                androidInfo: {
                    androidPackageName: 'com.tft.component.prod',
                },
                iosInfo: {
                    iosBundleId: 'com.topflightapps.TFA-Component'
                }
            },
        },
    });
    if (link.status === 200) {
        return link.data.shortLink;
    }
    return false;
};
exports.buildLink = buildLink;
//# sourceMappingURL=urlGenerator.js.map