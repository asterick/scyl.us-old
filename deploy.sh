npm run build
ssh node@scyl.us "pm2 stop scyl.us"
ssh node@scyl.us "cd ~/scyl.us && git pull"
scp -r assets node@scyl.us:~/scyl.us
ssh node@scyl.us "pm2 start scyl.us"
