# API Assignment Report
#Nogaibay Symbat, se-2402

## 1. Introduction
In this assignment, I developed a small web application that demonstrates practical integration of multiple external REST APIs within one project. The main idea is to collect information from different sources, process it on the backend, and present it in a clear and user-friendly interface on the frontend.  
The application generates a random user profile, identifies the user’s country, loads detailed country information, calculates currency exchange rates, and displays recent news related to that country. This workflow reflects a real-world backend scenario where a server aggregates data from several services and returns one structured response to the client.

---

## 2. Objectives
The objectives of this project were:
- Generate and display a random user profile (personal data + photo)
- Retrieve country information based on the user’s country
- Display currency details and calculate exchange rates to USD and KZT
- Retrieve and display up to five news articles related to the country
- Keep API keys secure by using environment variables (`.env`)

---

## 3. Technologies Used
- **Node.js + Express** — backend server and API routing
- **Axios** — HTTP requests to external services
- **dotenv** — secure configuration through `.env` file
- **HTML / CSS / JavaScript** — frontend interface and dynamic rendering

---

## 4. APIs Used
- **RandomUser API** — provides random user data (name, photo, country, address, etc.)
- **Countrylayer API** — provides country information (capital, flag, etc.)
- **RestCountries API** — used to complete country details if some fields are missing (languages/currency)
- **ExchangeRate API** — provides currency conversion rates based on the country’s currency
- **NewsAPI** — returns news articles where the country name appears in the title

---

## 5. Project Structure
```text
assignment-api/
├─ server.js             
├─ .env                  
├─ .gitignore            
└─ public/
   ├─ index.html         
   ├─ app.js            
   └─ styles.css
```
## 6. Implementation Overview

### 6.1 Frontend
The frontend contains a simple interface with a button. When the button is clicked:

- The client sends a request to the backend endpoint: `GET /api/profile`
- The response is rendered into three sections:
  - **User** (personal details and photo)
  - **Country + Rates** (capital, languages, currency, and exchange rates)
  - **News** (up to 5 news articles about the country)

The date of birth is formatted into a readable form for better UI experience.

### 6.2 Backend
The backend is implemented with Express and provides one main endpoint:

- `GET /api/profile`

This endpoint performs the following steps:
- **Random user:** requests a random profile from RandomUser API  
- **Country info:** uses the user’s country name to retrieve country information from Countrylayer (and completes fields using RestCountries if needed)  
- **Exchange rates:** uses the country currency code as a base currency and loads conversion rates to USD and KZT  
- **News:** requests recent articles from NewsAPI and filters titles that include the country name  

After collecting and processing all results, the backend returns one combined JSON response to the frontend.

---

## 7. Security and Configuration
API keys are stored in a local `.env` file and are not hardcoded in the source code. The `.gitignore` file prevents uploading `.env` and `node_modules` to GitHub, ensuring the keys remain private.

---

## 8. Conclusion
This project successfully demonstrates full-stack integration of multiple APIs using a clear client–server architecture. I implemented a backend endpoint that aggregates data from several sources and provides a structured response to the frontend. The frontend then renders the user profile, country details, exchange rates, and news in a clean and readable interface.

Overall, the assignment shows practical skills in REST API usage, backend development with Express, frontend rendering with JavaScript, and secure configuration using environment variables.

