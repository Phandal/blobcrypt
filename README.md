# BlobCrypt
Work with PGP encrypted blobs from Azure Blob Storage

## Requirements
You must have the [azure-cli](https://learn.microsoft.com/en-us/cli/azure/get-started-with-azure-cli) installed and you must be logged in (`az login`).

## Installation
The following shows how to build this from source and install the script into your $PATH.
```bash
npm i -g blobcrypt
```

## Usage
```bash
# To encrypt a file in blob storage
blobcrypt encrypt [options]

# To decrypt a file in blob storage
blobcrypt decrypt [options]

# To fetch a file from blob storage directly
blobcrypt fetch [options]

# For more inforation
blobcrypt --help
```
