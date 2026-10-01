# FeelCheck

Heat index and wind chill calculator with NWS formulas and categories.

- Heat index: NWS Rothfusz regression with the simple-formula check and the low (<13%) and high (>85%) humidity adjustments. Categories: caution 80-90F, extreme caution 90-103, danger 103-124, extreme danger 125+.
- Wind chill: 35.74 + 0.6215T - 35.75 V^0.16 + 0.4275 T V^0.16, valid for air at or below 50F and wind above 3 mph. About -19F or colder: exposed skin can freeze in about 30 minutes. Frostbite needs air below 32F.

Tests match the NWS worked examples (96F/65% = 121F, 0F/15 mph = -19F) and 72 cells of the published NWS wind chill chart. Guidance only, not medical advice.

Static client-side. `node test-engine.js` runs the tests.
Sources: https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml , https://www.weather.gov/ama/heatindex , https://www.weather.gov/safety/cold-wind-chill-chart
