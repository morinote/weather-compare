/**
 * Fetch current weather for today
 * @param {number} lat 
 * @param {number} lon 
 * @returns {Promise<Object>}
 */
async function getCurrentWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather data fetch failed');
        const data = await response.json();
        
        return {
            date: data.daily.time[0],
            maxTemp: data.daily.temperature_2m_max[0],
            minTemp: data.daily.temperature_2m_min[0],
            weatherCode: data.daily.weathercode[0],
            hourlyTemp: data.hourly ? data.hourly.temperature_2m.slice(0, 24) : []
        };
    } catch (error) {
        console.error("Error fetching current weather:", error);
        throw error;
    }
}

/**
 * Fetch historical weather for a specific date
 * @param {number} lat 
 * @param {number} lon 
 * @param {string} date (YYYY-MM-DD)
 * @returns {Promise<Object|null>}
 */
async function getHistoricalWeather(lat, lon, date) {
    // Open-Meteo archive API
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&hourly=temperature_2m&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Historical weather data fetch failed');
        const data = await response.json();
        
        if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
            return null; // Data not available for this date
        }

        return {
            date: data.daily.time[0],
            maxTemp: data.daily.temperature_2m_max[0],
            minTemp: data.daily.temperature_2m_min[0],
            weatherCode: data.daily.weathercode[0],
            hourlyTemp: data.hourly ? data.hourly.temperature_2m.slice(0, 24) : []
        };
    } catch (error) {
        console.error("Error fetching historical weather:", error);
        throw error;
    }
}

/**
 * Get location name from coordinates using free BigDataCloud API
 * @param {number} lat 
 * @param {number} lon 
 * @returns {Promise<string>}
 */
async function getLocationName(lat, lon) {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ja`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Geocoding failed');
        const data = await response.json();
        
        // Try to get the most relevant locality name
        const name = data.city || data.locality || data.principalSubdivision || '現在地';
        return name;
    } catch (error) {
        console.error("Error fetching location name:", error);
        return "現在地"; // Fallback
    }
}

/**
 * Fetch daily max/min temperatures for a trend period (e.g., past 7 or 30 days)
 * @param {number} lat 
 * @param {number} lon 
 * @param {number} days (7 or 30)
 * @returns {Promise<Object>} { dates: string[], maxTemps: number[], minTemps: number[] }
 */
async function getTrendData(lat, lon, days) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&timezone=auto&past_days=${days}&forecast_days=1`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Trend data fetch failed');
        const data = await response.json();
        
        return {
            dates: data.daily.time,
            maxTemps: data.daily.temperature_2m_max,
            minTemps: data.daily.temperature_2m_min
        };
    } catch (error) {
        console.error("Error fetching trend data:", error);
        throw error;
    }
}
