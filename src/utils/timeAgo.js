import {format, formatDistanceToNow} from 'date-fns';

/**
 * Formats a timestamp to show either relative time (< 24h) or absolute date/time (>= 24h)
 *
 * @param {string} timestamp - ISO 8601 timestamp
 * @returns {string} - Formatted time string
 */
export const formatEditTime = (timestamp) => {
    if (!timestamp) return '';

    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return '';

        const now = new Date();
        const hoursDiff = (now - date) / (1000 * 60 * 60);

        // If less than 24 hours ago, show relative time
        if (hoursDiff < 24) {
            return formatDistanceToNow(date, { addSuffix: true });
        }

        // Otherwise show absolute date/time
        return format(date, 'MMM d, yyyy • h:mm a');
    } catch (e) {
        return '';
    }
};

/**
 * Formats edit history metadata for display
 *
 * @param {Object} options
 * @param {string} options.lastEditedByName - Name of the person who edited
 * @param {string} options.lastEdited - ISO 8601 timestamp of last edit
 * @returns {string} - Formatted edit history string
 */
export const formatEditHistory = ({ lastEditedByName, lastEdited }) => {
    if (!lastEditedByName || !lastEdited) return '';

    const timeStr = formatEditTime(lastEdited);
    if (!timeStr) return '';

    return `Edited by ${lastEditedByName} • ${timeStr}`;
};
