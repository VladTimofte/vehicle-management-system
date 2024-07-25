import { DateTime } from 'luxon';

export function documentExpiresWithinMonth(expirationEpochTimeMilliseconds: number): boolean {
    // Get current epoch time in milliseconds
    const currentEpochTime = DateTime.now().toMillis();

    const oneMonthMilliseconds = 2591999423;

    // Calculate the difference in milliseconds between current time and expiration time
    const differenceMilliseconds = expirationEpochTimeMilliseconds - currentEpochTime;

    // Check if the difference is less than one month
    return differenceMilliseconds <= oneMonthMilliseconds;
}

export function documentExpired(expirationEpochTimeMilliseconds: number): boolean {
    // Get current epoch time in milliseconds
    const currentEpochTime = DateTime.now().toMillis();

    // Check if the difference is less than one month
    return expirationEpochTimeMilliseconds <= currentEpochTime;
}