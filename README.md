# BlobCrypt
Download blob from Azure Blob Storage. Decrypt the contents with PGP. Write output to a file.

## Requirements
You must have the [azure-cli](https://learn.microsoft.com/en-us/cli/azure/get-started-with-azure-cli) installed and you must be logged in (`az login`).

## Installation
The following shows how to build this from source and install the script into your $PATH.
```bash
npm i -g blobcrypt
```

## Usage
The script uses environment variables to get the container_url, keyvault_url, and secret_name. The
specific names are in the `.env.template` file. The script allows you to provide a `.env` file in
the directory where you are running from, in order to set the variables per directory. You can also
set these in your environment.

Provide the name of the blob from blob storage along with a path to write the output to.
```bash
blobcrypt encrypt blobname path/to/output/file
# or
blobcrypt decrypt blobname path/to/input/file
```
