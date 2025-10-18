import React, {useState} from 'react';

const IssueNameForm = ({ handleIssueSubmit }) => {
    const [newIssueName, setNewIssueName] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        handleIssueSubmit(newIssueName);
        setNewIssueName('');
    }
    return (
        <form name='issue-name-form' onSubmit={handleSubmit}>
            <div>
                <label htmlFor="issueName" className="block text-sm font-medium text-gray-700 mb-1">
                    Open Issues
                </label>
                <input
                    id="issueName"
                    type="text"
                    placeholder="New Issue Name"
                    value={newIssueName}
                    onChange={(e) => setNewIssueName(e.target.value)}
                    className="input w-full"
                />
            </div>
        </form>
    )
}

export default IssueNameForm;