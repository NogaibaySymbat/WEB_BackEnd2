import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
const PORT = 3009;

app.use(express.static(path.resolve("public")));

const first = (arr) => (Array.isArray(arr) && arr.length ? arr[0] : null);
const okStr = (v, fallback = "N/A") =>
  typeof v === "string" && v.trim() ? v.trim() : fallback;

// 1. RandomUser
async function randomUser() {
  const { data } = await axios.get("https://randomuser.me/api/");
  const u = data.results[0];

  return {
    firstName: okStr(u?.name?.first),
    lastName: okStr(u?.name?.last),
    gender: okStr(u?.gender),
    picture: okStr(u?.picture?.large, ""),
    age: u?.dob?.age ?? "N/A",
    dob: okStr(u?.dob?.date),
    city: okStr(u?.location?.city),
    country: okStr(u?.location?.country),
    fullAddress: okStr(`${u?.location?.street?.name} ${u?.location?.street?.number}`),
  };
}

// 2.Country info
async function countryInfo(countryName) {
  const key = process.env.COUNTRYLAYER_KEY;
  if (!key) throw new Error("COUNTRYLAYER_KEY missing in .env");

  // base result
  let result = {
    name: countryName,
    capital: "N/A",
    languages: ["N/A"],
    currency: { code: "N/A", name: "N/A", symbol: "N/A" },
    flag: "",
  };

  // Countrylayer
  try {
    const url = `https://api.countrylayer.com/v2/name/${encodeURIComponent(
      countryName
    )}?access_key=${encodeURIComponent(key)}&fullText=true`;

    const { data } = await axios.get(url);
    const c = first(data);

    if (c) {
      result.name = okStr(c.name, countryName);
      result.capital = okStr(c.capital);

      // languages 
      if (Array.isArray(c.languages) && c.languages.length) {
        const langs = c.languages.map((x) => x?.name).filter(Boolean);
        if (langs.length) result.languages = langs;
      }

      // currency 
      const cur = first(c.currencies);
      if (cur?.code) {
        result.currency = {
          code: okStr(cur.code),
          name: okStr(cur.name),
          symbol: okStr(cur.symbol),
        };
      }

      result.flag = okStr(c.flag, "");
    }
  } catch {
  }

  const needLang = result.languages[0] === "N/A";
  const needCur = result.currency.code === "N/A";

  if (needLang || needCur) {
    try {
      const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(
        countryName
      )}?fullText=true`;

      const { data } = await axios.get(url);
      const r = first(data);

      if (r) {
        // capital
        if (result.capital === "N/A") result.capital = okStr(first(r.capital), "N/A");

        // flag
        if (!result.flag) result.flag = okStr(r?.flags?.png || r?.flags?.svg || "", "");

        // languages
        if (needLang && r.languages) {
          const langs = Object.values(r.languages).filter(Boolean);
          if (langs.length) result.languages = langs;
        }

        // currencies
        if (needCur && r.currencies) {
          const [code, obj] = Object.entries(r.currencies)[0] || [];
          if (code) {
            result.currency = {
              code,
              name: okStr(obj?.name, "N/A"),
              symbol: okStr(obj?.symbol, "N/A"),
            };
          }
        }
      }
    } catch {
    }
  }

  return result;
}

// 3) Rates
async function rates(base) {
  const key = process.env.EXCHANGERATE_KEY;
  if (!key) throw new Error("EXCHANGERATE_KEY missing in .env");

  const url = `https://v6.exchangerate-api.com/v6/${encodeURIComponent(
    key
  )}/latest/${encodeURIComponent(base)}`;

  const { data } = await axios.get(url);
  return {
    base,
    USD: data?.conversion_rates?.USD ?? null,
    KZT: data?.conversion_rates?.KZT ?? null,
    updatedUtc: okStr(data?.time_last_update_utc, "N/A"),
  };
}

// 4) News
async function news(countryName) {
  const key = process.env.NEWSAPI_KEY;
  if (!key) throw new Error("NEWSAPI_KEY missing in .env");

  const url =
    "https://newsapi.org/v2/everything" +
    `?q=${encodeURIComponent(`"${countryName}"`)}` +
    `&searchIn=title&language=en&pageSize=30&sortBy=publishedAt`;

  const { data } = await axios.get(url, { headers: { "X-Api-Key": key } });

  const lower = countryName.toLowerCase();
  return (data.articles || [])
    .filter((a) => (a?.title || "").toLowerCase().includes(lower))
    .slice(0, 5)
    .map((a) => ({
      title: okStr(a?.title),
      image: okStr(a?.urlToImage, ""),
      description: okStr(a?.description, ""),
      url: okStr(a?.url, "#"),
    }));
}

// main endpoint
app.get("/api/profile", async (req, res) => {
  try {
    const user = await randomUser();

    const c = await countryInfo(user.country);
    const base = c.currency.code !== "N/A" ? c.currency.code : "USD";
    const r = await rates(base);

    let n = [];
    try {
      n = await news(user.country);
    } catch {
      n = [];
    }

    res.json({ user, countryInfo: c, rates: r, news: n });
  } catch (e) {
    res.status(500).json({ error: "Server error", details: String(e?.message || e) });
  }
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
