import { Plugin, WorkspaceLeaf, Notice, TFile, TFolder, ItemView, PluginSettingTab, App, Setting } from 'obsidian';
import { categorizeNote } from './src/categorize';
import { summarizeFolder } from './src/summarize';
import { analyzePattern } from './src/analyze';
import { answerQuestion } from './src/qa';
import { generateVaultReport } from './src/batch';

const VIEW_TYPE_AI_ASSISTANT = 'ai-assistant-view';

interface AIAssistantSettings {
	apiKey: string;
}

const DEFAULT_SETTINGS: AIAssistantSettings = {
	apiKey: ''
}

// Side panel view class
class AIAssistantView extends ItemView {
	private activeTab: string = 'quick-actions';
	private plugin: AILifeAssistantPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: AILifeAssistantPlugin) {
		super(leaf);
		this.plugin = plugin;
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
		
		this.renderTabs(container);
		this.renderTabContent(container);
	}

	private renderTabs(container: Element) {
		const tabsContainer = container.createEl('div', { cls: 'ai-assistant-tabs' });

		const tabs = [
			{ id: 'quick-actions', name: 'Quick Actions' },
			{ id: 'qa', name: 'Q&A' },
			{ id: 'reports', name: 'Reports' }
		];

		tabs.forEach(tab => {
			const tabBtn = tabsContainer.createEl('button', {
				text: tab.name,
				cls: 'ai-assistant-tab'
			});
			
			if (tab.id === this.activeTab) {
				tabBtn.addClass('active');
			}

			tabBtn.onclick = () => {
				this.activeTab = tab.id;
				this.onOpen();
			};
		});
	}

	private renderTabContent(container: Element) {
		const contentContainer = container.createEl('div', { cls: 'ai-assistant-content' });

		if (this.activeTab === 'quick-actions') {
			this.renderQuickActionsTab(contentContainer);
		} else if (this.activeTab === 'qa') {
			this.renderQATab(contentContainer);
		} else if (this.activeTab === 'reports') {
			this.renderReportsTab(contentContainer);
		}
	}

	private renderQuickActionsTab(container: Element) {
		container.createEl('h4', { text: 'Quick Actions' });

		const categorizeBtn = container.createEl('button', {
			text: 'Categorize Current Note',
			cls: 'ai-assistant-button'
		});
		categorizeBtn.onclick = async () => {
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
			}
		};

		const summarizeBtn = container.createEl('button', {
			text: 'Summarize Current Folder',
			cls: 'ai-assistant-button'
		});
		summarizeBtn.onclick = async () => {
			const file = this.app.workspace.getActiveFile();
			if (!file || !file.parent) {
				new Notice('No active file or folder');
				return;
			}
			try {
				new Notice('Summarizing folder...');
				const folderPath = (file.parent as TFolder).path;
				const vaultPath = (this.app.vault.adapter as any).basePath;
				const fullPath = `${vaultPath}/${folderPath}`;
				const summary = await summarizeFolder(fullPath);
				new Notice(`Summary: ${summary.summary.substring(0, 100)}...`);
				console.log('Full summary:', summary);
			} catch (error) {
				new Notice(`Error: ${error.message}`);
			}
		};

		const analyzeBtn = container.createEl('button', {
			text: 'Analyze Pattern',
			cls: 'ai-assistant-button'
		});
		analyzeBtn.onclick = async () => {
			const keyword = prompt('Enter keyword to analyze:');
			if (!keyword) return;
			try {
				new Notice(`Analyzing pattern: ${keyword}...`);
				const vaultPath = (this.app.vault.adapter as any).basePath;
				const analysis = await analyzePattern(vaultPath, keyword, true);
				new Notice(`Found ${analysis.totalMentions} mentions in ${analysis.notesWithKeyword} files`);
				console.log('Full analysis:', analysis);
			} catch (error) {
				new Notice(`Error: ${error.message}`);
			}
		};
	}

	private renderQATab(container: Element) {
		container.createEl('h4', { text: 'Ask Questions' });
		container.createEl('p', { text: 'Ask questions about your vault and get AI-powered answers' });

		const input = container.createEl('input', {
			cls: 'ai-assistant-input',
			attr: { placeholder: 'What would you like to know about your vault?' }
		});

		const submitBtn = container.createEl('button', {
			text: 'Ask Question',
			cls: 'ai-assistant-button'
		});

		const resultContainer = container.createEl('div', { cls: 'ai-assistant-result' });

		submitBtn.onclick = async () => {
			const question = input.value.trim();
			if (!question) {
				new Notice('Please enter a question');
				return;
			}

			try {
				resultContainer.empty();
				resultContainer.createEl('p', { text: 'Searching vault for answer...' });
				
				const vaultPath = (this.app.vault.adapter as any).basePath;
				const result = await answerQuestion(question, vaultPath, 20);
				
				resultContainer.empty();
				resultContainer.createEl('h5', { text: 'Answer:' });
				resultContainer.createEl('p', { text: result.answer });
				resultContainer.createEl('small', { text: `Used ${result.sourcesUsed} sources` });
			} catch (error) {
				resultContainer.empty();
				resultContainer.createEl('p', { text: `Error: ${error.message}` });
			}
		};

		input.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				submitBtn.click();
			}
		});
	}

	private renderReportsTab(container: Element) {
		container.createEl('h4', { text: 'Vault Reports' });
		container.createEl('p', { text: 'Generate comprehensive vault-wide reports' });

		const generateBtn = container.createEl('button', {
			text: 'Generate Vault Report',
			cls: 'ai-assistant-button'
		});

		const resultContainer = container.createEl('div', { cls: 'ai-assistant-result' });

		generateBtn.onclick = async () => {
			try {
				resultContainer.empty();
				resultContainer.createEl('p', { text: 'Generating report (this may take a minute)...' });
				
				const vaultPath = (this.app.vault.adapter as any).basePath;
				const report = await generateVaultReport(vaultPath);
				
				resultContainer.empty();
				resultContainer.createEl('h5', { text: 'Vault Statistics' });
				resultContainer.createEl('p', { text: `Total Notes: ${report.totalNotes}` });
				resultContainer.createEl('p', { text: `Total Folders: ${report.totalFolders}` });
				
				resultContainer.createEl('h5', { text: 'Folder Breakdown' });
				const folderList = resultContainer.createEl('ul');
				report.folderBreakdown.slice(0, 5).forEach(folder => {
					folderList.createEl('li', { text: `${folder.name}: ${folder.noteCount} notes (${folder.percentage}%)` });
				});

				resultContainer.createEl('h5', { text: 'Top Themes' });
				const themeList = resultContainer.createEl('ul');
				report.topThemes.forEach(theme => {
					themeList.createEl('li', { text: theme });
				});

				console.log('Full report:', report);
			} catch (error) {
				resultContainer.empty();
				resultContainer.createEl('p', { text: `Error: ${error.message}` });
			}
		};
	}

	async onClose() {
		// Cleanup if needed
	}
}

export default class AILifeAssistantPlugin extends Plugin {
	settings: AIAssistantSettings;

	async onload() {
		console.log('Loading AI Life Assistant plugin');

		await this.loadSettings();

		// Set API key globally for the imported functions
		if (this.settings.apiKey) {
			process.env.GEMINI_API_KEY = this.settings.apiKey;
		}

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
			(leaf) => new AIAssistantView(leaf, this)
		);

		// Add ribbon icon
		this.addRibbonIcon('brain-circuit', 'AI Assistant', (evt: MouseEvent) => {
			this.activateView();
		});

		// Add settings tab
		this.addSettingTab(new AIAssistantSettingTab(this.app, this));
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

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
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

class AIAssistantSettingTab extends PluginSettingTab {
	plugin: AILifeAssistantPlugin;

	constructor(app: App, plugin: AILifeAssistantPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		containerEl.createEl('h2', {text: 'AI Life Assistant Settings'});

		new Setting(containerEl)
			.setName('Google Gemini API Key')
			.setDesc('Enter your Google Gemini API key. Get one at https://makersuite.google.com/app/apikey')
			.addText(text => text
				.setPlaceholder('Enter your API key')
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
					process.env.GEMINI_API_KEY = value;
				}));
	}
}
