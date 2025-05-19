const apiKey = "dc717abf162719c5af86c5a85a06ad17";

const weatherBackgrounds = {
  Clear: "clear.jpg",
  Clouds: "cloud.jpg",
  Rain: "rain.jpg",
  Snow: "snow.jpg",
  Default:"default.jpg"
};

function setBackground(weather, temp) {
  const condition = weatherBackgrounds[weather] ? weather : "Default";
  const image = weatherBackgrounds[condition];
  document.body.style.backgroundImage = `url('${image}')`;

  let overlay = "";

  if (temp >= 30) {
    overlay = "rgba(255, 81, 47, 0.4)";
  } else if (temp >= 20) {
    overlay = "rgba(247, 151, 30, 0.4)";
  } else if (temp >= 10) {
    overlay = "rgba(86, 204, 242, 0.4)";
  } else {
    overlay = "rgba(55, 59, 68, 0.4)";
  }

  document.getElementById("overlay").style.background = overlay;
}

function applyDayNightMode() {
  const hour = new Date().getHours();
  const isNight = hour >= 19 || hour < 6;
  document.body.classList.toggle("night", isNight);
}

function saveCity(city) {
  localStorage.setItem("lastCity", city);
}

function loadLastCity() {
  const savedCity = localStorage.getItem("lastCity");
  if (savedCity) {
    document.getElementById("cityInput").value = savedCity;
    getWeather(savedCity);
  }
}

function getWeather(cityName = null) {
  const city = cityName || document.getElementById("cityInput").value;
  if (!city) return;

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) {
        document.getElementById("weatherResult").innerHTML = `<p>City not found!</p>`;
        return;
      }

      const temp = Math.round(data.main.temp);
      const weatherMain = data.weather[0].main;
      const icon = data.weather[0].icon;

      document.getElementById("weatherResult").innerHTML = `
        <div class="weather-box city">
          <h2>📍 ${data.name}</h2>
        </div>
        <div class="weather-box icon">
          <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="icon">
          <p>${data.weather[0].description}</p>
        </div>
        <div class="weather-box temp">
          <p>🌡️ <strong>${temp}°C</strong></p>
          <p>Feels like: ${Math.round(data.main.feels_like)}°C</p>
        </div>
        <div class="weather-box humidity">
          <p>💧 Humidity: ${data.main.humidity}%</p>
        </div>
        <div class="weather-box wind">
          <p>🌬️ Wind: ${data.wind.speed} km/h</p>
        </div>
      `;

      setBackground(weatherMain, temp);
      addWeatherParticles(weatherMain);
      saveCity(city);
    })
    .catch(err => {
      document.getElementById("weatherResult").innerHTML = `<p>Error fetching data</p>`;
      console.log(err);
    });
}

function addWeatherParticles(type) {
  const container = document.getElementById("weatherParticles");
  container.innerHTML = "";
  let count = type === "Rain" ? 100 : type === "Snow" ? 60 : 0;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div");
    particle.className = type === "Rain" ? "rain-drop" : "snowflake";
    particle.style.left = Math.random() * 100 + "vw";
    particle.style.animationDuration = (Math.random() * 0.5 + 0.5) + "s";
    particle.style.top = "-" + Math.random() * 100 + "px";
    container.appendChild(particle);
  }
}

window.onload = () => {
  applyDayNightMode();

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
          .then(res => res.json())
          .then(data => {
            const temp = Math.round(data.main.temp);
            const weatherMain = data.weather[0].main;
            const icon = data.weather[0].icon;

            document.getElementById("weatherResult").innerHTML = `
              <div class="weather-box city">
                <h2>📍 ${data.name}</h2>
              </div>
              <div class="weather-box icon">
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="icon">
                <p>${data.weather[0].description}</p>
              </div>
              <div class="weather-box temp">
                <p>🌡️ <strong>${temp}°C</strong></p>
                <p>Feels like: ${Math.round(data.main.feels_like)}°C</p>
              </div>
              <div class="weather-box humidity">
                <p>💧 Humidity: ${data.main.humidity}%</p>
              </div>
              <div class="weather-box wind">
                <p>🌬️ Wind: ${data.wind.speed} km/h</p>
              </div>
            `;

            setBackground(weatherMain, temp);
            addWeatherParticles(weatherMain);
            saveCity(data.name);
          })
          .catch(err => {
            console.error("Location weather error:", err);
            loadLastCity();
          });
      },
      (err) => {
        console.warn("User denied location, loading last city.");
        loadLastCity();
      }
    );
  } else {
    loadLastCity();
  }
};
