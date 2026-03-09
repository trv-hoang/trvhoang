---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
lat: 0.0
lng: 0.0
category: "food"
city: ""
address: ""
image: ""
link: ""
description: "One-line description shown in the map popup and card."
_build:
  render: "never"
  list: "always"
---

Write the full story about this place here.
