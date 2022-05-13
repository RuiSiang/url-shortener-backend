# URL Shortener Backend

## Configuration
Environmental variables are written in .env.example, rename it to .env to deploy. If you use the containerized version, use the container manager's spec on defining environmental variables.

## POST /urlgen
### Body: JSON
{
  url: string
  expiry: number
}
### Response
token: string (8 chars)

## GET /:link
### 302 redirect to URL
