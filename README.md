
## Installation

```bash
  git clone git@github.com:fullmc/02-react.git  
```
```bash
  npm install 
```

Then, you will have to create a new file `.env.local` at the root of the project:
```plaintext
02-react/
├── nodes_modules/
│   ├── [...]
├── public/
│   ├── [...]
├── src/
│   ├── [...]
├── .env.local
├── .gitignore
├── README.md
├── package.json
└── package-lock.json
```
In this file you'll set your **environment variables** (client_id, client_secret, etc.), every secret information you want to hide from people.

If you ever plan to publish the project, make sure to write `.env.local` in your `.gitignore`.

Once everything is set up :

```bash
  npm start (or npm run start)
```

Go on http://localhost:3000.
