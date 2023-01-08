import { addIcon, App, Notice, Platform, Plugin, TFile } from 'obsidian';
import { Memos, MEMOS_VIEW_TYPE } from './memosView';
import { DEFAULT_SETTINGS, MemosSettings, MemosSettingTab } from './memosSetting';
import showDailyMemoDiaryDialog from './components/DailyMemoDiaryDialog';
import { t } from './translations/helper';
import { memoService } from './services';

export default class MemosPlugin extends Plugin {
    public settings: MemosSettings;
    private memosAction: MemosAction;

    async onload(): Promise<void> {
        await this.loadSettings();
        this.addSettingTab(new MemosSettingTab(this.app, this));

        this.registerCustomIcons();
        this.registerCustomViews();
        this.registerMobileEvent();

        this.registerCommands();
        this.registerRibbon();

        this.memosAction = new MemosAction(this.app, this);
        await this.checkSettings();
    }

    public async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    onunload() {
        this.app.workspace.detachLeavesOfType(MEMOS_VIEW_TYPE);
        new Notice(t('Close Memos Successfully'));
    }

    private registerCustomIcons() {
        addIcon(
            'memos',
            `<svg t="1641348507339" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2120" width="100" height="100"><path d="M126.692653 478.099639l-90.757281 0c-19.019408 0-34.437336 15.423923-34.437336 34.417356 0 18.992434 15.416929 34.477297 34.437336 34.477297l90.757281 0c19.013414 0 34.42335-15.484863 34.42335-34.477297C161.116003 493.523561 145.706067 478.099639 126.692653 478.099639zM244.662333 243.526943c13.742566-13.110184 14.310011-34.948836 1.185841-48.706388l-62.644762-65.668806c-13.128167-13.762547-34.974811-14.229091-48.717377-1.118906s-14.261059 34.911872-1.132893 48.674419l62.644762 65.668806C209.123074 256.13262 230.919767 256.637127 244.662333 243.526943zM543.066631 957.422083l-60.603757 0c-18.654764 0-33.794964 15.147193-33.794964 33.862898 0 18.661757 15.1402 32.71502 33.794964 32.71502l60.603757 0c18.654764 0 33.794964-14.053262 33.794964-32.71502C576.861595 972.568277 561.721395 957.422083 543.066631 957.422083zM988.076617 479.050709l-90.757281 0c-19.019408 0-34.437336 15.423923-34.437336 34.417356s15.416929 34.477297 34.437336 34.477297l90.757281 0c19.013414 0 34.42335-15.484863 34.42335-34.477297S1007.09003 479.050709 988.076617 479.050709zM512.268737 192.765564c-172.737143 0-312.75527 150.079292-312.75527 322.746503 0 125.630192 74.080583 233.957298 180.936128 283.703669l0 84.51838c0 16.762614 15.410935 31.35435 34.42335 31.35435 0.598415 0 1.193833-0.014985 1.785255-0.042958 0.618395 0.026974 1.239788 0.042958 1.867175 0.042958l187.479731 0c5.905227 0 11.455802-1.220807 16.288078-3.477601 12.231044-4.657447 20.795671-15.383962 20.795671-27.87575l0-84.052835c107.391021-49.534578 181.935151-158.147405 181.935151-284.168214C825.024007 342.843857 684.997888 192.765564 512.268737 192.765564zM574.863548 742.713968l0 80.17063c0 3.159911-0.221783 5.976158-0.642372 8.496694l0 19.092336-124.910895 0 0-17.71768c-0.423586-2.856208-0.642372-6.123015-0.642372-9.870351l0-80.443363c-99.204024-27.75387-171.970892-118.821847-171.970892-226.930167 0-130.094827 105.4689-245.507007 235.571719-245.507007s235.563727 115.41218 235.563727 245.507007C747.832465 623.984031 674.578074 715.293772 574.863548 742.713968zM895.407204 129.328576c-13.429872-13.429872-35.233558-13.439862-48.677416 0.004995l-64.174267 64.175266c-13.448853 13.448853-13.443858 35.257534-0.013986 48.687406 13.429872 13.429872 35.281511 13.477825 48.730364 0.028972l64.175266-64.175266C908.889025 164.605092 908.837076 142.758448 895.407204 129.328576zM511.796199 159.617967c18.992434 0 34.417356-15.410935 34.417356-34.42335l0-90.757281c0-19.019408-15.423923-34.437336-34.417356-34.437336-18.992434 0-34.477297 15.416929-34.477297 34.437336l0 90.757281C477.317903 144.208031 492.802766 159.617967 511.796199 159.617967z" fill="currentColor" p-id="2121"></path></svg>`,
        );
    }

