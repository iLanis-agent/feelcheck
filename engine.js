(function (root) {
  'use strict';
  function cToF(c) { return c * 9 / 5 + 32; }
  function fToC(f) { return (f - 32) * 5 / 9; }
  function toMph(v, unit) { return unit === 'kmh' ? v / 1.609344 : unit === 'ms' ? v * 2.236936 : v; }
  // NWS heat index (Rothfusz regression with the Steadman simple formula and adjustments), T in F, RH in percent
  function heatIndex(T, RH) {
    var simple = 0.5 * (T + 61.0 + (T - 68.0) * 1.2 + RH * 0.094);
    var avg = (simple + T) / 2;
    if (avg < 80) return { hi: simple, method: 'simple' };
    var hi = -42.379 + 2.04901523 * T + 10.14333127 * RH - 0.22475541 * T * RH - 0.00683783 * T * T - 0.05481717 * RH * RH + 0.00122874 * T * T * RH + 0.00085282 * T * RH * RH - 0.00000199 * T * T * RH * RH;
    var adj = 0;
    if (RH < 13 && T >= 80 && T <= 112) adj = -((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    else if (RH > 85 && T >= 80 && T <= 87) adj = ((RH - 85) / 10) * ((87 - T) / 5);
    return { hi: hi + adj, method: adj ? 'regression+adjustment' : 'regression' };
  }
  // NWS wind chill (2001 formula), T in F, V in mph
  function windChill(T, V) { var p = Math.pow(V, 0.16); return 35.74 + 0.6215 * T - 35.75 * p + 0.4275 * T * p; }
  // NWS heat categories (weather.gov/ama/heatindex)
  function heatCategory(hi) {
    if (hi < 80) return { key: 'none', label: 'Below heat index range', note: 'Heat index only applies from about 80F up.' };
    if (hi < 90) return { key: 'caution', label: 'Caution', note: 'Fatigue possible with prolonged exposure and/or physical activity.' };
    if (hi < 103) return { key: 'extreme-caution', label: 'Extreme caution', note: 'Heat stroke, heat cramps or heat exhaustion possible with prolonged exposure and/or physical activity.' };
    if (hi < 125) return { key: 'danger', label: 'Danger', note: 'Heat cramps or heat exhaustion likely, and heat stroke possible with prolonged exposure and/or physical activity.' };
    return { key: 'extreme-danger', label: 'Extreme danger', note: 'Heat stroke is highly likely.' };
  }
  // Wind chill is defined for air at or below 50F and wind above 3 mph (NWS)
  function windChillValid(T, V) { return T <= 50 && V > 3; }
  function feels(T, RH, V) {
    var h = heatIndex(T, RH);
    if (T >= 80 || h.hi >= 80) return { mode: 'heat', value: h.hi, heat: heatCategory(h.hi) };
    if (windChillValid(T, V)) {
      var w = windChill(T, V);
      return { mode: 'cold', value: w, frostbiteAir: T < 32, frost30: T < 32 && w <= -19 };
    }
    return { mode: 'air', value: T };
  }
  var api = { cToF: cToF, fToC: fToC, toMph: toMph, heatIndex: heatIndex, windChill: windChill, heatCategory: heatCategory, windChillValid: windChillValid, feels: feels };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Feel = api;
})(typeof window !== 'undefined' ? window : this);
