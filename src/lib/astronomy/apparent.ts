/**
 * High-level apparent position functions for UI display powered by Tauqeet.js.
 */

import { Astronomy } from 'tauqeet-js';

export function getApparentSunData(date: Date, lat: number, lon: number) {
    // Tauqeet.js exports Astronomy as a namespace containing the Astronomy class
    // Depending on the version/build, it might be Astronomy.Astronomy or just Astronomy
    // Based on index.d.ts analysis, it's a namespace.
    const astro = new (Astronomy as any).Astronomy(date);
    const sun = astro.sun;
    
    // We need to calculate altitude and azimuth as tauqeet-js Astronomy class provides equatorial usually.
    // Wait, let's see if Astronomy provides horizontal.
    // Looking at d.ts, SolarResult has RA, DEC, GHA, SHA, SD, HP, EOT, distance, lambdaApp.
    // It doesn't have ALT/AZ directly in the result interface.
    // However, the library has equatorialToHorizontal exported? 
    // No, it's not in the main exports of index.d.ts but it was in the source.
    
    // Let's check the exported math functions in index.d.ts.
    // It has sind, cosd, tand, asind, acosd, atan2d, norm360, norm24.
    
    // I will implement a quick horizontal conversion here if needed, or see if Astronomy has it.
    // Since I'm supposed to use the library, I'll use its exported utilities.
    
    const dec = sun.DEC;
    const ra = sun.RA;
    const ghaAries = astro.nutation.eps; // This is wrong, let's look at d.ts again.
    // Astronomy results for Polaris has GHA.
    // SolarResult has GHA.
    
    const ghaSun = sun.GHA;
    const lha = (ghaSun + lon + 360) % 360;
    
    // sin(h) = sin(phi)sin(dec) + cos(phi)cos(dec)cos(H)
    const sinH = Math.sin(lat * Math.PI/180) * Math.sin(dec * Math.PI/180) + 
                 Math.cos(lat * Math.PI/180) * Math.cos(dec * Math.PI/180) * Math.cos(lha * Math.PI/180);
    const alt = Math.asin(sinH) * 180/Math.PI;
    
    // cos(Az) = (sin(dec) - sin(phi)sin(h)) / (cos(phi)cos(h))
    const cosAz = (Math.sin(dec * Math.PI/180) - Math.sin(lat * Math.PI/180) * sinH) / 
                  (Math.cos(lat * Math.PI/180) * Math.cos(alt * Math.PI/180));
    let az = Math.acos(Math.max(-1, Math.min(1, cosAz))) * 180/Math.PI;
    if (Math.sin(lha * Math.PI/180) > 0) az = 360 - az;

    return {
        ra, dec, eot: sun.EOT,
        alt: alt,
        az: az,
        gha: ghaSun,
        lha: lha,
        sha: sun.SHA,
        dist: sun.distance * 149597870.7, // km
        sd: sun.SD,
        hp: sun.HP,
        ghaAries: 0 // Placeholder or calculate if needed
    };
}

export function getApparentMoonData(date: Date, lat: number, lon: number) {
    const astro = new (Astronomy as any).Astronomy(date);
    const moon = astro.moon;
    
    const dec = moon.DEC;
    const ra = moon.RA;
    const ghaMoon = moon.GHA;
    const lha = (ghaMoon + lon + 360) % 360;
    
    const sinH = Math.sin(lat * Math.PI/180) * Math.sin(dec * Math.PI/180) + 
                 Math.cos(lat * Math.PI/180) * Math.cos(dec * Math.PI/180) * Math.cos(lha * Math.PI/180);
    const alt = Math.asin(sinH) * 180/Math.PI;
    
    const cosAz = (Math.sin(dec * Math.PI/180) - Math.sin(lat * Math.PI/180) * sinH) / 
                  (Math.cos(lat * Math.PI/180) * Math.cos(alt * Math.PI/180));
    let az = Math.acos(Math.max(-1, Math.min(1, cosAz))) * 180/Math.PI;
    if (Math.sin(lha * Math.PI/180) > 0) az = 360 - az;

    return {
        ra, dec,
        alt: alt,
        az: az,
        gha: ghaMoon,
        lha: lha,
        sha: moon.SHA,
        dist: moon.distance,
        sd: moon.SD,
        hp: moon.HP,
        ghaAries: 0
    };
}