    private registerCustomViews() {
        this.registerView(MEMOS_VIEW_TYPE, (leaf) => new Memos(leaf, this));
    }

    private async checkSettings() {
        const leaves = this.app.workspace.getLeavesOfType(MEMOS_VIEW_TYPE);
        if (!(leaves.length > 0)) {
            return;
        }
        if (this.settings.FocusOnEditor) {
            const leaf = leaves[0];
            leaf.view.containerEl.querySelector('textarea').focus();
            return;
        }
        if (!this.settings.OpenMemosAutomatically) {
            return;
        }
        await this.memosAction.openMemos();
    }

    registerMobileEvent() {
        if (!Platform.isMobile) return;
        this.registerEvent(
            this.app.workspace.on('receive-text-menu', (menu, source) => {
                menu.addItem((item: any) => {
                    item.setIcon('popup-open')
                        .setTitle(t('Insert as Memo'))
                        .onClick(async () => {
                            const newMemo = await memoService.createMemo(source, false);
                            memoService.pushMemo(newMemo);
                        });
                });
            }),
        );

        this.registerEvent(
            this.app.workspace.on('receive-files-menu', (menu, source) => {
                menu.addItem((item) => {
                    item.setIcon('popup-open')
                        .setTitle(t('Insert file as memo content'))
                        .onClick(async () => {
                            const fileName = source.map((file: TFile) => {
                                return this.app.fileManager.generateMarkdownLink(file, file.path);
                            });
                            const newMemo = await memoService.createMemo(fileName.join('\n'), false);
                            memoService.pushMemo(newMemo);
                            // console.log(source, 'hello world');
                        });
                });
            }),
        );
    }

    private registerCommands() {
        this.addCommand({
            id: 'open-memos',
            name: 'Open Memos',
            callback: () => this.memosAction.openMemos(),
            hotkeys: [],
        });

        this.addCommand({
            id: 'focus-on-memos-editor',
            name: 'Focus On Memos Editor',
            callback: () => this.memosAction.focusOnEditor(),
            hotkeys: [],
        });

        this.addCommand({
            id: 'show-daily-memo',
            name: 'Show Daily Memo',
            callback: () => this.memosAction.openDailyMemo(),
            hotkeys: [],
        });

        this.addCommand({
            id: 'note-it',
            name: 'Note It',
            callback: () => this.memosAction.noteIt(),
            hotkeys: [],
        });

        this.addCommand({
            id: 'focus-on-search-bar',
            name: 'Search It',
            callback: () => this.memosAction.searchIt(),
            hotkeys: [],
        });

        this.addCommand({
            id: 'change-status',
            name: 'Change Status Between Task Or List',
            callback: () => this.memosAction.changeStatus(),
            hotkeys: [],
        });

        this.addCommand({
            id: 'show-memos-in-popover',
            name: 'Show Memos in Popover',
            callback: () => this.memosAction.showInPopover(),
            hotkeys: [],
        });
    }

    private registerRibbon() {
        this.addRibbonIcon('Memos', t('ribbonIconTitle'), async () => {
            new Notice(t('Open Memos Successfully'));
            await this.memosAction.openMemos();
        });
    }
}

