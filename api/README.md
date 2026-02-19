# Theographic Bible Metadata GraphQL API

This directory contains the GraphQL API implementation for Theographic Bible Metadata.

## Structure

- `netlify/functions/graphql.js`: The main GraphQL serverless function
- `package.json`: Dependencies and scripts
- `netlify.toml`: Netlify configuration

## Development

1. Install dependencies: `npm install`
2. Start local development server: `npm start`
3. Access GraphiQL at `http://localhost:8888/.netlify/functions/graphql`

## Deployment

Push to a Git repository connected to Netlify. The API will be automatically deployed.

## Documentation

See `../docs/api-documentation.md` for detailed API documentation.
