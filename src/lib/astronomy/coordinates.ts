/**
 * IAU 2000B Nutation model and Coordinate Transformations.
 * Implementations for Apparent Positions.
 */

import { getCenturiesSinceJ2000 } from "./time";

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

function norm360(a: number) {
    while (a < 0) a += 360;
    return a % 360;
}

/**
 * Nutation terms IAU 1980 / 2000 (abbreviated).
 * Returns { dPsi, dEps, eps0, epsTrue } in degrees.
 */
export function getNutation(je: number) {
    const T = je;
    const T2 = T * T;
    const T3 = T2 * T;

    // Fundamental arguments (Meeus/IAU)
    const Mm = (134.962981389 + 198.867398056 * T + norm360(477000 * T) + 0.008697222222 * T2 + T3 / 56250) % 360;
    const M = (357.527723333 + 359.05034 * T + norm360(35640 * T) - 0.0001602777778 * T2 - T3 / 300000) % 360;
    const F = (93.271910277 + 82.017538055 * T + norm360(483120 * T) - 0.0036825 * T2 + T3 / 327272.7273) % 360;
    const D = (297.850363055 + 307.11148 * T + norm360(444960 * T) - 0.001914166667 * T2 + T3 / 189473.6842) % 360;
    const Omega = (125.044522222 - 134.136260833 * T - norm360(1800 * T) + 0.002070833333 * T2 + T3 / 450000) % 360;

    // Abbreviated terms (top 10 principal terms)
    const terms = [
        [0, 0, 0, 0, 1, -171996, -174.2, 92025, 8.9],
        [0, 0, 2, -2, 2, -13187, -1.6, 5736, -3.1],
        [0, 0, 2, 0, 2, -2274, -0.2, 977, -0.5],
        [0, 0, 0, 0, 2, 2062, 0.2, -895, 0.5],
        [0, -1, 0, 0, 0, -1426, 3.4, 54, -0.1],
        [1, 0, 0, 0, 0, 712, 0.1, -7, 0.0],
        [0, 1, 2, -2, 2, -517, 1.2, 224, -0.6],
        [0, 0, 2, 0, 1, -386, -0.4, 200, 0.0],
        [1, 0, 2, 0, 2, -301, 0.0, 129, -0.1],
        [0, -1, 2, -2, 2, 217, -0.5, -95, 0.3]
    ];

    let dp = 0;
    let de = 0;

    for (const [fMm, fM, fF, fD, fOm, t1, t2, t3, t4] of terms) {
        const arg = (fD * D + fM * M + fMm * Mm + fF * F + fOm * Omega) * D2R;
        dp += (t1 + T * t2) * Math.sin(arg);
        de += (t3 + T * t4) * Math.cos(arg);
    }

    const deltaPsi = dp / 36000000;
    const deltaEps = de / 36000000;
    const eps0 = (84381.448 - 46.815 * T - 0.00059 * T2 + 0.001813 * T3) / 3600;
    const epsTrue = eps0 + deltaEps;

    return { deltaPsi, deltaEps, eps0, epsTrue };
}

/**
 * GHA of Aries (Greenwich Apparent Sidereal Time).
 */
export function getGHAAries(jd: number, deltaPsi: number, epsTrue: number) {
    const T = (jd - 2451545.0) / 36525.0;
    const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000;
    const gast = norm360(gmst + deltaPsi * Math.cos(epsTrue * D2R));
    return gast;
}

/**
 * Equatorial to Horizontal conversion.
 * Returns { altitude, azimuth }.
 */
export function equatorialToHorizontal(ra: number, dec: number, ghaAries: number, lon: number, lat: number) {
    const ghaBody = norm360(ghaAries - ra);
    const lha = norm360(ghaBody + lon);

    const latRad = lat * D2R;
    const decRad = dec * D2R;
    const lhaRad = lha * D2R;

    const sinAlt = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(lhaRad);
    const alt = Math.asin(sinAlt) * R2D;

    const y = -Math.sin(lhaRad);
    const x = Math.tan(decRad) * Math.cos(latRad) - Math.sin(latRad) * Math.cos(lhaRad);
    let az = Math.atan2(y, x) * R2D;
    az = norm360(az);

    return { alt, az, lha, ghaBody };
}

/**
 * Calculates the Qibla bearing from North (clockwise).
 * Kaaba coordinates: 21.42252° N, 39.82618° E.
 */
export function calculateQibla(lat: number, lon: number): number {
    const latK = 21.42252 * D2R;
    const lonK = 39.82618 * D2R;
    const phi = lat * D2R;
    const lambda = lon * D2R;

    const y = Math.sin(lonK - lambda);
    const x = Math.cos(phi) * Math.tan(latK) - Math.sin(phi) * Math.cos(lonK - lambda);
    let qibla = Math.atan2(y, x) * R2D;
    
    return norm360(qibla);
}
