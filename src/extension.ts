// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, ExtensionContext, StatusBarAlignment, StatusBarItem, workspace } from 'vscode';
const find = require('find-process');
const pidusage = require('pidusage');
const os = require('os');

export function activate(context: ExtensionContext) {
	context.subscriptions.push(new VSMemory());
}

class VSMemory {
	private _totalMemory: any = os.totalmem();
	private _statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right);

	constructor() {
		this.update(this._statusBarItem);
		this._statusBarItem.show();
	}

	private update(statusBarItem: StatusBarItem) {
		const config = workspace.getConfiguration('vscodemem');
		// `Visual` is used because `Code` isnt listed
		return find('name', 'Visual', true)
			.then((list: any[]) => {
				const pids = list.map(item => item && item.pid);
				pidusage(pids, (err: Error, stats: any[]) => {
					if (err) {
						console.log(err);
						return;
					}
					const totalBytes = Object.keys(stats).reduce((prev: any, key: any) => {
						return prev + stats[key].memory;
					}, 0);
					const totalGB: any = ((totalBytes / 1e+9).toFixed(2));
					const totalFree: any = ((this._totalMemory - os.freemem()) / 1e+9).toFixed(2);
					const difference: any = (totalFree - totalGB);

					statusBarItem.text = `${difference < (totalGB - 3) ? `$(alert)` : ''} ${totalGB} of ${totalFree} GB`;
					setTimeout(() => this.update(statusBarItem), config.get('frequency', 2000));
				});
			});
	}

	dispose() {
		this._statusBarItem.dispose();
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
