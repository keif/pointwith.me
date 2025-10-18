import {Button, Container, Divider, Header, Icon, Input, Label} from 'semantic-ui-react';
import React, {useState} from 'react';
import {update} from 'firebase/database';
import {db} from '../../firebase';
import {useParams} from 'react-router-dom';
import {calculateAverage, calculateMode, calculateSuggestedScore} from '../../utils/voteCalculations';

const Controls = ({isLocked, issue, showVotes, votes, finalScore}) => {
	const {userId, tableId} = useParams();
	const [customScore, setCustomScore] = useState('');

	const issueRef = db.pokerTableIssue(
		userId,
		tableId,
		issue
	);

	const handleShow = () => {
		update(issueRef, {'showVotes': !showVotes});
	};

	const handleLock = () => {
		update(issueRef, {'isLocked': !isLocked});
	};

	const handleSetFinalScore = (score) => {
		console.log('Setting final score:', score);
		update(issueRef, {'finalScore': score})
			.then(() => {
				console.log('Final score set successfully');
				setCustomScore('');
			})
			.catch((error) => {
				console.error('Error setting final score:', error);
				alert('Error setting final score: ' + error.message);
			});
	};

	const handleClearFinalScore = () => {
		console.log('Clearing final score');
		update(issueRef, {'finalScore': null})
			.then(() => console.log('Final score cleared'))
			.catch((error) => {
				console.error('Error clearing final score:', error);
				alert('Error clearing final score: ' + error.message);
			});
	};

	const average = calculateAverage(votes);
	const suggestedScore = calculateSuggestedScore(votes);
	const mode = calculateMode(votes);

	return (
		<Container id="voteControls" textAlign="center">
			<Button
				positive
				toggle
				active={showVotes}
				onClick={handleShow}
			>
				<Icon
					name={(showVotes) ? 'eye slash' : 'eye'}
					size="large"/>
				{`${showVotes ? 'Hide' : 'Show'}`} Votes
			</Button>
			<Button
				negative
				toggle
				active={isLocked}
				onClick={handleLock}
			>
				<Icon
					name={(isLocked) ? 'unlock' : 'lock'}
					size="large"/>
				{`${isLocked ? 'Unlock' : 'Lock'}`} Voting
			</Button>

			{votes && votes.length > 0 && showVotes && (
				<>
					<Divider horizontal/>
					<Container textAlign="center" style={{marginBottom: '1em'}}>
						<Label.Group size="large">
							<Label>
								Average
								<Label.Detail>{average.toFixed(2)}</Label.Detail>
							</Label>
							<Label color="blue">
								Suggested (Prime)
								<Label.Detail>{suggestedScore}</Label.Detail>
							</Label>
							{mode !== null && (
								<Label color="green">
									Mode
									<Label.Detail>{mode}</Label.Detail>
								</Label>
							)}
						</Label.Group>
					</Container>

					<Container textAlign="center">
						{finalScore !== null && finalScore !== undefined ? (
							<>
								<Header as="h3" color="teal">
									<Icon name="check circle"/>
									Final Score: {finalScore}
								</Header>
								<Button
									size="small"
									color="red"
									basic
									onClick={handleClearFinalScore}
								>
									Clear Final Score
								</Button>
							</>
						) : (
							<>
								<Header as="h4">Set Final Score</Header>
								<div style={{marginBottom: '1em'}}>
									<Button
										color="teal"
										size="large"
										onClick={() => handleSetFinalScore(suggestedScore)}
									>
										<Icon name="check"/>
										Use Suggested ({suggestedScore})
									</Button>
								</div>
								<div>
									<Input
										type="number"
										placeholder="Enter custom score..."
										value={customScore}
										onChange={(e) => setCustomScore(e.target.value)}
										style={{marginRight: '0.5em'}}
									/>
									<Button
										color="blue"
										disabled={!customScore || customScore === ''}
										onClick={() => handleSetFinalScore(parseFloat(customScore))}
									>
										<Icon name="save"/>
										Set Custom Score
									</Button>
								</div>
							</>
						)}
					</Container>
				</>
			)}

			<Divider horizontal/>
		</Container>
	);
};

export default Controls;