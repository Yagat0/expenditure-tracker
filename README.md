# Expenditure Tracker (KIV/UUR Semester Project)

## About the Project
Expenditure Tracker is a responsive web application for managing personal expenses. The mobile mode is optimized for fast input, while the desktop mode focuses on overview and analysis.

This project was created as a semester project for the course KIV/UUR (Introduction to User Interfaces) at the University of West Bohemia, Faculty of Applied Sciences.

## Features
- Expense management (CRUD) with storage in `localStorage`.
- Recurring expenses: daily / weekly / monthly / yearly, generated until a selected end date (or automatically up to 2 years).
- Quick filters: period (including custom range), category, recurrence, spent only (past/present).
- Summary expense card with period selection.
- Desktop overview in MUI DataGrid (sorting, pagination, edit/delete, empty state).
- Mobile expense list as expandable cards with details and actions.
- Destructive actions confirmed by a dialog; for recurring items, the option to delete just one or all future items simultaneously.
- Statistics: month selection, KPIs (total, daily average, most expensive category), pie chart with a legend, bar chart of the last 6 months + planned next month, list of the 3 closest future expenses.
- JSON Import/Export (expenses + settings) with a warning before overwriting data.
- Settings: category management (name, icon, color), deletion only if unused; language CZ/EN; currency is currently fixed to CZK.
- UI localization (cs/en).

## OCR/AI (optional)
- In the wizard, you can select receipt scanning (camera or upload); AI will fill in the amount, date, location, and category.
- The receipt is analyzed using the Gemini 2.5 Flash model and requires a `VITE_GEMINI_API_KEY`. Without the API key, only manual expense entry is fully functional.

## UX and Responsiveness
- Desktop: top bar with export/import and settings, left sidebar with expense summary and navigation.
- Mobile: bottom navigation (Expenses, +, Statistics), the wizard is a full-screen dialog.

## Data Model (Expense)
- `uuid`: string
- `amount`: number
- `date`: string (ISO)
- `category`: string
- `note?`: string
- `location?`: string
- `recurrence`: `none | daily | weekly | monthly | yearly`
- `recurringGroupId?`: string (group for deleting recurring items)

## Data Persistence
- Expenses: `localStorage` key `tracker_expenses`
- Settings: `localStorage` key `tracker_settings`

## Running the Project
### Gemini AI Configuration
To enable OCR and automatic expense autofill features, proceed as follows:

1. Go to [https://aistudio.google.com/api-keys](https://aistudio.google.com/api-keys).
2. Click the **Create API Key** button.
3. Create a project, e.g., named **Expenditure Tracker**, and have it generate a key.
4. Copy the generated key.
5. Create or open a `.env.local` file in the root directory of the project.
6. Insert the key into the file after the corresponding variable:
   ```env
   VITE_GEMINI_API_KEY=<API_key>
   ```

### Starting the Application
```sh
npm install # Required only before the first run
npm run dev
```

After running the second npm command, the application will start on a local HTTP server, and its localhost address will be displayed below. Open this address in your browser.
## Technologies
- React 19, TypeScript 5, Vite
- MUI (Material UI), MUI X DataGrid, MUI Date Pickers
- Recharts, lucide-react, dayjs
- react-router-dom
- @google/generative-ai

## Planned Features
- **Multi-currency support:** Support for multiple currencies and currency conversion.
- **Multi-user system:** Transforming the app into a multi-user platform.
- **Database persistence:** Replacing `localStorage` with a PostgreSQL database.