class MemosAction {
    private app: App;
    private plugin: MemosPlugin;
    private settings: MemosSettings;

    constructor(app: App, plugin: MemosPlugin) {
        this.app = app;
        this.plugin = plugin;
        this.settings = plugin.settings;
    }

    async openDailyMemo() {
        const workspaceLeaves = this.app.workspace.getLeavesOfType(MEMOS_VIEW_TYPE);
        if (!this.settings.OpenDailyMemosWithMemos) {
            showDailyMemoDiaryDialog();
            return;
        }

        if (workspaceLeaves.length > 0) {
            showDailyMemoDiaryDialog();
            return;
        }

        await this.openMemos();
        showDailyMemoDiaryDialog();
    }

    async openMemos() {
        const workspace = this.app.workspace;
        workspace.detachLeavesOfType(MEMOS_VIEW_TYPE);
        // const leaf = workspace.getLeaf(
        //   !Platform.isMobile && workspace.activeLeaf && workspace.activeLeaf.view instanceof FileView,
        // );
        const leaf = workspace.getLeaf(false);
        await leaf.setViewState({ type: MEMOS_VIEW_TYPE });
        workspace.revealLeaf(leaf);

        if (!this.settings.FocusOnEditor) {
            return;
        }

        if (leaf.view.containerEl.querySelector('textarea') !== undefined) {
            leaf.view.containerEl.querySelector('textarea').focus();
        }
    }

    async searchIt() {
        const workspace = this.app.workspace;
        const leaves = workspace.getLeavesOfType(MEMOS_VIEW_TYPE);
        if (!(leaves.length > 0)) {
            await this.openMemos();
            return;
            // this.openMemos();
        }

        const leaf = leaves[0];
        workspace.setActiveLeaf(leaf);
        (leaf.view.containerEl.querySelector('.search-bar-inputer .text-input') as HTMLElement).focus();
    }

    async focusOnEditor() {
        const workspace = this.app.workspace;
        const leaves = workspace.getLeavesOfType(MEMOS_VIEW_TYPE);
        if (!(leaves.length > 0)) {
            await this.openMemos();
            return;
        }

        const leaf = leaves[0];
        workspace.setActiveLeaf(leaf);
        leaf.view.containerEl.querySelector('textarea').focus();
    }

    noteIt() {
        const workspace = this.app.workspace;
        const leaves = workspace.getLeavesOfType(MEMOS_VIEW_TYPE);
        if (!(leaves.length > 0)) {
            new Notice(t('Please Open Memos First'));
            return;
        }

        const leaf = leaves[0];
        workspace.setActiveLeaf(leaf);
        (leaf.view.containerEl.querySelector('.memo-editor .confirm-btn') as HTMLElement).click();
    }

    changeStatus() {
        const workspace = this.app.workspace;
        const leaves = workspace.getLeavesOfType(MEMOS_VIEW_TYPE);
        if (!(leaves.length > 0)) {
            new Notice(t('Please Open Memos First'));
            return;
            // this.openMemos();
        }

        const leaf = leaves[0];
        workspace.setActiveLeaf(leaf);
        (leaf.view.containerEl.querySelector('.list-or-task') as HTMLElement).click();
    }

    async showInPopover() {
        await this.app.workspace.detachLeavesOfType(MEMOS_VIEW_TYPE);
        const leaf = await window.app.plugins.getPlugin('obsidian-hover-editor')?.spawnPopover();

        await leaf.setViewState({ type: MEMOS_VIEW_TYPE });
        this.app.workspace.revealLeaf(leaf);
        leaf.view.containerEl.classList.add('mobile-view');
        if (!this.settings.FocusOnEditor) {
            return;
        }

        if (leaf.view.containerEl.querySelector('textarea') !== undefined) {
            leaf.view.containerEl.querySelector('textarea').focus();
        }
    }
}
