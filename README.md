# RM Wallet – Personal Finance Tracker

**IMS566 Advanced Web Design Development and Content Management – Individual Project**

RM Wallet is a small web app prototype that helps students track income, expenses and monthly budgets in Malaysian Ringgit (RM). All data is sample data stored in `js/data.js`; no database is used.

## Features
- Login and register page with hardcoded demo credentials and clear error feedback
- Consistent responsive navbar and professional footer on every page
- Dashboard with summary cards, income vs expense bar chart, spending doughnut chart and latest transactions
- Transactions page: searchable and filterable table
- Budgets page: progress cards, budget table and budget vs actual chart (turns red when over budget)
- Page titles, meta descriptions, keywords and structured sections for content management

## How to test login
| Username | Password |
|---|---|
| `demo` | `Finance@123` |

Try a wrong password to see the error message. You can also register a new account (saved in your browser's localStorage).

## Frameworks / libraries
- Bootstrap 5.3 and Bootstrap Icons
- Chart.js 4
- Google Fonts: Bricolage Grotesque, DM Sans

## Project structure
```
index.html          login / register
dashboard.html      landing page after login
transactions.html   data view 1
budgets.html        data view 2
css/style.css       custom styles
js/data.js          sample data
js/app.js           auth guard, navbar, footer, helpers
```

## Deploy to GitHub Pages
1. Create a GitHub repository and upload all files (keep `index.html` in the root).
2. Go to **Settings > Pages**, set Source to **Deploy from a branch**, choose `main` and `/ (root)`, then Save.
3. Your site will be live at `https://USERNAME.github.io/REPO-NAME/`.

Developed for UiTM IMS566. Best viewed in Google Chrome.
