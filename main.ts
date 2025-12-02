import { Plugin, WorkspaceLeaf, Notice, TFile, TFolder, ItemView } from 'obsidian';
import { categorizeNote } from './src/categorize';
import { summarizeFolder } from './src/summarize';
import { analyzePattern } from './src/analyze';
import { answerQuestion } from './src/qa';
import { generateVaultReport } from './src/batch';

const VIEW_TYPE_AI_ASSISTANT = 'ai-assistant-view';

// Side panel view class
class AIAssistantView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_AI_ASSISTANT;
	}

	getDisplayText() {
		return 'AI Assistant';
	}

	getIcon() {
		return 'brain-circuit';
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		container.addClass('ai-assistant-view');
		
		container.createEl('h4', { text: 'AI Life Assistant' });
		container.createEl('p', { text: 'Your AI-powered command center' });
	}

	async onClose() {
		// Cleanup if needed
	}
}

export default class AILifeAssistantPlugin extends Plugin {
	async onload() {
		console.log('Loading AI Life Assistant plugin');

		// Command 1: Categorize Current Note
		this.addCommand({
			id: 'categorize-note',
			name: 'Categorize Current Note',
			callback: async () => {
				const file = this.app.workspace.getActiveFile();
				if (!file) {
					new Notice('No active file');
					return;
				}

				try {
					new Notice('Categorizing note...');
					const content = await this.app.vault.read(file);
					const category = await categorizeNote(content);
					new Notice(`Category: ${category}`);
				} catch (error) {
					new Notice(`Error: ${error.message}`);
					console.error(error);
				}
			}
		});

		// Command 2: Summarize Current Folder
		this.addCommand({
			id: 'summarize-folder',
			name: 'Summarize Current Folder',
			callback: async () => {
				const file = this.app.workspace.getActiveFile();
				if (!file) {
					new Notice('No active file');
					return;
				}

				const folder = file.parent;
				if (!folder) {
					new Notice('File is not in a folder');
					return;
				}

				try {
					new Notice('Summarizing folder...');
					const folderPath = (folder as TFolder).path;
					const vaultPath = (this.app.vault.adapter as any).basePath;
					const fullPath = `${vaultPath}/${folderPath}`;
					
					const summary = await summarizeFolder(fullPath);
					new Notice(`Summary: ${summary.summary.substring(0, 100)}...`);
					console.log('Full summary:', summary);
				} catch (error) {
					new Notice(`Error: ${error.message}`);
					console.error(error);
				}
			}
		});

		// Command 3: Analyze Pattern in Vault
		this.addCommand({
			id: 'analyze-pattern',
			name: 'Analyze Pattern in Vault',
			callback: async () => {
				const keyword = await this.promptForInput('Enter keyword to analyze:');
				if (!keyword) return;

				try {
					new Notice(`Analyzing pattern: ${keyword}...`);
					const vaultPath = (this.app.vault.adapter as any).basePath;
					const analysis = await analyzePattern(vaultPath, keyword, true);
					
					new Notice(`Found ${analysis.totalMentions} mentions in ${analysis.notesWithKeyword} files`);
					console.log('Full analysis:', analysis);
				} catch (error) {
					new Notice(`Error: ${error.message}`);
					console.error(error);
				}
			}
		});

		// Command 4: Ask Question About Vault
		this.addCommand({
			id: 'ask-question',
			name: 'Ask Question About Vault',
			callback: async () => {
				const question = await this.promptForInput('Ask a question about your vault:');
				if (!question) return;

				try {
					new Notice('Searching vault for answer...');
					const vaultPath = (this.app.vault.adapter as any).basePath;
					const result = await answerQuestion(question, vaultPath, 20);
					
					new Notice(`Answer: ${result.answer.substring(0, 100)}...`);
					console.log('Full answer:', result);
				} catch (error) {
					new Notice(`Error: ${error.message}`);
					console.error(error);
				}
			}
		});

		// Command 5: Generate Vault Report
		this.addCommand({
			id: 'generate-report',
			name: 'Generate Vault Report',
			callback: async () => {
				try {
					new Notice('Generating vault report (this may take a minute)...');
					const vaultPath = (this.app.vault.adapter as any).basePath;
					const report = await generateVaultReport(vaultPath);
					
					new Notice(`Report generated! Total notes: ${report.totalNotes}`);
					console.log('Full report:', report);
				} catch (error) {
					new Notice(`Error: ${error.message}`);
					console.error(error);
				}
			}
		});

		// Register the view
		this.registerView(
			VIEW_TYPE_AI_ASSISTANT,
			(leaf) => new AIAssistantView(leaf)
		);

		// Add ribbon icon
		this.addRibbonIcon('brain-circuit', 'AI Assistant', (evt: MouseEvent) => {
			this.activateView();
		});
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_AI_ASSISTANT);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			const rightLeaf = workspace.getRightLeaf(false);
			if (rightLeaf) {
				leaf = rightLeaf;
				await leaf.setViewState({ type: VIEW_TYPE_AI_ASSISTANT, active: true });
			}
		}

		// Reveal the leaf in case it is in a collapsed sidebar
		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	onunload() {
		console.log('Unloading AI Life Assistant plugin');
	}

	// Helper method to prompt user for input
	private async promptForInput(placeholder: string): Promise<string | null> {
		return new Promise((resolve) => {
			const modal = new (require('obsidian').Modal)(this.app);
			modal.titleEl.setText('Input Required');
			
			const inputEl = modal.contentEl.createEl('input', {
				type: 'text',
				placeholder: placeholder
			});
			inputEl.style.width = '100%';
			inputEl.style.marginBottom = '10px';
			
			const buttonEl = modal.contentEl.createEl('button', { text: 'Submit' });
			buttonEl.onclick = () => {
				resolve(inputEl.value);
				modal.close();
			};
			
			modal.onClose = () => resolve(null);
			modal.open();
			inputEl.focus();
		});
	}
}
