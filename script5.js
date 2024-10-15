const apiKey = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API key
const weatherInfoDiv = document.getElementById('weatherInfo');
const forecastSection = document.getElementById('forecastSection');
const graphSection = document.getElementById('graphSection');
let isCelsius = true;

// Function to fetch weather by user input
function fetchWeatherByInput() {
    const location = document.getElementById('locationInput').value;
    if (!location) {
        alert("Please enter a location!");
        return;
    }
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`;
    fetchWeather(apiUrl);
}

// Function to fetch weather by current location (Geolocation API)
function fetchWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`;
            fetchWeather(apiUrl);
        }, () => {
            alert("Unable to retrieve location. Please enter manually.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Function to fetch weather data from OpenWeatherMap API
function fetchWeather(apiUrl) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                displayWeather(data);
                updateBackground(data.weather[0].main);
                fetchForecast(data.coord.lat, data.coord.lon);
            } else {
                alert("Location not found. Please enter a valid location.");
            }
        })
        .catch(error => {
            alert("Unable to fetch weather data.");
            console.error("Error fetching weather data: ", error);
        });
}

// Function to display weather details on the page
function displayWeather(data) {
    const { name } = data;
    const { temp, feels_like, humidity, pressure } = data.main;
    const { description, icon } = data.weather[0];
    const windSpeed = data.wind.speed;
    const visibility = data.visibility;

    weatherInfoDiv.style.display = 'block';  // Make sure the weather info is visible
    weatherInfoDiv.innerHTML = `
        <h2>Weather in ${name}</h2>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <p>${description.toUpperCase()}</p>
        <p>Temperature: ${temp.toFixed(1)}°${isCelsius ? 'C' : 'F'}</p>
        <p>Feels Like: ${feels_like.toFixed(1)}°${isCelsius ? 'C' : 'F'}</p>
        <p>Humidity: ${humidity}%</p>
        <p>Pressure: ${pressure} hPa</p>
        <p>Wind Speed: ${windSpeed} ${isCelsius ? 'm/s' : 'mph'}</p>
        <p>Visibility: ${(visibility / 1000).toFixed(1)} km</p>
    `;
}

// Function to fetch and display 5-day weather forecast
function fetchForecast(lat, lon) {
    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`;
    
    fetch(forecastApiUrl)
        .then(response => response.json())
        .then(data => {
            displayForecast(data);
        })
        .catch(error => {
            console.error("Error fetching forecast data: ", error);
        });
}

// Function to display the forecast
function displayForecast(data) {
    forecastSection.style.display = 'block';  // Make sure the forecast section is visible
    forecastSection.innerHTML = '';

    for (let i = 0; i < data.list.length; i += 8) {  // 8 data points per day (every 3 hours)
        const day = data.list[i];
        const date = new Date(day.dt * 1000);
        const icon = day.weather[0].icon;
        const temp = day.main.temp.toFixed(1);

        forecastSection.innerHTML += `
            <div class="forecast-day">
                <p>${date.toDateString()}</p>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${day.weather[0].description}">
                <p>${temp}°${isCelsius ? 'C' : 'F'}</p>
            </div>
        `;
    }
}

// Function to update the background based on weather condition
function updateBackground(condition) {
    let backgroundColor;

    switch (condition.toLowerCase()) {
        case 'clear':
            backgroundColor = '#f7b733'; // Sunny
            break;
        case 'clouds':
            backgroundColor = '#4a4a4a'; // Cloudy
            break;
        case 'rain':
        case 'drizzle':
            backgroundColor = '#005bea'; // Rainy
            break;
        case 'snow':
            backgroundColor = '#00d2ff'; // Snowy
            break;
        case 'thunderstorm':
            backgroundColor = '#616161'; // Stormy
            break;
        default:
            backgroundColor = '#f5f7fa'; // Default background
    }

    document.body.style.background = backgroundColor;
}

// Function to toggle between Celsius and Fahrenheit
function toggleUnit() {
    isCelsius = !isCelsius;
    const location = document.getElementById('locationInput').value;
    if (location) {
        fetchWeatherByInput();
    }
}
