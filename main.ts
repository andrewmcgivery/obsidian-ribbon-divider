import { App, Plugin, PluginSettingTab, Setting } from "obsidian";

interface Divider {
	id: string;
}

interface DividerPluginSettings {
	dividers: Record<string, Divider>;
}

const DEFAULT_SETTINGS: DividerPluginSettings = {
	dividers: {},
};

/**
 * This allows a "live-reload" of Obsidian when developing the plugin.
 * Any changes to the code will force reload Obsidian.
 */
if (process.env.NODE_ENV === "development") {
	new EventSource("http://127.0.0.1:8000/esbuild").addEventListener(
		"change",
		() => location.reload()
	);
}

export default class DividerPlugin extends Plugin {
	settings: DividerPluginSettings;
	dividerElements: Record<string, HTMLElement> = {};

	async onload() {
		await this.loadSettings();

		// Render the dividers based on what is already in settings
		Object.keys(this.settings.dividers).forEach((dividerId) => {
			const divider = this.settings.dividers[dividerId];

			this.renderDivider(divider);
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new DividerSettingTab(this.app, this));
	}

	onunload() {}

	/**
	 * Load data from disk, stored in data.json in plugin folder
	 */
	async loadSettings() {
		const data = (await this.loadData()) || {};
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data);

		if (!this.settings.dividers) {
			this.settings.dividers = {};
		}
	}

	/**
	 * Save data to disk, stored in data.json in plugin folder
	 */
	async saveSettings() {
		await this.saveData(this.settings);
	}

	/**
	 * Renders a divider on the ribbon. The HTMLElement is saved to this.dividerElemenets so we can remove it if the
	 * user deletes it from the settings screen.
	 * @param divider
	 */
	async renderDivider(divider: Divider) {
		const dividerIconEl = this.addRibbonIcon(
			"",
			`Divider: ${divider.id}`,
			(evt: MouseEvent) => {}
		);
		dividerIconEl.addClass("ribbon-divider");
		dividerIconEl.addClass(`ribbon-divider-${divider.id}`);
		this.dividerElements[divider.id] = dividerIconEl;
	}

	/**
	 * Add a new divider and render it
	 * @param divider
	 */
	async addDivider(divider: Divider) {
		this.renderDivider(divider);

		this.settings.dividers[divider.id] = divider;

		await this.saveSettings();
	}

	/**
	 * Remove an existing divider, both from settings, and from the UI by calling remove() on the saved HTMLElement
	 * @param dividerId
	 */
	async removeDivider(dividerId: string) {
		delete this.settings.dividers[dividerId];
		this.saveSettings();
		this.dividerElements[dividerId].remove();
		delete this.dividerElements[dividerId];
	}
}

class DividerSettingTab extends PluginSettingTab {
	plugin: DividerPlugin;

	constructor(app: App, plugin: DividerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("p", {
			attr: {
				style: "display: block; margin-bottom: 5px",
			},
			text: 'Use this settings screen to add/update dividers to your ribbon. Clicking "New Divider" below will immediately add the divider.',
		});
		containerEl.createEl("hr");

		containerEl.createEl("h2", { text: "Configure dividers" });
		const dividersContainerEl = containerEl.createDiv("dividers-container");

		Object.keys(this.plugin.settings.dividers).forEach((dividerId) => {
			const divider = this.plugin.settings.dividers[dividerId];
			const dividerEl = dividersContainerEl.createEl("div", {
				attr: {
					"data-gate-id": divider.id,
					class: "ribbondividers-settings-divider",
				},
			});

			new Setting(dividerEl)
				.setName("Divider")
				.setDesc(`Id: ${divider.id}`)
				.addButton((button) => {
					button.setButtonText("Delete").onClick(async () => {
						await this.plugin.removeDivider(divider.id);
						dividerEl.remove();
					});
				});
		});

		containerEl
			.createEl("button", { text: "New divider", cls: "mod-cta" })
			.addEventListener("click", () => {
				this.plugin.addDivider({
					id: crypto.randomUUID(),
				});
				this.display();
			});
	}
}
