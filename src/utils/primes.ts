/**
 * Check if a number is prime
 * @param num - The number to check
 * @returns True if prime, false otherwise
 */
export const isPrime = (num: number): boolean => {
    if (num <= 1) return false;
    if (num === 2) return true;
    if (num % 2 === 0) return false;

    for (let i = 3; i <= Math.sqrt(num); i += 2) {
        if (num % i === 0) return false;
    }
    return true;
};

/**
 * Round to prime number with custom rounding logic
 * - Decimal <= 0.2: round down (e.g., 4.2 -> 4)
 * - Decimal >= 0.3: round up (e.g., 4.3 -> 5)
 * - Then find next prime >= rounded value
 * @param num - The number to round
 * @returns The next prime number
 */
export const roundUpToPrime = (num: number): number => {
    // Special case: very low values round to 0
    if (num < 0.3) return 0;

    // If less than 2, round up to 2 (first prime)
    if (num < 2) return 2;

    // Custom rounding: decimal <= 0.2 rounds down, >= 0.3 rounds up
    const floor = Math.floor(num);
    const decimal = num - floor;
    const rounded = decimal <= 0.2 ? floor : Math.ceil(num);

    // Find the next prime number >= rounded value
    let candidate = rounded;
    while (candidate < 1000) {
        if (isPrime(candidate)) return candidate;
        candidate++;
    }

    // Fallback (should never reach here for reasonable numbers)
    return rounded;
};

/**
 * Alias for backward compatibility
 * @deprecated Use roundUpToPrime instead
 */
export const nearestPrime = roundUpToPrime;

/**
 * Generate list of prime numbers up to a maximum value
 * @param max - The maximum value
 * @returns Array of prime numbers
 */
export const generatePrimes = (max: number): number[] => {
    const primes: number[] = [];
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
export const planningPokerPrimes: number[] = [0, 1, 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89];
