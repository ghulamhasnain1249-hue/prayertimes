import { Qibla } from 'tauqeet-js';

/**
 * Calculates the Qibla bearing from North (clockwise) using Tauqeet.js.
 */
export function calculateQibla(lat: number, lon: number): number {
    const result = Qibla.calculateQibla({ latitude: lat, longitude: lon });
    return result.bearing;
}
