import { format, formatDistanceToNow } from 'date-fns';

/**
 * Formats a timestamp to show either relative time (< 24h) or absolute date/time (>= 24h)
 *
 * @param timestamp - ISO 8601 timestamp or number (Unix timestamp)
 * @returns Formatted time string
 */
export const formatEditTime = (timestamp: string | number): string => {
    if (!timestamp) return '';

    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return '';

        const now = new Date();
        const hoursDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

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
 * @param options - Edit history options
 * @param options.lastEditedByName - Name of the person who edited
 * @param options.lastEdited - ISO 8601 timestamp of last edit
 * @returns Formatted edit history string
 */
export const formatEditHistory = ({
    lastEditedByName,
    lastEdited
}: {
    lastEditedByName: string;
    lastEdited: string | number;
}): string => {
    if (!lastEditedByName || !lastEdited) return '';

    const timeStr = formatEditTime(lastEdited);
    if (!timeStr) return '';

    return `Edited by ${lastEditedByName} • ${timeStr}`;
};
