/**
 * Weather Codes Mapping (WMO Weather interpretation codes)
 * https://open-meteo.com/en/docs
 */
const weatherCodes = {
    0: { desc: '快晴', icon: '☀️' },
    1: { desc: '晴れ', icon: '🌤️' },
    2: { desc: '一部曇り', icon: '⛅' },
    3: { desc: '曇り', icon: '☁️' },
    45: { desc: '霧', icon: '🌫️' },
    48: { desc: '霧氷', icon: '🌫️' },
    51: { desc: '軽い霧雨', icon: '🌧️' },
    53: { desc: '霧雨', icon: '🌧️' },
    55: { desc: '強い霧雨', icon: '🌧️' },
    56: { desc: '軽い着氷性の霧雨', icon: '🌧️' },
    57: { desc: '強い着氷性の霧雨', icon: '🌧️' },
    61: { desc: '弱い雨', icon: '☔' },
    63: { desc: '雨', icon: '☔' },
    65: { desc: '強い雨', icon: '☔' },
    66: { desc: '軽い着氷性の雨', icon: '🌧️' },
    67: { desc: '強い着氷性の雨', icon: '🌧️' },
    71: { desc: '弱い雪', icon: '🌨️' },
    73: { desc: '雪', icon: '❄️' },
    75: { desc: '強い雪', icon: '❄️' },
    77: { desc: '雪粒', icon: '❄️' },
    80: { desc: 'にわか雨', icon: '🌦️' },
    81: { desc: '強いにわか雨', icon: '🌦️' },
    82: { desc: '激しいにわか雨', icon: '⛈️' },
    85: { desc: '弱い雪・にわか雪', icon: '🌨️' },
    86: { desc: '強い雪・にわか雪', icon: '❄️' },
    95: { desc: '雷雨', icon: '⛈️' },
    96: { desc: '雷雨（弱い雹を伴う）', icon: '⛈️' },
    99: { desc: '雷雨（強い雹を伴う）', icon: '⛈️' }
};

/**
 * Get weather details from WMO code
 * @param {number} code 
 * @returns {Object} { desc: string, icon: string }
 */
function getWeatherInfo(code) {
    return weatherCodes[code] || { desc: '不明', icon: '❓' };
}

/**
 * Format date string to display format (e.g., 2026/05/14 (木))
 * @param {string|Date} dateStr 
 * @returns {string}
 */
function formatDate(dateStr) {
    const d = new Date(dateStr);
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dayOfWeek = days[d.getDay()];
    return `${year}/${month}/${day} (${dayOfWeek})`;
}

/**
 * Get YYYY-MM-DD format string for APIs and Inputs
 * @param {Date} d 
 * @returns {string}
 */
function getISODate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Calculate difference and format the result text
 * @param {number} todayTemp 
 * @param {number} pastTemp 
 * @param {string} dateText (e.g., "2026/06/06 (土)")
 * @returns {Object} { text: string, className: string }
 */
function getComparisonText(todayTemp, pastTemp, dateText) {
    const diff = todayTemp - pastTemp;
    const absDiff = Math.abs(diff).toFixed(1);
    const dateLabel = dateText ? `${dateText} より` : "過去より";
    const dateLabelEqual = dateText ? `${dateText} と` : "過去と";
    
    if (diff > 0) {
        return { 
            text: `${dateLabel} <span class="highlight-hot">${absDiff}°C 高い</span> です`, 
            className: 'hot' 
        };
    } else if (diff < 0) {
        return { 
            text: `${dateLabel} <span class="highlight-cold">${absDiff}°C 低い</span> です`, 
            className: 'cold' 
        };
    } else {
        return { 
            text: `${dateLabelEqual} <span class="highlight-neutral">同じ気温</span> です`, 
            className: 'neutral' 
        };
    }
}
