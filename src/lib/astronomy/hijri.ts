/**
 * Hijri Date Utility
 * Based on the Tabular Islamic Calendar (Kuwaiti algorithm).
 */

export interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
}

const HIJRI_MONTH_NAMES = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Ula", "Jumada al-Akhira", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
];

const HIJRI_MONTH_NAMES_URDU = [
  "Muharram-ul-Haram", "Safar-ul-Muzaffar", "Rabi-ul-Awwal", "Rabi-ul-Sani",
  "Jamadi-ul-Awwal", "Jamadi-ul-Sani", "Rajab-ul-Murajab", "Shaban-ul-Muazzam",
  "Ramadan-ul-Mubarak", "Shawwal-ul-Mukarram", "Zequad", "Zilhaj"
];

/**
 * Converts Gregorian date to Hijri date using the Tabular algorithm.
 * @param date Gregorian date object
 * @param adjustment Manual day adjustment (default: 0)
 */
export function getHijriDate(date: Date, adjustment: number = 0): HijriDate {
  // Use a more robust arithmetic calculation based on the 1948439.5 epoch
  // 17 April 2026 logic test: JD 2461148 -> ~29 Shawwal 1447
  
  const jd = Math.floor(date.getTime() / 86400000) + 2440587.5 + adjustment;
  const epoch = 1948439.5;
  const delta = jd - epoch;
  
  // Average length of Islamic year is 354.36667 days
  const hYear = Math.floor(delta / 354.36667) + 1;
  const daysInPreviousYears = Math.floor((hYear - 1) * 354.36667);
  const dayInYear = Math.floor(delta - daysInPreviousYears);
  
  // Approximation for months (alternating 30 and 29 days)
  let hMonth = 1;
  let remainingDays = dayInYear;
  
  for (let m = 1; m <= 12; m++) {
    const monthLength = (m % 2 === 1) ? 30 : 29;
    if (remainingDays <= monthLength) {
      hMonth = m;
      break;
    }
    remainingDays -= monthLength;
    if (m === 12) {
      // Leap year handling if remainingDays still > 0
      hYear + 1;
      hMonth = 1;
    }
  }
  
  const hDay = remainingDays || 1;

  return {
    day: hDay,
    month: hMonth,
    year: hYear,
    monthName: HIJRI_MONTH_NAMES_URDU[hMonth - 1] || "Unknown"
  };
}
