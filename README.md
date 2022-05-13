# URL Shortener Backend

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
