import {X, ChevronRight} from 'lucide-react';
import React from 'react';

const ModalActions = ({nextIssue, onClose, onNext}) => {
	return (
		<div id="modalControl" className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between gap-4">
			<button onClick={onClose} className="btn btn-danger flex items-center gap-2">
				<X size={16} />
				Close
			</button>
			<button
				onClick={() => onNext(nextIssue)}
				disabled={!nextIssue}
				className="btn btn-success flex items-center gap-2"
			>
				Next
				<ChevronRight size={16} />
			</button>
		</div>
	);
}

export default ModalActions;