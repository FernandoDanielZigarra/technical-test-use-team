#!/bin/bash

# Script para reconstruir imágenes sin caché y levantar servicios en segundo plano
docker-compose build --no-cache
docker-compose up -d