import React, {useEffect, useState} from 'react';
import {Box, Newline, Text} from 'ink';
import {deleteArtifact, ExpiredArtifacts, getUnexpArtifacts} from './gh.svc.js';
import Table from './Table.js';
import prettyBytes from 'pretty-bytes';
import {ConfirmInput, Spinner, StatusMessage} from '@inkjs/ui';

type Props = {
	owner: string | undefined;
	repo: string | undefined;
};

export default function App({owner, repo}: Props) {
	const [unexpArtifacts, setUnexpArtifacts] = useState<ExpiredArtifacts>([]);
	const [deletingArtifacts, setDeletingArtifacts] = useState<
		'PRISTINE' | 'DELETING' | 'DONE'
	>('PRISTINE');

	useEffect(() => {
		async function run() {
			if (owner && repo) {
				const artifacts = await getUnexpArtifacts({owner, repo});

				setUnexpArtifacts(artifacts);
			}
		}

		run();
	}, [owner, repo]);

	if (!unexpArtifacts) {
		return <></>;
	}

	const formattedArtifacts = formatArtifactsToTable(unexpArtifacts);
	return (
		<>
			<Box margin={2}>
				<Table data={formattedArtifacts} />
			</Box>

			<Box>
				<Text>
					Num: {formattedArtifacts.length}
					<Newline />
					Total:{' '}
					{prettyBytes(
						unexpArtifacts.reduce((total, curr) => {
							return total + curr.size_in_bytes;
						}, 0),
					)}
				</Text>
			</Box>

			<Box>
				<Text>
					Delete all? (It may take a while to reflect) <Newline />
				</Text>
				{deletingArtifacts == 'DELETING' ? <Spinner label="Deleting" /> : ''}

				{deletingArtifacts === 'PRISTINE' && (
					<ConfirmInput
						onConfirm={async () => {
							setDeletingArtifacts('DELETING');
							if (owner && repo) {
								for (let art of formattedArtifacts) {
									await deleteArtifact({artifact_id: art.id, owner, repo});
								}
							}
							setDeletingArtifacts('DONE');
						}}
						onCancel={() => {
							console.log('cancel');
						}}
					/>
				)}

				{deletingArtifacts === 'DONE' && (
					<StatusMessage variant="success">Deleted all artifacts</StatusMessage>
				)}
			</Box>
		</>
	);
}

function formatArtifactsToTable(artifacts: ExpiredArtifacts) {
	return artifacts.map(a => ({
		id: a.id,
		name: a.name,
		created_at: a.created_at,
		expires_at: a.expires_at,
		size_in_bytes: prettyBytes(a.size_in_bytes),
	}));
}
