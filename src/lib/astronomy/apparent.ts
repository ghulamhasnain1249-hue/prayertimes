/**
 * High-level apparent position functions for UI display.
 */

import { getJulianDate, getDeltaT, getCenturiesSinceJ2000 } from "./time";
import { getSunPosition, getMoonPosition } from "./ephemeris";
import { getNutation, getGHAAries, equatorialToHorizontal } from "./coordinates";

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

export function getApparentSunData(date: Date, lat: number, lon: number) {
    const jd = getJulianDate(date);
    const dt = getDeltaT(date.getUTCFullYear());
    const jde = jd + dt / 86400;
    const je = getCenturiesSinceJ2000(jde);

    const sunGeo = getSunPosition(je);
    const nut = getNutation(je);

    // Apparent longitude
    const lambdaApp = (sunGeo.lon + nut.deltaPsi - 0.005691611 / sunGeo.dist);
    const eps = nut.epsTrue;

    const ra = Math.atan2(Math.sin(lambdaApp * D2R) * Math.cos(eps * D2R), Math.cos(lambdaApp * D2R)) * R2D;
    const dec = Math.asin(Math.sin(lambdaApp * D2R) * Math.sin(eps * D2R)) * R2D;

    const ghaAries = getGHAAries(jd, nut.deltaPsi, nut.epsTrue);
    const horiz = equatorialToHorizontal(ra, dec, ghaAries, lon, lat);

    const dayFraction = (jd + 0.5) - Math.floor(jd + 0.5);
    const ghaSun = (ghaAries - ra + 360) % 360;
    let eot = (4 * ghaSun + 720 - 1440 * dayFraction) / 60;
    if (eot > 20/60) eot -= 24;
    if (eot < -20/60) eot += 24;

    return {
        ra, dec, eot,
        alt: horiz.alt,
        az: horiz.az,
        gha: ghaSun,
        lha: horiz.lha,
        sha: (360 - ra) % 360,
        dist: sunGeo.dist * 149597870.7, // km
        sd: (959.63 / sunGeo.dist) / 3600,
        hp: (8.794 / sunGeo.dist) / 3600,
        ghaAries
    };
}

export function getApparentMoonData(date: Date, lat: number, lon: number) {
    const jd = getJulianDate(date);
    const dt = getDeltaT(date.getUTCFullYear());
    const jde = jd + dt / 86400;
    const je = getCenturiesSinceJ2000(jde);

    const moonGeo = getMoonPosition(je);
    const nut = getNutation(je);
    const eps = nut.epsTrue;

    // Simplified apparent for UI
    const lambdaApp = moonGeo.lon + nut.deltaPsi;
    const beta = moonGeo.lat;

    const ra = Math.atan2(Math.sin(lambdaApp * D2R) * Math.cos(eps * D2R) - Math.tan(beta * D2R) * Math.sin(eps * D2R), Math.cos(lambdaApp * D2R)) * R2D;
    const dec = Math.asin(Math.sin(beta * D2R) * Math.cos(eps * D2R) + Math.cos(beta * D2R) * Math.sin(eps * D2R) * Math.sin(lambdaApp * D2R)) * R2D;

    const ghaAries = getGHAAries(jd, nut.deltaPsi, nut.epsTrue);
    const horiz = equatorialToHorizontal(ra, dec, ghaAries, lon, lat);

    return {
        ra, dec,
        alt: horiz.alt,
        az: horiz.az,
        gha: (ghaAries - ra + 360) % 360,
        lha: horiz.lha,
        sha: (360 - ra) % 360,
        dist: moonGeo.dist,
        sd: (3600 * Math.asin(1738 / moonGeo.dist) / D2R) / 3600,
        hp: (3600 * Math.asin(6378.14 / moonGeo.dist) / D2R) / 3600,
        ghaAries
    };
}
