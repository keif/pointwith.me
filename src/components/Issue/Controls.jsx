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
		update(issueRef, {'finalScore': score});
		setCustomScore('');
	};

	const handleClearFinalScore = () => {
		update(issueRef, {'finalScore': null});
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
								<Button.Group>
									<Button
										color="teal"
										onClick={() => handleSetFinalScore(suggestedScore)}
									>
										Use Suggested ({suggestedScore})
									</Button>
									<Button.Or/>
									<Input
										type="number"
										placeholder="Custom..."
										value={customScore}
										onChange={(e) => setCustomScore(e.target.value)}
										action={
											<Button
												color="blue"
												disabled={!customScore}
												onClick={() => handleSetFinalScore(parseFloat(customScore))}
											>
												Set
											</Button>
										}
									/>
								</Button.Group>
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