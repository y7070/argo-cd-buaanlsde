import {BehaviorSubject, Observable} from 'rxjs';

export type AppsDetailsViewType = 'tree' | 'network' | 'list';

export interface AppDetailsPreferences {
    resourceFilter: string[];
    view: AppsDetailsViewType;
    resourceView: 'manifest' | 'diff' | 'desiredManifest';
    inlineDiff: boolean;
    compactDiff: boolean;
    orphanedResources: boolean;
}

export type AppsListViewType = 'tiles' | 'list' | 'summary';

export class AppsListPreferences {
    public static countEnabledFilters(pref: AppsListPreferences) {
        // tslint:disable-next-line: prettier
        return [
            pref.clustersFilter,
            pref.healthFilter,
            pref.labelsFilter,
            pref.namespacesFilter,
            pref.projectsFilter,
            pref.reposFilter,
            pref.syncFilter
        ].reduce((count, filter) => {
                if (filter && filter.length > 0) {
                    return count + 1;
                }
                return count;
            },
            0
        );
    }

    public static clearFilters(pref: AppsListPreferences) {
        pref.clustersFilter = [];
        pref.healthFilter = [];
        pref.labelsFilter = [];
        pref.namespacesFilter = [];
        pref.projectsFilter = [];
        pref.reposFilter = [];
        pref.syncFilter = [];
    }

    public labelsFilter: string[];
    public projectsFilter: string[];
    public reposFilter: string[];
    public syncFilter: string[];
    public healthFilter: string[];
    public namespacesFilter: string[];
    public clustersFilter: string[];
    public view: AppsListViewType;
}

export interface ViewPreferences {
    version: number;
    appDetails: AppDetailsPreferences;
    appList: AppsListPreferences;
    pageSizes: {[key: string]: number};
}

const VIEW_PREFERENCES_KEY = 'view_preferences';

const minVer = 4;

const DEFAULT_PREFERENCES: ViewPreferences = {
    version: 1,
    appDetails: {
        view: 'tree',
        // resourceFilter: ['kind:Deployment', 'kind:Service', 'kind:Pod', 'kind:StatefulSet', 'kind:Ingress', 'kind:ConfigMap', 'kind:Job', 'kind:DaemonSet', 'kind:Workflow'],
        resourceFilter: ['kind:Deployment', 'kind:Service', 'kind:StatefulSet', 'kind:Ingress', 'kind:ConfigMap', 'kind:Job', 'kind:DaemonSet', 'kind:Workflow'],
        inlineDiff: false,
        compactDiff: false,
        resourceView: 'manifest',
        orphanedResources: false
    },
    appList: {
        view: 'tiles' as AppsListViewType,
        labelsFilter: new Array<string>(),
        projectsFilter: new Array<string>(),
        namespacesFilter: new Array<string>(),
        clustersFilter: new Array<string>(),
        reposFilter: new Array<string>(),
        syncFilter: new Array<string>(),
        healthFilter: new Array<string>()
    },
    pageSizes: {}
};

export class ViewPreferencesService {
    private preferencesSubj: BehaviorSubject<ViewPreferences>;

    public init() {
        if (!this.preferencesSubj) {
            this.preferencesSubj = new BehaviorSubject(this.loadPreferences());
            window.addEventListener('storage', () => {
                this.preferencesSubj.next(this.loadPreferences());
            });
        }
    }

    public getPreferences(): Observable<ViewPreferences> {
        return this.preferencesSubj;
    }

    public updatePreferences(change: Partial<ViewPreferences>) {
        const nextPref = Object.assign({}, this.preferencesSubj.getValue(), change, {version: minVer});
        window.localStorage.setItem(VIEW_PREFERENCES_KEY, JSON.stringify(nextPref));
        this.preferencesSubj.next(nextPref);
    }

    private loadPreferences(): ViewPreferences {
        let preferences: ViewPreferences;
        const preferencesStr = window.localStorage.getItem(VIEW_PREFERENCES_KEY);
        if (preferencesStr) {
            try {
                preferences = JSON.parse(preferencesStr);
            } catch (e) {
                preferences = DEFAULT_PREFERENCES;
            }
            if (!preferences.version || preferences.version < minVer) {
                preferences = DEFAULT_PREFERENCES;
            }
        } else {
            preferences = DEFAULT_PREFERENCES;
        }
        return Object.assign({}, DEFAULT_PREFERENCES, preferences);
    }
}
