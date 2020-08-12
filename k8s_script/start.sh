#!/bin/sh
# DESCRIPTION:
#           docker 啟動呼叫腳本，自動建立 pm2 運作 log 存放位置資料夾，並供 npm 啟動時使用
# HISTORY:
#*************************************************************
echo $HOSTNAME
pm2 status
if [ $KUBERNETES_SERVICE_PORT ]
then
    mkdir - p /mnt/$HOSTNAME/
    npm run start-docker
else
    mkdir - p ./.pm2
    npm run start-docker
fi
