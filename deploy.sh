npm run core
ssh node@scyl.us "source .profile; pm2 stop scyl.us"
ssh node@scyl.us "source .profile; cd ~/scyl.us; git reset --hard"
ssh node@scyl.us "source .profile; cd ~/scyl.us; git pull"
ssh node@scyl.us "source .profile; cd ~/scyl.us; npm prune; npm install"
ssh node@scyl.us "source .profile; cd ~/scyl.us; npm run build"
scp -r assets/*.wasm node@scyl.us:~/scyl.us/assets
ssh node@scyl.us "source .profile; pm2 start scyl.us"
