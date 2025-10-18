/**
 * Check if a number is prime
 * @param {number} num - The number to check
 * @returns {boolean} - True if prime, false otherwise
 */
export const isPrime = (num) => {
    if (num <= 1) return false;
    if (num === 2) return true;
    if (num % 2 === 0) return false;

    for (let i = 3; i <= Math.sqrt(num); i += 2) {
        if (num % i === 0) return false;
    }
    return true;
};

/**
 * Find the nearest prime number to a given number
 * @param {number} num - The number to round
 * @returns {number} - The nearest prime number
 */
export const nearestPrime = (num) => {
    if (num <= 2) return 2;

    const rounded = Math.round(num);

    // Check if the rounded number itself is prime
    if (isPrime(rounded)) return rounded;

    // Search outward from the rounded number
    let lower = rounded - 1;
    let upper = rounded + 1;

    while (lower > 1 || upper < 1000) {
        if (lower > 1 && isPrime(lower)) return lower;
        if (isPrime(upper)) return upper;
        lower--;
        upper++;
    }

    // Fallback (should never reach here for reasonable numbers)
    return rounded;
};

/**
 * Generate list of prime numbers up to a maximum value
 * @param {number} max - The maximum value
 * @returns {number[]} - Array of prime numbers
 */
export const generatePrimes = (max) => {
    const primes = [];
    for (let i = 2; i <= max; i++) {
        if (isPrime(i)) {
            primes.push(i);
        }
    }
    return primes;
};

/**
 * Common planning poker prime numbers (up to 89)
 */
export const planningPokerPrimes = [0, 1, 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89];
