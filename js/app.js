// DOM Elements
const regionSelectEl = document.getElementById('region-select');
const loadingOverlay = document.getElementById('loading-overlay');

// Today's Elements
const todayDateEl = document.getElementById('today-date');
const todayIconEl = document.getElementById('today-icon');
const todayDescEl = document.getElementById('today-desc');
const todayMaxEl = document.getElementById('today-max');
const todayMinEl = document.getElementById('today-min');

// Past Elements
const compareDateInput = document.getElementById('compare-date');
const pastDateDisplay = document.getElementById('past-date-display');
const pastIconEl = document.getElementById('past-icon');
const pastDescEl = document.getElementById('past-desc');
const pastMaxEl = document.getElementById('past-max');
const pastMinEl = document.getElementById('past-min');

// Result Elements
const comparisonResultEl = document.getElementById('comparison-result');
const comparisonResultMinEl = document.getElementById('comparison-result-min');

// Chart Toggle Elements
const toggleWeekBtn = document.getElementById('toggle-week');
const toggleMonthBtn = document.getElementById('toggle-month');

// State
let currentLat = 35.6895; // Default Tokyo
let currentLon = 139.6917; // Default Tokyo
let todayData = null;
let pastData = null;
let tempChart = null;
let trendData = null;
let currentTrendDays = 7; // Default to 1 week

// Initialize App
async function initApp() {
    showLoading(true);
    
    // Set max date for date picker to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    compareDateInput.max = getISODate(yesterday);
    
    // Default compare date to yesterday
    compareDateInput.value = getISODate(yesterday);

    try {
        await getUserLocation();
        await updateLocationName();
        await fetchAndRenderToday();
        await fetchAndRenderPast(compareDateInput.value);
        await fetchAndRenderTrend();
        updateComparison();
    } catch (error) {
        console.error("Initialization failed:", error);
        alert("データの取得に失敗しました。");
    } finally {
        showLoading(false);
    }

    // Event Listeners
    toggleWeekBtn.addEventListener('click', () => changeTrendPeriod(7));
    toggleMonthBtn.addEventListener('click', () => changeTrendPeriod(30));

    compareDateInput.addEventListener('change', async (e) => {
        const selectedDate = e.target.value;
        if (!selectedDate) return;
        
        showLoading(true);
        try {
            await fetchAndRenderPast(selectedDate);
            updateComparison();
        } catch (error) {
            console.error("Failed to fetch past data:", error);
            alert("過去の気象データが取得できませんでした。");
        } finally {
            showLoading(false);
        }
    });

    regionSelectEl.addEventListener('change', async (e) => {
        const value = e.target.value;
        showLoading(true);
        try {
            if (value === 'current') {
                await getUserLocation();
                await updateLocationName();
            } else {
                const [lat, lon] = value.split(',');
                currentLat = parseFloat(lat);
                currentLon = parseFloat(lon);
            }
            await fetchAndRenderToday();
            await fetchAndRenderPast(compareDateInput.value);
            await fetchAndRenderTrend();
            updateComparison();
        } catch (error) {
            console.error("Failed to update region:", error);
            alert("地域の切り替えに失敗しました。");
        } finally {
            showLoading(false);
        }
    });
}

// Get User Location using Browser API
function getUserLocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.warn("Geolocation not supported. Using default (Tokyo).");
            resolve(); // proceed with default
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLat = position.coords.latitude;
                currentLon = position.coords.longitude;
                resolve();
            },
            (error) => {
                console.warn("Geolocation denied or failed. Using default (Tokyo).", error);
                resolve(); // proceed with default
            },
            { timeout: 5000, maximumAge: 60000 }
        );
    });
}

// Update Location Name in UI
async function updateLocationName() {
    const name = await getLocationName(currentLat, currentLon);
    if (regionSelectEl.options[0].value === 'current') {
        regionSelectEl.options[0].text = `現在地 (${name})`;
    }
}

// Fetch and Render Today's Weather
async function fetchAndRenderToday() {
    todayData = await getCurrentWeather(currentLat, currentLon);
    
    todayDateEl.textContent = formatDate(todayData.date);
    todayMaxEl.textContent = todayData.maxTemp;
    todayMinEl.textContent = todayData.minTemp;
    
    const info = getWeatherInfo(todayData.weatherCode);
    todayIconEl.textContent = info.icon;
    todayDescEl.textContent = info.desc;
}

