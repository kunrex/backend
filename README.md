# Backend

Submission to backend assignment

#### 1. Create the .env file

Rename `src/exmaple.env` to `.env` and fill in the appropriate values. 

An example:
```env
APP_PORT=3000

JWT_SECRET=SuperHardStringToGuess1234556789$%^&*

SALT_ROUNDS=10

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=superhardpasswordtoguess123456789$%^&*
DB_NAME=backend # !!Unchanged
```

#### 2. Initialising Bootstrap themes

```npm
npm run sassinit
```

> Alternative: Precompile scss files in `node_modules/startbootstrap-one-page-wonder` to `src/assets/template.css` (this file must be created first)

#### 3. Initialising the database

In Mysql:

```sql
CREATE TABLE backend;
```

and then

```npm
npm run initialise
```

> Alternative: Run `src/db.sql` locally using your MySQL credentials

#### 4. (Optional) Quickstart

```npm
npm run quickstart
```

> Sets up 21 predefined food items and tags, and creates an `Admin User` with credentials:
> 1. Name: admin
> 2. Email: admin@backend.com
> 3. Password: adminpassword123

> Alternative: Run `src/quickstart/dump.sql` locally using your MySQL credentials, move all images from `src/quickstart/foods` to `src/assets/foods` and run a DB command to grant `auth = 7` for a user of of choice.

#### 5. Enjoy :D

> Credits: background music: <a href="https://mixkit.co/free-stock-music/">Serene View</a>