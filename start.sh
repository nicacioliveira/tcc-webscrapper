#!/usr/bin/env bash
echo "======start script====="
export NODE_ENV=
echo "======================"
echo "DUMPING OLD DATABASE IF EXISTS..."
mysqldump -uroot -proot tcc > tcc.sql
echo "======================"
echo "DROPPING OLD DATABASE IF EXISTS..."
cd ./db
sequelize db:drop
echo "======================"
echo "CREATING NEW DATABASE IF EXISTS..."
sequelize db:create
echo "======================"
echo "MIGRATING DATABASE"
sequelize db:migrate
echo "======================"
echo "INSTALLING SEEDERS"
sequelize db:seed:all
cd ..
echo "======DONE====="
