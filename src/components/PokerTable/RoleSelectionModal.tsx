import React from 'react';
import {Eye, UserCheck} from 'lucide-react';

const RoleSelectionModal = ({onSelectRole}) => {
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
			<div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
				<h2 className="text-2xl font-bold mb-2 text-center">Choose Your Role</h2>
				<p className="text-gray-600 mb-6 text-center">
					How would you like to participate in this planning session?
				</p>

				<div className="space-y-3">
					<button
						onClick={() => onSelectRole('voter')}
						className="w-full flex items-center gap-4 p-4 border-2 border-primary bg-primary bg-opacity-5 rounded-lg hover:bg-opacity-10 transition-colors"
					>
						<div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center">
							<UserCheck size={24} />
						</div>
						<div className="flex-1 text-left">
							<h3 className="font-bold text-lg text-gray-900">Voter</h3>
							<p className="text-sm text-gray-600">
								Participate in voting and see results
							</p>
						</div>
					</button>

					<button
						onClick={() => onSelectRole('spectator')}
						className="w-full flex items-center gap-4 p-4 border-2 border-gray-300 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
					>
						<div className="flex-shrink-0 w-12 h-12 bg-gray-500 text-white rounded-full flex items-center justify-center">
							<Eye size={24} />
						</div>
						<div className="flex-1 text-left">
							<h3 className="font-bold text-lg text-gray-900">Spectator</h3>
							<p className="text-sm text-gray-600">
								Watch the session without voting
							</p>
						</div>
					</button>
				</div>

				<p className="text-xs text-gray-500 mt-4 text-center">
					You can change your role anytime during the session
				</p>
			</div>
		</div>
	);
};

export default RoleSelectionModal;
