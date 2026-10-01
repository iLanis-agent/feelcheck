var E = require('./engine.js'), n = 0, bad = 0;
function eq(a, b, m, tol) { n++; if (!(Math.abs(a - b) <= (tol || 0))) { bad++; console.log('FAIL', m, a, b); } }
// NWS worked examples: 96F / 65% -> 121F heat index; 0F with 15 mph -> -19F wind chill
eq(Math.round(E.heatIndex(96, 65).hi), 121, 'NWS 96/65'); eq(Math.round(E.windChill(0, 15)), -19, 'NWS 0/15');
// NWS wind chill chart rows (T = 40 down to -45 step 5)
var T = []; for (var t = 40; t >= -45; t -= 5) T.push(t);
var rows = {
  5: [36, 31, 25, 19, 13, 7, 1, -5, -11, -16, -22, -28, -34, -40, -46, -52, -57, -63],
  10: [34, 27, 21, 15, 9, 3, -4, -10, -16, -22, -28, -35, -41, -47, -53, -59, -66, -72],
  15: [32, 25, 19, 13, 6, 0, -7, -13, -19, -26, -32, -39, -45, -51, -58, -64, -71, -77],
  20: [30, 24, 17, 11, 4, -2, -9, -15, -22, -29, -35, -42, -48, -55, -61, -68, -74, -81]
};
Object.keys(rows).forEach(function (v) { rows[v].forEach(function (c, i) { eq(Math.round(E.windChill(T[i], +v)), c, 'chart ' + T[i] + 'F ' + v + 'mph'); }); });
// heat index regression values (hand-computed from the published NWS equation, rounded)
[[90, 70, 106], [90, 50, 95], [100, 40, 109], [110, 25, 117], [85, 90, 102]].forEach(function (r) { eq(Math.round(E.heatIndex(r[0], r[1]).hi), r[2], 'hi ' + r[0] + '/' + r[1]); });
// low humidity adjustment and high humidity adjustment are applied
eq(E.heatIndex(95, 5).method === 'regression+adjustment' ? 1 : 0, 1, 'dry adj'); eq(E.heatIndex(85, 90).method === 'regression+adjustment' ? 1 : 0, 1, 'humid adj'); eq(E.heatIndex(100, 40).method === 'regression' ? 1 : 0, 1, 'plain');
// adjustment equations
var T0 = 95, R0 = 5, plain = -42.379 + 2.04901523 * T0 + 10.14333127 * R0 - 0.22475541 * T0 * R0 - 0.00683783 * T0 * T0 - 0.05481717 * R0 * R0 + 0.00122874 * T0 * T0 * R0 + 0.00085282 * T0 * R0 * R0 - 0.00000199 * T0 * T0 * R0 * R0;
eq(E.heatIndex(95, 5).hi, plain - 2, 'dry adj size at 95F/5% = (13-5)/4 * 1', 1e-9);
// mild weather uses the simple formula (heat index close to the air temp, below 80)
eq(E.heatIndex(70, 50).method === 'simple' ? 1 : 0, 1, 'simple 70'); eq(E.heatIndex(70, 50).hi, 0.5 * (70 + 61 + 2 * 1.2 + 50 * 0.094), 'simple value', 1e-9);
// monotone: more humidity never cools at 90F; more wind never warms below 50F
for (var rh = 40; rh < 100; rh += 5) eq(E.heatIndex(90, rh + 5).hi >= E.heatIndex(90, rh).hi ? 1 : 0, 1, 'humidity monotone ' + rh);
for (var v = 4; v < 60; v += 4) eq(E.windChill(20, v + 4) <= E.windChill(20, v) ? 1 : 0, 1, 'wind monotone ' + v);
// categories (NWS): 80-90 caution, 90-103 extreme caution, 103-124 danger, 125+ extreme danger
[[79, 'none'], [80, 'caution'], [89.9, 'caution'], [90, 'extreme-caution'], [102.9, 'extreme-caution'], [103, 'danger'], [124.9, 'danger'], [125, 'extreme-danger'], [150, 'extreme-danger']].forEach(function (r) { eq(E.heatCategory(r[0]).key === r[1] ? 1 : 0, 1, 'cat ' + r[0]); });
// validity of wind chill: air at or below 50F and wind above 3 mph
eq(E.windChillValid(50, 4) ? 1 : 0, 1, 'v50'); eq(E.windChillValid(51, 10) ? 1 : 0, 0, 'v51'); eq(E.windChillValid(30, 3) ? 1 : 0, 0, 'v3mph'); eq(E.windChillValid(30, 3.1) ? 1 : 0, 1, 'v3.1');
// feels(): modes
eq(E.feels(96, 65, 5).mode === 'heat' ? 1 : 0, 1, 'heat'); eq(Math.round(E.feels(96, 65, 5).value), 121, 'heat value'); eq(E.feels(96, 65, 5).heat.key === 'danger' ? 1 : 0, 1, 'heat danger');
eq(E.feels(0, 50, 15).mode === 'cold' ? 1 : 0, 1, 'cold'); eq(Math.round(E.feels(0, 50, 15).value), -19, 'cold value'); eq(E.feels(0, 50, 15).frost30 ? 1 : 0, 1, 'frost30 at -19');
eq(E.feels(10, 50, 5).frost30 ? 1 : 0, 0, 'no frost30 at 10F/5mph'); eq(E.feels(40, 50, 15).frostbiteAir ? 1 : 0, 0, 'no frostbite above freezing'); eq(E.feels(25, 50, 10).frostbiteAir ? 1 : 0, 1, 'frostbite possible below freezing');
eq(E.feels(65, 50, 10).mode === 'air' ? 1 : 0, 1, 'mild air'); eq(E.feels(30, 50, 2).mode === 'air' ? 1 : 0, 1, 'calm cold air');
// units
eq(E.cToF(0), 32, 'cToF'); eq(E.cToF(35), 95, 'cToF35'); eq(E.fToC(212), 100, 'fToC'); eq(E.toMph(10, 'mph'), 10, 'mph'); eq(E.toMph(16.09344, 'kmh'), 10, 'kmh', 1e-9); eq(E.toMph(10, 'ms'), 22.36936, 'ms', 1e-5);
console.log(n + ' assertions, ' + bad + ' failed'); process.exit(bad ? 1 : 0);
