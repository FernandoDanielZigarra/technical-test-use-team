#!/bin/bash
set -e

# Copiar y ajustar permisos del keyfile
if [ -f /tmp/mongo-keyfile ]; then
  cp /tmp/mongo-keyfile /data/mongo-keyfile
  chown mongodb:mongodb /data/mongo-keyfile
  chmod 400 /data/mongo-keyfile
fi

# Ejecutar el comando original de MongoDB
exec docker-entrypoint.sh "$@"
