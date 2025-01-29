# News and Discussion API 

A RESTful API that enables users to retrieve articles, participate in discussions through comments, and organize content with topic tags. Features a voting system to highlight the most engaging content.

## Features
- Retrieve, sort and filter news articles by topic
- Vote on articles and comments
- Post and delete comments
- RESTful endpoints with JSON responses

## Usage

The hosted version of this API is available at 
https://news-and-discussion-platform.onrender.com/api. A complete list of available endpoints is listed on this page.

## Local Development

### Pre-requisites
Before development, make sure you have the followings installed:
- Node.js (v20.15.1 or higher)
- npm (10.8.2 or higher)
- Git
- PostgresSQL (14.14 or higher)

### Installation

1. Clone the repository

```
git clone https://github.com/loklokyuen/news-website-project && cd news-website-project
```
2. Install dependencies
```
npm install
```
3. Set up environmental variable by creating a file named `.env.development` and specify the database to connect to inside the file
```
PGDATABASE=your_database_name
```
4. Initialize the database
```
npm run setup-dbs
```
5. Seed the database
```
npm run seed
```
**Important**: Remember to put `.env.*` in your `.gitignore` file to prevent commiting any environmental variable files.
### Testing
Run all tests:
```
npm test
```
Run specific test suites:
```
npm test app    # For API endpoint tests
npm test utils  # For utility function tests
```


## Production Deployment

To deploy the application to a hosted website, follow these steps:
1. Configure production environment by creating a file named `.env.production` and specify the database URL inside
```
DATABASE_URL=your_database_url
```
2. Seed the production database
```
npm run seed-prod
```


--- 

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
