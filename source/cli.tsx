#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';

const cli = meow(
	`
	Usage
	  $ github-expire-artifacts

	Options
		--owner
		--repo

	Examples
	  $ github-expire-artifacts --owner=OWNER --repo=REPO
`,
	{
		importMeta: import.meta,
		flags: {
			owner: {
				type: 'string',
			},
			repo: {
				type: 'string',
			},
		},
	},
);

render(<App owner={cli.flags.owner} repo={cli.flags.repo} />);
