#!/bin/bash

# Deployment script for Now.sh
# Requires JWT_SECRET, MONGODB_USER, and MONGODB_SECRET to be defined in .env.production
#
# Example .env.production:
#
# export JWT_SECRET=SomethingToSignJWTsWith
# export MONGODB_USER=nulist
# export MONGODB_SECRET=PasswordForNulistMongoUser
# export RECAPTCHA_SECRET_KEY=RecaptchaSecret

source ./.env.production

# Have to do this since we're using the OSS plan and we don't want our
# secrets on display for the world to see
now --public -e JWT_SECRET=${JWT_SECRET} -e MONGODB_USER=${MONGODB_USER} -e MONGODB_SECRET=${MONGODB_SECRET} -e RECAPTCHA_SECRET_KEY=${RECAPTCHA_SECRET_KEY} 
