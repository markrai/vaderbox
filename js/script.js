document.getElementById('goFullscreen').addEventListener('click', function () {
    goFullscreen();
    document.getElementById('splashScreen').style.display = 'none'; // hide the splash screen
});

function goFullscreen() {
    var element = document.documentElement;
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

document.getElementById('proceedWithoutFullscreen').addEventListener('click', function () {
    document.getElementById('splashScreen').style.display = 'none'; // hide the splash screen
});

// PurpleAir Sensors
const outdoorDataURL = 'http://192.168.1.180/json';
const bedroomDataURL = 'http://192.168.1.165/json';
const nurseryDataURL = 'http://192.168.1.219/json';
const recroomDataURL = 'http://192.168.1.151/json';

// Weather service configuration
const weatherAPIKey = '';
const city = '';
const state = '';
const country = '';
const units = '';

// Fetch data from a URL
const fetchData = async url => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        return null;
    }
}

// Fetch weather data
const fetchWeather = async (city, state, country, apiKey, units) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${state},${country}&appid=${apiKey}&units=${units}`;

    try {
        const response = await fetch(url);

        if (response.ok) {
            return await response.json();
        } else if (response.status === 429) {
            return { quotaExceeded: true };
        } else {
            throw new Error('Unable to fetch weather data.');
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Display weather information
const displayWeather = async () => {
    const weatherData = await fetchWeather(city, state, country, weatherAPIKey, units);

    if (weatherData && weatherData.quotaExceeded) {
        document.getElementById('temperature').textContent = 'Quota exceeded';
        document.getElementById('humidity').textContent = '';
    } else if (weatherData) {
        const temperature = Math.round(weatherData?.main?.temp);
        const humidity = weatherData?.main?.humidity;

        document.getElementById('temperature').textContent = `${temperature}°C`;
        document.getElementById('humidity').textContent = `${humidity}%`;

        const weatherElement = document.getElementById('weather');
        const backgroundColor =
            humidity <= 50 ? '#ffffff' :
                humidity <= 55 ? '#e6f9ff' :
                    humidity <= 60 ? '#ccf2ff' :
                        humidity <= 65 ? '#b3ecff' :
                            humidity <= 70 ? '#99e6ff' :
                                humidity <= 75 ? '#80dfff' :
                                    humidity <= 80 ? '#66d9ff' :
                                        humidity <= 85 ? '#4dd2ff' :
                                            humidity <= 90 ? '#33ccff' :
                                                humidity <= 95 ? '#1ac6ff' : '#00bfff';

        weatherElement.style.backgroundColor = backgroundColor;
    } else {
        document.getElementById('temperature').textContent = '';
        document.getElementById('humidity').textContent = '';
    }
}

// Display sensor data
const displayResults = async () => {
    try {
        const outdoorPromise = fetchData(outdoorDataURL);
        const bedroomPromise = fetchData(bedroomDataURL);
        const nurseryPromise = fetchData(nurseryDataURL);
        const recroomPromise = fetchData(recroomDataURL); // New promise for rec room data

        const [outdoorData, bedroomData, nurseryData, recroomData] = await Promise.all([
            outdoorPromise.catch(error => {
                console.error('Error fetching outdoor data:', error);
                return null; // Return null if the request fails
            }),
            bedroomPromise.catch(error => {
                console.error('Error fetching bedroom data:', error);
                return null; // Return null if the request fails
            }),
            nurseryPromise.catch(error => {
                console.error('Error fetching nursery data:', error);
                return null; // Return null if the request fails
            }),
            recroomPromise.catch(error => {
                console.error('Error fetching rec room data:', error);
                return null; // Return null if the request fails
            })
        ]);

        updateBox('outdoor', outdoorData);
        updateBox('bedroom', bedroomData, 'voc');
        updateBox('nurseryPM', nurseryData, 'nurseryVOC');
        updateBox('recroomPM', recroomData, 'recroomVOC');
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

const updateBox = (id, data, vocId = null) => {
    const pmElement = document.getElementById(id);
    const pmValueElement = pmElement.querySelector('.value');
    const pm25ValueElement = pmElement.querySelector('.value-small');

    if (data && !isNaN(data.p_0_3_um) && !isNaN(data.p_2_5_um)) {
        pmValueElement.textContent = Math.round(data.p_0_3_um);
        pm25ValueElement.textContent = Math.round(data.p_2_5_um);

        pmElement.style.backgroundColor = getBackgroundColor(Math.round(data.p_0_3_um));

        if (vocId && !isNaN(data.gas_680)) {
            const vocElement = document.getElementById(vocId);
            const vocValueElement = vocElement.querySelector('.value');

            vocValueElement.textContent = Math.round(data.gas_680);
            vocElement.style.backgroundColor = getBackgroundColor(Math.round(data.gas_680), 'voc');
        } else if (vocId) {
            const vocElement = document.getElementById(vocId);
            const vocValueElement = vocElement.querySelector('.value');

            vocValueElement.textContent = '';
            vocElement.style.backgroundColor = 'grey';
        }
    } else {
        pmValueElement.textContent = '';
        pm25ValueElement.textContent = '';

        pmElement.style.backgroundColor = 'grey';

        if (vocId) {
            const vocElement = document.getElementById(vocId);
            const vocValueElement = vocElement.querySelector('.value');

            vocValueElement.textContent = '';
            vocElement.style.backgroundColor = 'grey';
        }
    }
}

const getBackgroundColor = (value, type = 'pm') => {
    value = Math.floor(value); // Ensure consistent rounding
    if (type === 'pm') {
        return value < 300 ? 'LIGHTGREEN' : value <= 1000 ? 'orange' : 'red';
    } else if (type === 'voc') {
        return value < 60 ? 'LIGHTGREEN' : value <= 99 ? 'orange' : 'red';
    }
}

// Initial display of data
displayResults();
setInterval(displayResults, 10000);

displayWeather();
setInterval(displayWeather, 3600000);
