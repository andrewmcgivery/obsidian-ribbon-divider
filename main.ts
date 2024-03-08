import {
	App,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	requestUrl,
} from "obsidian";
import { v4 as uuidv4 } from "uuid";

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

		this.versionCheck();

		// Render the dividers based on what is already in settings
		// Don't try to render them on phones since it ends up being a context menu
		if (
			// @ts-ignore
			!(this.app.isMobile && document.body.classList.contains("is-phone"))
		) {
			Object.keys(this.settings.dividers).forEach((dividerId) => {
				const divider = this.settings.dividers[dividerId];

				this.renderDivider(divider);
			});
		}

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new DividerSettingTab(this.app, this));

		if (process.env.NODE_ENV === "development") {
			// @ts-ignore
			if (process.env.EMULATE_MOBILE && !this.app.isMobile) {
				// @ts-ignore
				this.app.emulateMobile(true);
			}

			// @ts-ignore
			if (!process.env.EMULATE_MOBILE && this.app.isMobile) {
				// @ts-ignore
				this.app.emulateMobile(false);
			}
		}
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
	 * Check the local plugin version against github. If there is a new version, notify the user.
	 */
	async versionCheck() {
		const localVersion = process.env.PLUGIN_VERSION;
		const stableVersion = await requestUrl(
			"https://raw.githubusercontent.com/andrewmcgivery/obsidian-ribbon-divider/main/package.json"
		).then(async (res) => {
			if (res.status === 200) {
				const response = await res.json;
				return response.version;
			}
		});
		const betaVersion = await requestUrl(
			"https://raw.githubusercontent.com/andrewmcgivery/obsidian-ribbon-divider/beta/package.json"
		).then(async (res) => {
			if (res.status === 200) {
				const response = await res.json;
				return response.version;
			}
		});

		if (localVersion?.indexOf("beta") !== -1) {
			if (localVersion !== betaVersion) {
				new Notice(
					"There is a beta update available for the Ribbon Divider plugin. Please update to to the latest version to get the latest features!",
					0
				);
			}
		} else if (localVersion !== stableVersion) {
			new Notice(
				"There is an update available for the Ribbon Divider plugin. Please update to to the latest version to get the latest features!",
				0
			);
		}
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
					id: uuidv4(),
				});
				this.display();
			});
	}
}
