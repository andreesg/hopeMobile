#!/bin/bash
git pull origin dev && git commit -am "$1" && git push origin dev
