import {Home} from 'lucide-react';
import IssueNameForm from './IssueNameForm';
import React from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {auth, db} from '../../firebase';
import shortid from 'shortid';
import {set} from 'firebase/database';
import {format} from 'date-fns';

const IssueCreator = ({onClick, tableName, ownerName, created}) => {
    const navigate = useNavigate();
    const {userId, tableId} = useParams();
    const currentUser = auth.auth.currentUser;

    if (userId !== currentUser.uid) {
        return (
            <div>
                <h1 className="text-3xl font-bold mb-2">{tableName}</h1>
                {ownerName && (
                    <p className="text-sm text-gray-600 mb-1">Owner: <span className="font-medium">{ownerName}</span></p>
                )}
                {created && (
                    <p className="text-sm text-gray-500 mb-4">
                        Created: {(() => {
                            try {
                                const date = new Date(created);
                                return isNaN(date.getTime()) ? 'Unknown' : format(date, 'MM/dd/yyyy hh:mm a');
                            } catch (e) {
                                return 'Unknown';
                            }
                        })()}
                    </p>
                )}
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
            <h1 className="text-3xl font-bold mb-2">{tableName}</h1>
            {ownerName && (
                <p className="text-sm text-gray-600 mb-1">Owner: <span className="font-medium">{ownerName}</span></p>
            )}
            {created && (
                <p className="text-sm text-gray-500 mb-4">
                    Created: {(() => {
                        try {
                            const date = new Date(created);
                            return isNaN(date.getTime()) ? 'Unknown' : format(date, 'MM/dd/yyyy hh:mm a');
                        } catch (e) {
                            return 'Unknown';
                        }
                    })()}
                </p>
            )}
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