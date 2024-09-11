import {Octokit} from 'octokit';

const token = process.env['GITHUB_ACCESS_TOKEN'];
if (!token || !token.length) {
	throw new Error('Missing ENV GITHUB_ACCESS_TOKEN');
}

// https://github.com/octokit/core.js#readme
const octokit = new Octokit({
	auth: token,
});

export type ExpiredArtifacts = Awaited<ReturnType<typeof getUnexpArtifacts>>;

export async function getUnexpArtifacts({
	owner,
	repo,
}: {
	owner: string;
	repo: string;
}) {
	const res = await octokit.request(
		'GET /repos/{owner}/{repo}/actions/artifacts',
		{
			owner,
			repo,
			headers: {
				'X-GitHub-Api-Version': '2022-11-28',
			},
		},
	);

	return res.data.artifacts.filter(a => !a.expired);
}

export async function deleteArtifact({
	artifact_id,
	owner,
	repo,
}: {
	artifact_id: number;
	owner: string;
	repo: string;
}) {
	await octokit.request(
		'DELETE /repos/{owner}/{repo}/actions/artifacts/{artifact_id}',
		{
			owner,
			repo,
			artifact_id,
			headers: {
				'X-GitHub-Api-Version': '2022-11-28',
			},
		},
	);
}
