---
# Easier: npm run place:add -- "<Google Maps link>" fills all of this in for you.
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
lat: 0.0
lng: 0.0
category: "restaurant"   # a name from data/map.yaml (colours)
city: ""
address: ""
link: ""                 # optional; without it the popup links to a Google Maps search
description: ""          # one line, shown in the popup
# image: ""
# dishes: ["..."]
# price: ""
# hours: ""
build:
  render: "never"
  list: "always"
---
