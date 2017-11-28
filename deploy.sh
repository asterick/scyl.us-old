npm run build
ssh node@scyl.us "source .profile; pm2 stop scyl.us; cd ~/scyl.us; git pull"
scp -r assets node@scyl.us:~/scyl.us
ssh node@scyl.us "source .profile; pm2 start scyl.us"