// Fetch and Render Past Weather
async function fetchAndRenderPast(date) {
    pastDateDisplay.textContent = formatDate(date);
    pastData = await getHistoricalWeather(currentLat, currentLon, date);
    
    if (pastData) {
        pastMaxEl.textContent = pastData.maxTemp;
        pastMinEl.textContent = pastData.minTemp;
        
        const info = getWeatherInfo(pastData.weatherCode);
        pastIconEl.textContent = info.icon;
        pastDescEl.textContent = info.desc;
    } else {
        pastMaxEl.textContent = "--";
        pastMinEl.textContent = "--";
        pastIconEl.textContent = "❓";
        pastDescEl.textContent = "データなし";
    }
}

// Update Comparison Result
function updateComparison() {
    if (!todayData || !pastData) {
        const noDataMsg = "比較するデータがありません。";
        comparisonResultEl.innerHTML = noDataMsg;
        comparisonResultMinEl.innerHTML = noDataMsg;
        return;
    }

    const pastDateFormatted = formatDate(pastData.date);

    // Max Temp Comparison
    const todayMax = todayData.maxTemp;
    const pastMax = pastData.maxTemp;
    const maxResult = getComparisonText(todayMax, pastMax, pastDateFormatted);
    comparisonResultEl.innerHTML = maxResult.text;

    // Min Temp Comparison
    const todayMin = todayData.minTemp;
    const pastMin = pastData.minTemp;
    const minResult = getComparisonText(todayMin, pastMin, pastDateFormatted);
    comparisonResultMinEl.innerHTML = minResult.text;
}

// Fetch and Render Trend Weather Data
async function fetchAndRenderTrend() {
    trendData = await getTrendData(currentLat, currentLon, currentTrendDays);
    updateChart();
}

// Change Trend Period (Week / Month)
async function changeTrendPeriod(days) {
    if (currentTrendDays === days) return;
    
    currentTrendDays = days;
    
    // Toggle active state in UI
    if (days === 7) {
        toggleWeekBtn.classList.add('active');
        toggleMonthBtn.classList.remove('active');
    } else {
        toggleMonthBtn.classList.add('active');
        toggleWeekBtn.classList.remove('active');
    }
    
    showLoading(true);
    try {
        await fetchAndRenderTrend();
    } catch (error) {
        console.error("Failed to update trend data:", error);
    } finally {
        showLoading(false);
    }
}

// Update Temperature Chart (Max/Min Daily Temps)
function updateChart() {
    const canvas = document.getElementById('temp-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (tempChart) {
        tempChart.destroy();
    }

    if (!trendData || !trendData.dates || !trendData.maxTemps || !trendData.minTemps) {
        return;
    }

    // Format dates to MM/DD format
    const labels = trendData.dates.map(dateStr => {
        const d = new Date(dateStr);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    });

    tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '最高気温',
                    data: trendData.maxTemps,
                    borderColor: '#ef476f',
                    backgroundColor: 'rgba(239, 71, 111, 0.04)',
                    borderWidth: 3,
                    tension: 0.3,
                    pointBackgroundColor: '#ef476f',
                    pointRadius: currentTrendDays === 30 ? 1 : 3,
                    pointHoverRadius: 6,
                    fill: false
                },
                {
                    label: '最低気温',
                    data: trendData.minTemps,
                    borderColor: '#118ab2',
                    backgroundColor: 'rgba(17, 138, 178, 0.04)',
                    borderWidth: 3,
                    tension: 0.3,
                    pointBackgroundColor: '#118ab2',
                    pointRadius: currentTrendDays === 30 ? 1 : 3,
                    pointHoverRadius: 6,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#102a43',
                        font: {
                            family: "'Inter', sans-serif",
                            weight: '600',
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(16, 42, 67, 0.9)',
                    titleFont: {
                        family: "'Inter', sans-serif",
                        weight: '600'
                    },
                    bodyFont: {
                        family: "'Inter', sans-serif"
                    },
                    callbacks: {
                        label: function(context) {
                            return ` ${context.dataset.label}: ${context.raw}°C`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#486581',
                        font: {
                            family: "'Inter', sans-serif"
                        },
                        maxTicksLimit: currentTrendDays === 30 ? 10 : 8
                    }
                },
                y: {
                    ticks: {
                        color: '#486581',
                        font: {
                            family: "'Inter', sans-serif"
                        },
                        callback: function(value) {
                            return value + '°C';
                        }
                    },
                    grid: {
                        color: 'rgba(16, 42, 67, 0.05)'
                    }
                }
            }
        }
    });
}

// Show/Hide Loading Overlay
function showLoading(show) {
    if (show) {
        loadingOverlay.classList.remove('hidden');
    } else {
        loadingOverlay.classList.add('hidden');
    }
}

// Run on load
document.addEventListener('DOMContentLoaded', initApp);
