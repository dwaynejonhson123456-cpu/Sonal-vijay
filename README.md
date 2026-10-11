# Havenly — Student Accommodation

A responsive PG discovery website built for the Student Accommodation Website Project brief. It includes searchable property cards and detail views, city/budget/gender filters, a live shortlist, PHP/MySQL APIs, signup/login, and a React shortlist counter.

## Run locally (Windows)

1. Install **XAMPP** from [apachefriends.org](https://www.apachefriends.org/) if PHP and MySQL are not already installed. No other download is needed.
2. Copy this project folder into `C:\xampp\htdocs\havenly` (or make your existing folder available under XAMPP's `htdocs`).
3. Open the XAMPP Control Panel and start **Apache** and **MySQL**.
4. Visit `http://localhost/phpmyadmin`, choose **Import**, select `database/schema.sql`, then choose **Import** at the bottom.
5. If your MySQL password is not blank, update `DB_USER` and `DB_PASS` in `config.php`.
6. Open `http://localhost/havenly/` in a browser.

The photo and font URLs use online services, so they need an internet connection. Listings and authentication are stored in MySQL. Create an account to save or remove stays from your shortlist. The React 18 shortlist count falls back to a plain JavaScript counter if the CDN is unavailable.

## Project files

- `index.php` — responsive page, detail/auth dialogs, and session bootstrap
- `assets/css/style.css` — layout, responsive styles, and visual design
- `assets/js/app.js` — filters, AJAX interactions, detail views, and React shortlist component
- `api/` — property, interest, authentication, and logout endpoints
- `database/schema.sql` — normalized schema and eight example properties
- `config.php` — PDO database connection settings

## Notes

The project uses parameterized PDO queries, password hashing, session ID rotation on authentication, and database constraints for user/property relationships. Use HTTPS, update the default database credentials, and add CSRF protection and production session settings before public deployment.
