# Status Checker



[![Build Status](https://travis-ci.org/armand-janssen/statuschecker.svg?branch=main)](https://travis-ci.org/armand-janssen/statuschecker)


The status checker is a simple tool to check the availability of your services.
- [Status Checker](#status-checker)
  - [Features](#features)
  - [Roadmap](#roadmap)
- [Configuration](#configuration)
  - [Config example](#config-example)
- [Docker commands](#docker-commands)
  - [Docker compose example](#docker-compose-example)
- [Links](#links)

## Features
- simple json config
- no gui (yet)
- slack notifications

## Roadmap
- GUI showing jobs
- GUI for configuration
- Helm3 template
- Terraform module
- Terragrunt example

# Configuration

| Value                       | Required | Description                                                                                                                                                                                                           |
| --------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                          | Yes      | A unique id for the check                                                                                                                                                                                             |
| name                        | Yes      | A human readable name for the check                                                                                                                                                                                   |
| pattern                     | Yes      | When or how often to check using cron notation. [More info on the cron notation can be found on the page of the cron-parser library](https://github.com/harrisiirak/cron-parser)                                      |
| url                         | Yes      | The url to check                                                                                                                                                                                                      |
| timeout                     | Yes      | Maximum timeout for check                                                                                                                                                                                             |
| expectedHttpStatus          | Yes      | The httpstatus code expected when calling the url                                                                                                                                                                     |
| expectedText                | No       | Optionally a check can be performed on a string of text on the response of the url. Sometimes a service returns a 200, but actually shows an errorpage. This can be used to check that the expected page is returned. |
| notification.type           | Yes      | Currently only 1 type of notification is supported: `slack`                                                                                                                                                           |
| notification.webhook        | Yes      | The url to the [slack webhook](https://api.slack.com/messaging/webhooks) to which the notifications are send.                                                                                                         |
| notification.interval       | n/a      | When a service is down or back online a notification is sent directly. <br/>With interval you can configure the interval of the reminder notifications when the service is down. Example: every 4 hours.              |
| notification.interval.unit  | Yes      | One of: hours , minutes, days                                                                                                                                                                                         |
| notification.interval.value | Yes      | A number larger than 0.                                                                                                                                                                                               |

## Config example
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

## Docker compose example
```yaml
version: '2'
services:
  statuschecker:
    container_name: statuschecker
    image: armandjanssen/statuschecker:0.2
    restart: always

    ports:
      - "4455:80"
    volumes:
      - <YOUR-LOCAL-DIR-HERE>/jobs.json:/usr/src/app/config/src/jobs.json
```


# Links

* [Github](https://github.com/armand-janssen/statuschecker)
* [Docker hub](https://hub.docker.com/r/armandjanssen/statuschecker)



