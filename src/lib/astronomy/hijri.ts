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
  let day = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();

  if (month < 2) {
    year -= 1;
    month += 12;
  }

  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524;

  const epoch = jd - 1948440 + adjustment;
  const hYear = Math.floor((epoch - 1) / 354.367);
  const hMonth = Math.floor(((epoch - Math.floor(hYear * 354.367) - 0.5) / 29.5));
  const hDay = Math.floor(epoch - Math.floor(hYear * 354.367) - Math.floor(hMonth * 29.5) + 0.5);

  const finalYear = hYear + 1;
  const finalMonth = hMonth + 1;
  const finalDay = hDay + 1;

  // Manual overflow correction for months
  let adjustedYear = finalYear;
  let adjustedMonth = finalMonth;
  let adjustedDay = finalDay;

  if (adjustedDay > 30) {
    adjustedDay -= 30;
    adjustedMonth += 1;
  }
  
  if (adjustedMonth > 12) {
    adjustedMonth -= 12;
    adjustedYear += 1;
  }

  return {
    day: adjustedDay,
    month: adjustedMonth,
    year: adjustedYear,
    monthName: HIJRI_MONTH_NAMES_URDU[adjustedMonth - 1]
  };
}
