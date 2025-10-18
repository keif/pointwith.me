import {Home} from 'lucide-react';
import IssueNameForm from './IssueNameForm';
import React from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {auth, db} from '../../firebase';
import shortid from 'shortid';
import {set} from 'firebase/database';

const IssueCreator = ({onClick, tableName}) => {
    const navigate = useNavigate();
    const {userId, tableId} = useParams();
    const currentUser = auth.auth.currentUser;

    if (userId !== currentUser.uid) {
        return (
            <div>
                <h1 className="text-3xl font-bold mb-4">{tableName}</h1>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-primary hover:underline flex items-center gap-2 text-sm"
                >
                    <Home size={16} />
                    Return to Lobby
                </button>
            </div>
        );
    }
    return (
        <>
            <h1 className="text-3xl font-bold mb-4">{tableName}</h1>
            <button
                onClick={() => navigate('/dashboard')}
                className="text-primary hover:underline flex items-center gap-2 text-sm mb-4"
            >
                <Home size={16} />
                Return to Lobby
            </button>
            <p className="text-gray-600 mb-4">
                Copy this table's URL to share with your team for a pointing session
            </p>
            <IssueNameForm handleIssueSubmit={onClick}/>
        </>
    );
};

export default IssueCreator;