const btn = document.getElementById("btn");
const statusEl = document.getElementById("status");

const userBox = document.getElementById("userBox");
const countryBox = document.getElementById("countryBox");
const newsBox = document.getElementById("newsBox");

function makeCard(title, insideHtml) {
  return `
    <section class="card">
      <h2>${title}</h2>
      <div class="body">${insideHtml}</div>
    </section>
  `;
}

function makeRow(label, value) {
  const safe = value ?? "N/A";
  return `
    <div class="row">
      <b>${label}:</b>
      <span>${safe}</span>
    </div>
  `;
}

function formatDate(iso) {
  if (!iso) return "N/A";
  const d = new Date(iso);
  if (isNaN(d)) return iso;

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  return `${dd}.${mm}.${yyyy}`;
}

function clearAll() {
  userBox.innerHTML = "";
  countryBox.innerHTML = "";
  newsBox.innerHTML = "";
}

// USER
function renderUser(u) {
  const imgHtml = u.picture
    ? `<img class="avatar" src="${u.picture}" alt="user" onerror="this.remove()">`
    : "";

  const body = `
    ${imgHtml}
    ${makeRow("First name", u.firstName)}
    ${makeRow("Last name", u.lastName)}
    ${makeRow("Gender", u.gender)}
    ${makeRow("Age", u.age)}
    ${makeRow("DOB", formatDate(u.dob))}
    ${makeRow("City", u.city)}
    ${makeRow("Country", u.country)}
    ${makeRow("Address", u.fullAddress)}
  `;

  userBox.innerHTML = makeCard("User", body);
}

// COUNTRY + RATES
function renderCountry(country, rates) {
  if (!country) {
    countryBox.innerHTML = makeCard("Country + Rates", "No country info.");
    return;
  }

  if (country.error) {
    countryBox.innerHTML = makeCard(
      "Country + Rates",
      `<p><b>${country.error}</b></p><p>${country.details ?? ""}</p>`
    );
    return;
  }

  const flagHtml = country.flag
    ? `<img class="flag" src="${country.flag}" alt="flag" onerror="this.remove()">`
    : "";

  const langsText = Array.isArray(country.languages)
    ? country.languages.join(", ")
    : "N/A";

  const currencyText =
    country.currency && country.currency.code
      ? `${country.currency.code} (${country.currency.name})`
      : "N/A";

  let rateText = "N/A";
  if (rates && rates.base && rates.USD != null && rates.KZT != null) {
    rateText = `1 ${rates.base} = ${rates.USD} USD, 1 ${rates.base} = ${rates.KZT} KZT`;
  }

  const body = `
    ${flagHtml}
    ${makeRow("Country", country.name)}
    ${makeRow("Capital", country.capital)}
    ${makeRow("Languages", langsText)}
    ${makeRow("Currency", currencyText)}
    ${makeRow("Rates", rateText)}
    ${makeRow("Updated", rates?.updatedUtc ?? "N/A")}
  `;

  countryBox.innerHTML = makeCard("Country + Rates", body);
}

// NEWS
function renderNews(news, countryName) {
  if (!Array.isArray(news) || news.length === 0) {
    newsBox.innerHTML = makeCard(
      "News",
      `No news found with "${countryName}" in title.`
    );
    return;
  }

  const cards = news
    .map((n) => {
      const imgHtml = n.image
        ? `<img class="newsImg" src="${n.image}" alt="news" onerror="this.remove()">`
        : "";

      const descHtml = n.description ? `<p>${n.description}</p>` : "";

      return `
        <article class="newsCard">
          <h3>${n.title}</h3>
          ${imgHtml}
          ${descHtml}
          <a href="${n.url}" target="_blank" rel="noopener">Open</a>
        </article>
      `;
    })
    .join("");

  newsBox.innerHTML = makeCard(
    `News about ${countryName}`,
    `<div class="newsGrid">${cards}</div>`
  );
}

// BUTTON CLICK
btn.addEventListener("click", async () => {
  clearAll();
  statusEl.textContent = "Loading...";

  try {
    const res = await fetch("/api/profile");
    const data = await res.json();

    if (!res.ok) throw new Error(data?.details || "Request failed");

    renderUser(data.user);
    renderCountry(data.countryInfo, data.rates);
    renderNews(data.news, data.user.country);

    statusEl.textContent = "";
  } catch (e) {
    statusEl.textContent = "Error: " + (e.message || e);
  }
});
