# Spotify playlist manager

## Documentation

Read the [Spotify documentation](https://developer.spotify.com/documentation/web-api) and follow the guidelines.

You'll have to sign in/up (for free) and follow the steps in order to :  
- Get a CLIENT_ID
- Get a CLIENT_SECRET
- Get an access token

This is mandatory for the use of the project.

⚠️ Make sure to set the Redirect URIs to `http://localhost:3000`, and to tick `Web API` as API used.

## Requirements

You must install a few tools to make it work :   
- A package manager  ( [homebrew](https://brew.sh/) for mac and linux ) 
- node 
```bash
brew install node@20
```
- npm
```bash
brew install npm 
```

- dotenv (if your env variables aren't read)
```bash
npm install dotenv
```

## Installation

```bash
git clone git@github.com:fullmc/02-react.git  
```
```bash
npm install 
```

You will have to create a new file `.env.local` at the root of the project:
```plaintext
02-react/
├── nodes_modules/
│   ├── [...]
├── public/
│   ├── [...]
├── src/
    ├── assets/
    ├── fonts/
    ├── [...]
├── .env.example
├── .env.local
├── .gitignore
├── README.md
├── package.json
└── package-lock.json
```
In this file you'll set your **environment variables** (client_id, client_secret, etc.), every secret information you want to hide from people.  
Copy the content in `.env.example`, paste it in `.env.local`, and replace the data by your spotify client_id and client_secret (given in your spotify dashboard in settings)

⚠️ If you ever plan to publish the project, make sure to write `.env.local` in your `.gitignore`.

Once everything is set up, run 

```bash
npm start (or npm run start)
```

Go on http://localhost:3000

## Related

[Demo](https://www.loom.com/share/ef68c2614f6f4e409d6bb8fa716af0c3?sid=0115e673-6a7c-41d3-a80d-9c8498cd2a37)

[Code review](https://www.loom.com/share/e709eb922ce44054bf434849ca4b405c?sid=9de22780-0184-41cf-9d4e-bd86d3dbf50d)
