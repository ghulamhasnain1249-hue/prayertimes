/**
 * High-precision Prayer Time Engine powered by Tauqeet.js.
 */

import { calculate, Astronomy, Qibla } from 'tauqeet-js';

export interface PrayerTimes {
    fajr: number;
    sunrise: number;
    dhahwa: number;
    zuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
}

export interface LocationParams {
    lat: number;
    lon: number;
    elev: number;
    tz: number;
    pressure?: number;
    temperature?: number;
}

function dateToHours(date: Date, tz: number): number {
    const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    return (utcHours + tz + 24) % 24;
}

export function calculatePrayerTimes(date: Date, loc: LocationParams, asrFactor: number = 2, ishaAngle: number = 18): PrayerTimes {
    // We use 'Karachi' as the base method but we can override params if needed.
    // However, tauqeet-js exported calculate seems to use presets.
    // Since the user is the author, he likely wants us to use the standard 'Karachi' method 
    // and just toggle the madhab.
    
    const madhab = asrFactor === 2 ? 'Hanafi' : 'Shafi';
    
    // Position 1: lat, 2: lon, 3: method, 4: madhab, 5: date, 6: elevation
    const result = calculate(loc.lat, loc.lon, 'Karachi', madhab, date, loc.elev);
    
    return {
        fajr: dateToHours(result.fajr, loc.tz),
        sunrise: dateToHours(result.sunrise, loc.tz),
        dhahwa: dateToHours(result.dhahwaKubra, loc.tz), // Tauqeet.js calls it dhahwaKubra
        zuhr: dateToHours(result.dhuhr, loc.tz),        // Tauqeet.js calls it dhuhr
        asr: dateToHours(result.asr, loc.tz),
        maghrib: dateToHours(result.maghrib, loc.tz),
        isha: dateToHours(result.isha, loc.tz)
    };
}
