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
const outdoorDataURL = '';
const bedroomDataURL = '';
const nurseryDataURL = '';
const recroomDataURL = '';

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
    }
}

// Display weather information
const displayWeather = async () => {
    const weatherData = await fetchWeather(city, state, country, weatherAPIKey, units);

    if (weatherData.cod === '429') {
        document.getElementById('temperature').textContent = 'Quota exceeded';
        document.getElementById('humidity').textContent = '';
    } else {
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

        if (outdoorData) {
            const outdoorAvgValue = (outdoorData.p_0_3_um + outdoorData.p_0_3_um_b) / 2;
            document.getElementById('outdoorValue').textContent = Math.round(outdoorAvgValue);

            const avgPM25Outdoor = (Number(outdoorData.p_2_5_um) + Number(outdoorData.p_2_5_um_b)) / 2;
            document.getElementById('outdoorPM25Value').textContent = `${Math.round(avgPM25Outdoor)}`;

            const outdoorElement = document.getElementById('outdoor');
            outdoorElement.style.backgroundColor = outdoorAvgValue < 300 ? 'LIGHTGREEN' : outdoorAvgValue <= 1000 ? 'orange' : 'red';
        }

        if (bedroomData) {
            document.getElementById('bedroomValue').textContent = Math.round(bedroomData.p_0_3_um);
            document.getElementById('bedroomPM25Value').textContent = `${Math.round(bedroomData.p_2_5_um)}`;
            document.getElementById('vocValue').textContent = Math.round(bedroomData.gas_680);

            const bedroomElement = document.getElementById('bedroom');
            const vocElement = document.getElementById('voc');

            bedroomElement.style.backgroundColor = bedroomData.p_0_3_um < 300 ? 'LIGHTGREEN' : bedroomData.p_0_3_um <= 500 ? 'orange' : 'red';
            vocElement.style.backgroundColor = bedroomData.gas_680 < 60 ? 'LIGHTGREEN' : bedroomData.gas_680 <= 99 ? 'orange' : 'red';
        }

        if (nurseryData) {
            document.getElementById('nurseryPMValue').textContent = Math.round(nurseryData.p_0_3_um);
            document.getElementById('nurseryPM25Value').textContent = `${Math.round(nurseryData.p_2_5_um)}`;
            document.getElementById('nurseryVOCValue').textContent = Math.round(nurseryData.gas_680);

            const nurseryPMElement = document.getElementById('nurseryPM');
            const nurseryVOCElement = document.getElementById('nurseryVOC');

            nurseryPMElement.style.backgroundColor = nurseryData.p_0_3_um < 300 ? 'LIGHTGREEN' : nurseryData.p_0_3_um <= 500 ? 'orange' : 'red';
            nurseryVOCElement.style.backgroundColor = nurseryData.gas_680 < 60 ? 'LIGHTGREEN' : nurseryData.gas_680 <= 99 ? 'orange' : 'red';
        }

        if (recroomData) {
            document.getElementById('recroomPMValue').textContent = Math.round(recroomData.p_0_3_um);
            document.getElementById('recroomPM25Value').textContent = `${Math.round(recroomData.p_2_5_um)}`;
            document.getElementById('recroomVOCValue').textContent = Math.round(recroomData.gas_680);

            const recroomPMElement = document.getElementById('recroomPM');
            const recroomVOCElement = document.getElementById('recroomVOC');

            recroomPMElement.style.backgroundColor = recroomData.p_0_3_um < 300 ? 'LIGHTGREEN' : recroomData.p_0_3_um <= 500 ? 'orange' : 'red';
            recroomVOCElement.style.backgroundColor = recroomData.gas_680 < 60 ? 'LIGHTGREEN' : recroomData.gas_680 <= 99 ? 'orange' : 'red';
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Initial display of data
displayResults();
setInterval(displayResults, 10000);

displayWeather();
setInterval(displayWeather, 3600000);