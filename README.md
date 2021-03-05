# Status Checker

# config example
```json
[
  {
    "id": "Google",
    "name": "Check google.com every 5 minutes",
    "pattern": "0 */5 * * * *",
    "url": "https://www.google.com/?hl=eng",
    "timeout": 2000,
    "expectedHttpStatus": 200,
    "expectedText": "Feeling Lucky",
    "notification": {
      "type": "slack",
      "webhook": "<<Slack webhook url here>>",
      "interval": {
        "unit": "hours",
        "value": 2
      }
    }
  }
]
```

# Docker commands
- Build docker image: `docker build -t statuschecker .`

## Docker compose
```yaml
version: '2'
# sudo docker build -t statuschecker .
services:
  portainer:
    container_name: statuschecker
    image: statuschecker
    restart: always

    ports:
      - "4455:80"
    volumes:
      - <YOUR-LOCAL-DIR-HERE>:/usr/src/app/config
```


