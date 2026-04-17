/**
 * High-precision time scales and conversion utilities.
 * Implementation follows IAU standards where possible.
 */

/**
 * Calculates the Julian Date (JD) from a Date object or UTC components.
 * Julian Date is the number of days since noon UTC on January 1, 4713 BC.
 */
export function getJulianDate(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();
  const ms = date.getUTCMilliseconds();

  // Algorithm from Meeus Astronomical Algorithms
  let y = year;
  let m = month;
  if (month <= 2) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);

  const jd = Math.floor(365.25 * (y + 4716)) +
             Math.floor(30.6001 * (m + 1)) +
             day + b - 1524.5 +
             (hour + minute / 60 + (second + ms / 1000) / 3600) / 24;

  return jd;
}

/**
 * Historical and future Delta T (ΔT) approximation.
 * ΔT = TT - UT1.
 * Source: NASA / Espenak and Meeus (2006).
 */
export function getDeltaT(year: number): number {
  const t = (year - 2000) / 100;
  
  if (year < 1900) {
    return -13.95389181 + 32 * Math.pow((year - 1800) / 100, 2);
  } else if (year < 1950) {
    return 26.04610819 + 32 * Math.pow((year - 1800) / 100, 2);
  } else if (year < 1977) {
    return 27.64610819 + 0.67 * t + 0.11 * t * t;
  } else if (year < 1999) {
    return 32.19610819 + 0.37 * t + 0.05 * t * t;
  } else if (year < 2006) {
    return 69.90610819 + 0.334 * t + 0.04075 * t * t;
  } else if (year < 2051) {
    // Current IAU 2006/2000 era approximation
    return 68.96610819 + 0.32217 * t + 0.005589 * t * t;
  } else {
    // Future extrapolation
    return 69.90610819 + 0.334 * t + 0.04075 * t * t;
  }
}

/**
 * Convert Julian Date (UT) to Terrestrial Time (TT) Julian Date.
 * JDE = JD + ΔT/86400
 */
export function getJDE(jd: number, deltaT: number): number {
  return jd + deltaT / 86400;
}

/**
 * Time in centuries since J2000.0 epoch (JD 2451545.0).
 */
export function getCenturiesSinceJ2000(jd: number): number {
  return (jd - 2451545.0) / 36525.0;
}
