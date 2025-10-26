import React, {useState} from 'react';
import {Plus} from 'lucide-react';

const IssueNameForm = ({ handleIssueSubmit }) => {
    const [newIssueName, setNewIssueName] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (newIssueName.trim()) {
            handleIssueSubmit(newIssueName);
            setNewIssueName('');
        }
    }
    return (
        <form name='issue-name-form' onSubmit={handleSubmit}>
            <div>
                <label htmlFor="issueName" className="block text-sm font-medium text-gray-700 mb-2">
                    Open Issues
                </label>
                <div className="flex gap-2">
                    <input
                        id="issueName"
                        type="text"
                        placeholder="New Issue Name"
                        value={newIssueName}
                        onChange={(e) => setNewIssueName(e.target.value)}
                        className="input flex-1"
                    />
                    <button
                        type="submit"
                        disabled={!newIssueName.trim()}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Issue
                    </button>
                </div>
            </div>
        </form>
    )
}

export default IssueNameForm;