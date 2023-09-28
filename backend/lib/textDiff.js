// Compare the overlap score of the text before and after.
// If the score is higher than this, the content is overlapped
const texCoincidenceRatio = 96.0;

/**
 * text similarity diff
 * @param s curr text
 * @param t prev text
 * @param f
 * @returns {number|string}
 */
function textSimilarityDiff(s = "", t = "", f = 1) {
    if (!s || !t) return 0
    if (s === t) return 100;
    let l = s.length > t.length ? s.length : t.length
    let n = s.length;
    let m = t.length;
    let d = [];
    f = f || 2
    const min = function (a, b, c) {
        return a < b ? (a < c ? a : c) : (b < c ? b : c)
    };
    let i, j, si, tj, cost;
    if (n === 0) return m
    if (m === 0) return n
    for (i = 0; i <= n; i++) {
        d[i] = []
        d[i][0] = i
    }
    for (j = 0; j <= m; j++) {
        d[0][j] = j
    }
    for (i = 1; i <= n; i++) {
        si = s.charAt(i - 1)
        for (j = 1; j <= m; j++) {
            tj = t.charAt(j - 1)
            if (si === tj) {
                cost = 0
            } else {
                cost = 1
            }
            d[i][j] = min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
        }
    }
    let res = (1 - d[n][m] / l) * 100
    return res.toFixed(f);
}

export {
    texCoincidenceRatio,
    textSimilarityDiff,
}
