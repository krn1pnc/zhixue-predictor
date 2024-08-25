// ==UserScript==
// @name        Zhixue Predictor
// @author      krn1pnc
// @version     1.0
// @license     GPL-3.0-or-later
// @namespace   https://github.com/krn1pnc/zhixue-predictor
// @description 在智学网中预测排名
// @icon        https://static.zhixue.com/zhixue.ico
// @match       https://www.zhixue.com/activitystudy/web-report/index.html*
// ==/UserScript==

(function() {
    "use strict";

    XMLHttpRequest.prototype._open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
        if (url.indexOf("https://www.zhixue.com/zhixuebao/report/exam/getLevelTrend") !== -1 ||
            url.indexOf("https://www.zhixue.com/zhixuebao/report/paper/getLevelTrend") !== -1) {
            this.addEventListener("load", function(e) {
                const xhr = e.currentTarget;
                if (xhr.readyState != 4) return;

                const res = JSON.parse(xhr.response);
                if (res.errorCode) return;

                let rankListHtml = "";
                for (let score of res.result.list) {
                    let levelData = score.levelList.find((x) => x.name === score.improveBar.levelScale);
                    let upperBound = levelData.upperBound, lowerBound = levelData.lowBound;
                    let total = score.totalNum, offset = score.improveBar.offset;
                    let rank = total * ((100 - offset) * upperBound + offset * lowerBound) / 10000;
                    rankListHtml +=
                        `<div class="sub-item">
                            <div class="subject">${score.tag.name}</div>
                            <div style="margin-left: 150px;">
                                <div class="bold-level">
                                    <span class="blue">${rank}</span>
                                    <span class="specific ml_10">/ ${total}</span>
                                </div>
                            </div>
                        </div>`;
                }

                document
                    .querySelector("#report > div > div.report > div > div.report-content > div.hierarchy")
                    .insertAdjacentHTML("afterend",
                        `<div class="hierarchy">
                            <div>
                                <div class="general"><h2 class="class-a-title">估算排名</h2></div>
                                <div class="single">${rankListHtml}</div>
                            </div>
                        </div>`);
            });
        }
        this._open(method, url, async, user, password);
    }
})();
