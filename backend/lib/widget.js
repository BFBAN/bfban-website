"use strict";
import { promises as fs } from "fs";
import config from "../config.js";
import webshot from "node-webshot";

function playerWidget (id) {
    return new Promise((resolve, reject) => {
        let content = `${config.mail.domain.origin}/player/${id}/share/card?full=true&theme=default`;
        let data = {
            screenSize: {
                width: 600,
                height: 300
            },
            shotSize: {
                width: 600,
                height: 300
            },
            takeShotOnCallback: true,
            siteType: 'url',
            quality: 100,
        };

        resolve(webshot(content, data));
    })
}

export {
    playerWidget
}