export type WeatherDay = {
  date: string;
  tMax: number;
  tMin: number;
  rain: number;
  humidity: number;
  wind: number;
  code: number;
};

export type WeatherData = {
  location: string;
  current: { temp: number; humidity: number; rain: number; wind: number; code: number };
  daily: WeatherDay[];
  fungalRisk: "low" | "moderate" | "high";
  riskReason: string;
};

const codeToLabel = (c: number) => {
  if ([0].includes(c)) return "Clear";
  if ([1, 2, 3].includes(c)) return "Partly cloudy";
  if ([45, 48].includes(c)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(c)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(c)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(c)) return "Snow";
  if ([95, 96, 99].includes(c)) return "Thunderstorm";
  return "—";
};

export const weatherLabel = codeToLabel;

export async function fetchWeather(lat: number, lon: number, label: string): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean,wind_speed_10m_max,weather_code&forecast_days=7&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather fetch failed");
  const j = await res.json();

  const daily: WeatherDay[] = j.daily.time.map((d: string, i: number) => ({
    date: d,
    tMax: j.daily.temperature_2m_max[i],
    tMin: j.daily.temperature_2m_min[i],
    rain: j.daily.precipitation_sum[i],
    humidity: j.daily.relative_humidity_2m_mean[i],
    wind: j.daily.wind_speed_10m_max[i],
    code: j.daily.weather_code[i],
  }));

  const avgHumidity = daily.slice(0, 3).reduce((a, b) => a + b.humidity, 0) / 3;
  const totalRain = daily.slice(0, 3).reduce((a, b) => a + b.rain, 0);
  let fungalRisk: WeatherData["fungalRisk"] = "low";
  let riskReason = "Conditions unfavorable for fungal outbreaks.";
  if (avgHumidity > 80 || totalRain > 25) {
    fungalRisk = "high";
    riskReason = `High humidity (${avgHumidity.toFixed(0)}%) and rainfall (${totalRain.toFixed(1)}mm) over next 3 days favor fungal growth.`;
  } else if (avgHumidity > 65 || totalRain > 10) {
    fungalRisk = "moderate";
    riskReason = `Moderate humidity (${avgHumidity.toFixed(0)}%) and some rainfall expected — monitor closely.`;
  }

  return {
    location: label,
    current: {
      temp: j.current.temperature_2m,
      humidity: j.current.relative_humidity_2m,
      rain: j.current.precipitation,
      wind: j.current.wind_speed_10m,
      code: j.current.weather_code,
    },
    daily,
    fungalRisk,
    riskReason,
  };
}

export async function geocode(query: string): Promise<{ lat: number; lon: number; label: string } | null> {
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
  if (!res.ok) return null;
  const j = await res.json();
  const r = j.results?.[0];
  if (!r) return null;
  return { lat: r.latitude, lon: r.longitude, label: `${r.name}${r.admin1 ? ", " + r.admin1 : ""}${r.country ? ", " + r.country : ""}` };
}
