#!/bin/bash
# Este script genera un keyfile para MongoDB Replica Set
# Solo se ejecuta una vez

if [ ! -f "./mongo-keyfile" ]; then
  echo "Generando keyfile para MongoDB Replica Set..."
  openssl rand -base64 756 > ./mongo-keyfile
  chmod 400 ./mongo-keyfile
  echo "Keyfile generado exitosamente"
else
  echo "Keyfile ya existe"
fi
