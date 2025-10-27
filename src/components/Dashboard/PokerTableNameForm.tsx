import React from 'react';

interface PokerTableNameFormProps {
    handlePokerTableSubmit: (name: string) => void;
}

const PokerTableNameForm = ({ handlePokerTableSubmit }: PokerTableNameFormProps) => {
    const [pokerTableName, setPokerTableName] = React.useState('');
    const handleNewPokerTableName = (e: React.ChangeEvent<HTMLInputElement>) => setPokerTableName(e.target.value);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handlePokerTableSubmit(pokerTableName);
        setPokerTableName('');
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h1 className="text-3xl font-bold">Create Poker Table</h1>
            <div>
                <label htmlFor="tableName" className="block text-sm font-medium text-gray-700 mb-1">
                    Poker Table Name
                </label>
                <input
                    id="tableName"
                    type="text"
                    placeholder="New Poker Table Name"
                    value={pokerTableName}
                    onChange={handleNewPokerTableName}
                    className="input w-full"
                />
            </div>
            <button type="submit" className="btn btn-primary">
                Create Poker Table
            </button>
        </form>
    )
}

export default PokerTableNameForm;