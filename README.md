# tmp - token management platform

Alpha: [![pipeline status](https://gitlab.com/fio.io/tms/badges/alpha/pipeline.svg)](https://gitlab.com/fio.io/tms/-/commits/alpha)
Staging: [![pipeline status](https://gitlab.com/fio.io/tms/badges/staging/pipeline.svg)](https://gitlab.com/fio.io/tms/-/commits/staging)
Release: [![pipeline status](https://gitlab.com/fio.io/tms/badges/release/pipeline.svg)](https://gitlab.com/fio.io/tms/-/commits/release)

## Prepare for CI/CD

```
gcloud iam service-accounts create gitlab-cicd --display-name gitlab-cicd
gcloud projects add-iam-policy-binding {YOUR_PROJECT} --member serviceAccount:gitlab-cicd@{YOUR_PROJECT}.iam.gserviceaccount.com --role roles/container.admin # can use gcp editor
gcloud iam service-accounts keys create  --iam-account=gitlab-cicd@{YOUR_PROJECT}.iam.gserviceaccount.com gitlab-cicd.json
```

### Create K8S clusters

https://console.cloud.google.com/kubernetes/add

## Installation

1. import GPG key for demo
```
gpg --export-secret-keys $ID > donkey.asc # Export
gpg --import donkey.asc
```

2. install convert from ImageMagic
install node.js 10 and pm2
```
sudo npm install -g n pm2
sudo n 10
```

3. install modules
```
npm install
```

4. install env

```
npm run clone-or-update-config
```

ref: [GitLab/fio.one/server-config](https://gitlab.com/fio.io/server-config)

5. start service and watch logs
```
npm start
pm2 l
pm2 logs
```

## How to use it
connect to http://localhost:8080/dashboard.html

## How it works
1. public/dashboard.html calls /dashboard API in routes/index.js
2. the API calls models/ExpectoPatronum.js to get data from the contract
3. compose data with public/dashboard.js using res.data() in api.js
4. Vue.js render the page

### Files & Folders
| Name      | Description                                      |
|-----------|--------------------------------------------------|
| abi/      | where the ABI files go                           |
| api.js    | res.data() for Vue.js data and res.ok() for API  |
| app.js    | web server config, modules and middlewares       |
| config.js | the configurations                               |
| models/   | models that interact with DB, BlockChain, etc... |
| public/   | document root for web service                    |
| routes/   | the data APIs and APIs for Apps                  |
| sio.js    | socket.io for bi-directional messaging           |
| tmp       | the main program                                 |
| utils/    | tools                                            |

### Development on local
```
npm start
```

### Run all services on production server
```
npm run logger
npm run production
npm run tms-health2go
```

### Test

```
npm test
```

or

```
NODE_ENV=test && node_modules/.bin/mocha CI_test --no-opts --config ../../../../configs/test.development.config.js --exit
```

## QA

1. Got an error `Please set NODE_ENV in configs/*.env when start the app.`
  - Maybe you have not set-up your environment variables in `configs/*.env`, please run `npm run clone-or-update-config`.
  - If you have update the env file. Make sure `configs/*.env` hav not set `NODE_ENV` environment variables.
  - Make sure the server-config repo branch is `master`. The repo default path is `../server-config`.
  - See `scripts/clone-or-update-config.sh` for the detail.

## TODOs
- Move all projects into branch: alpha
  - pm2 app name: tms
    - branch: release
  - pm2 app name: tms-attn
    - branch: release-demo-attn
