# Northcoders News API

Hosted version: https://nc-news-o4bo.onrender.com/

NC News or Northcoders News is a back-end project to generate a functional API for a database of users, articles, comments, and topics for a fictional news website. It is the back-end counterpart to my NC News WebApp.

FE Repo: https://github.com/tjejack/fe-nc-news

FE Hosted: https://nc-news-tj-jack.netlify.app/

If you wish to use this database yourself:

# 1. Clone the Repository
In the terminal on your device, cd into the directory where you wish to keep this repository, then,

```git clone https://github.com/tjejack/be-nc-news.git```

Or, if you have already forked this repo, copy the HTTPS link from the green 'Code' dropdown and replace the url.

# 2. Install the necessary dependencies
This repository uses npm, jest, dotenv, express, fs, and pg.
Before working with the repository, you're going to need to install these to your newly downloaded repo.

First, install npm by typing the following command into your terminal inside the git repository 

```npm install```

To find out more about the packages used, see the documentation below.
Jest: https://jestjs.io/docs/getting-started
Dotenv: https://www.npmjs.com/package/dotenv 
Express: https://expressjs.com/
pg: https://www.npmjs.com/package/pg
fs: https://nodejs.org/api/fs.html

# 3. File Setup
Once you have cloned the repository and installed all of the necessary dependencies, you will need to set up your environment variables.

In order to access the test database, create .env.test file at the root level of your repo. In this file, set PGDATABASE to the test database. DO NOT add any additional information in this file. Do not finish the line with a semi-colon.

```PGDATABASE=nc_news_test```

For your development database, repeat the same steps, but this time create .env.dev file and set PGDATABASE to the dev database

```PGDATABASE=nc_news```

Make sure you remember to add your .env.* files to .gitignore

# 4. Seed your databases
You're going to need to run some scripts from the package.json file in order to prepare your databases for use.

First, you will need to create your SQL databases. 

```npm run setup-dbs```

Then, you will need to seed them with your test and development data respectively.

```npm run seed```

# This repository requires node v21.2.0 and postgres v14.10.
