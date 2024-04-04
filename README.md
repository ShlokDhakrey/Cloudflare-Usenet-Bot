 
<h1 align="center"> Telegram Usenet Bot with Cloudflare Workers </h1>

 <div align="center">
  
[![GitHub stars](https://img.shields.io/github/stars/ShlokDhakrey/Cloudflare-Usenet-Bot.svg)](https://github.com/ShlokDhakrey/Cloudflare-Usenet-Bot/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/ShlokDhakrey/Cloudflare-Usenet-Bot.svg)](https://github.com/ShlokDhakrey/Cloudflare-Usenet-Bot/network)
[![GitHub issues](https://img.shields.io/github/issues/ShlokDhakrey/Cloudflare-Usenet-Bot.svg)](https://github.com/ShlokDhakrey/Cloudflare-Usenet-Bot/issues)
![GitHub pull requests](https://img.shields.io/github/issues-pr/ShlokDhakrey/Cloudflare-Usenet-Bot.svg)
![GitHub contributors](https://img.shields.io/github/contributors/ShlokDhakrey/Cloudflare-Usenet-Bot.svg)
 
</div>
This Telegram bot facilitates downloading NZB files from Usenet using either SABnzbd or NZBGet, and enables searching across multiple indexers through NZBHydra API. Additionally, it automatically uploads downloaded files to Google Drive. This bot is hosted on Cloudflare Workers using webhooks and utilizes the Telegram RAW API for communication.

## Things to Know Before Using This Repo

Before diving into using this repository, here are a few essential points to keep in mind:

### Cloudflare Workers Limitations:

- **Workers have limitations:** 
  - Cloudflare Workers have certain limitations, one of which is the inability to fetch direct IPs.
  - Therefore, it's necessary to connect a domain to your server's IP using proxy services such as Nginx, Apache, etc.

- **Telegram Webhook Limitations**
  -  add later
 

## Features

- **NZB Downloading**: Utilizes SABnzbd or NZBGet to download NZB files from Usenet.
- **Indexer Search**: Integrated with NZBHydra API to search across multiple indexers simultaneously.
- **Google Drive Upload**: Automatically uploads downloaded files to Google Drive for convenient access.
- **Cloudflare Workers Hosting**: Hosted on Cloudflare Workers, ensuring reliable performance and scalability.
- **Telegram RAW API**: Employs Telegram RAW API for efficient communication with Telegram users.

## Setup Instructions

1. **Cloudflare Workers Setup**
   - Clone this repository.
   - Configure your Cloudflare Workers account and set up a new worker.
   - Deploy the code to your Cloudflare Worker.

2. **Telegram Bot Setup**
   - Create a new Telegram bot using BotFather.
   - Set up a webhook for the bot using Cloudflare Workers URL.
   - Obtain the bot token.

3. **Configuration**
   - Configure the bot settings including Usenet download client (SABnzbd/NZBGet), NZBHydra API key, Google Drive credentials, etc., in the `config.js` file.

4. **Deployment**
   - Deploy the updated code to your Cloudflare Worker.

5. **Usage**
   - Start using the bot by interacting with it in your Telegram account.
   - Use commands to search for NZB files, initiate downloads, and manage files.

## Commands

- `/search [query]`: Search for NZB files across all indexers.
- `/grab [NZB ID]`: Add an NZB file for download.
- `/grab [Reply to a NZB File]`: Add an NZB file for download.
- `/status`: List current downloads.
- `/cancel [NZB ID]`: Cancel a download.
- `/status [download_id]`: Get the status of a download.
- `/help`: Display help information.

## Contributors

- [Shlok Dhakrey](https://github.com/ShlokDhakrey) - Developer

## License

This project is licensed under the [MIT License](LICENSE).

## Disclaimer

This project is provided as-is without any warranties or guarantees. Use at your own risk.
