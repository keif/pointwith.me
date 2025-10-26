import { roundUpToPrime } from './primes';
import type { Vote } from '../types';

/**
 * Calculate the average of all votes
 * @param votes - Array of vote objects with {vote: number}
 * @returns The average vote value
 */
export const calculateAverage = (votes: Vote[]): number => {
    if (!votes || votes.length === 0) return 0;

    const validVotes = votes.filter(v => v.vote !== null && v.vote !== undefined && !isNaN(v.vote));

    if (validVotes.length === 0) return 0;

    const total = validVotes.reduce((sum, v) => sum + parseFloat(String(v.vote)), 0);
    return total / validVotes.length;
};

/**
 * Calculate suggested final score (average rounded UP to nearest prime)
 * Returns 0 if average < 0.3, otherwise rounds up to next prime number
 * @param votes - Array of vote objects
 * @returns Suggested final score
 */
export const calculateSuggestedScore = (votes: Vote[]): number => {
    const average = calculateAverage(votes);
    return roundUpToPrime(average);
};

/**
 * Find the mode (most common vote value)
 * @param votes - Array of vote objects
 * @returns The mode value, or null if multiple modes or no votes
 */
export const calculateMode = (votes: Vote[]): number | null => {
    if (!votes || votes.length === 0) return null;

    const voteTally = votes.reduce((acc, curr) => {
        const vote = curr.vote ?? 'null';
        if (vote in acc) {
            acc[vote]++;
        } else {
            acc[vote] = 1;
        }
        return acc;
    }, {} as Record<string | number, number>);

    let mostVotes = -1;
    let multipleModes = false;

    for (let points in voteTally) {
        let currentMostVotes = voteTally[mostVotes] || 0;
        if (voteTally[points] === currentMostVotes) {
            multipleModes = true;
        } else if (voteTally[points] >= currentMostVotes) {
            mostVotes = parseInt(points, 10);
            multipleModes = false;
        }
    }

    return multipleModes ? null : mostVotes;
};
