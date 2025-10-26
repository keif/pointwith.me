import {Home, Edit2, Check, X} from 'lucide-react';
import IssueNameForm from './IssueNameForm';
import React, {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {auth, db} from '../../firebase';
import shortid from 'shortid';
import {set, update} from 'firebase/database';
import {format} from 'date-fns';
import toast from 'react-hot-toast';
import {formatEditHistory} from '../../utils/timeAgo';

const IssueCreator = ({onClick, tableName, ownerName, created, lastEdited, lastEditedByName}) => {
    const navigate = useNavigate();
    const {userId, tableId} = useParams();
    const currentUser = auth.auth.currentUser;
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(tableName);
    const isOwner = userId === currentUser.uid;

    const handleStartEdit = () => {
        setEditedName(tableName);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setEditedName(tableName);
        setIsEditing(false);
    };

    const handleSaveEdit = () => {
        const trimmedName = editedName.trim();
        if (!trimmedName) {
            toast.error('Table name cannot be empty');
            return;
        }
        if (trimmedName.length > 100) {
            toast.error('Table name must be 100 characters or less');
            return;
        }

        const pokerTableRef = db.pokerTable(userId, tableId);
        const updateData = {
            tableName: trimmedName,
            lastEdited: new Date().toISOString(),
            lastEditedBy: currentUser.uid,
            lastEditedByName: currentUser.displayName || 'Anonymous',
        };

        toast.promise(
            update(pokerTableRef, updateData),
            {
                loading: 'Updating table name...',
                success: 'Table name updated',
                error: 'Failed to update table name',
            }
        ).then(() => {
            setIsEditing(false);
        }).catch(() => {
            setEditedName(tableName);
        });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

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
            <div className="mb-2">
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="text-3xl font-bold border-2 border-primary rounded px-2 py-1 flex-1"
                            autoFocus
                            maxLength={100}
                        />
                        <button
                            onClick={handleSaveEdit}
                            className="p-2 bg-success text-white rounded hover:bg-green-600 transition-colors"
                            title="Save"
                        >
                            <Check size={20} />
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            className="p-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
                            title="Cancel"
                        >
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 group">
                            <h1 className="text-3xl font-bold">{tableName}</h1>
                            <button
                                onClick={handleStartEdit}
                                className="p-1 text-gray-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                                title="Edit table name"
                            >
                                <Edit2 size={20} />
                            </button>
                        </div>
                        {lastEdited && lastEditedByName && (
                            <p className="text-xs text-gray-400 italic mt-1">
                                {formatEditHistory({ lastEditedByName, lastEdited })}
                            </p>
                        )}
                    </div>
                )}
            </div>
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