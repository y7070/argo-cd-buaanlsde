import {HelpIcon} from 'argo-ui';
import * as React from 'react';
import {DataLoader} from '../../../shared/components';
import {Revision} from '../../../shared/components/revision';
import {Timestamp} from '../../../shared/components/timestamp';
import * as models from '../../../shared/models';
import {services} from '../../../shared/services';
import {Consumer} from '../../../shared/context';
import * as utils from '../utils';
import {ApplicationSyncWindowStatusIcon, ComparisonStatusIcon, getAppOperationState, HealthStatusIcon, OperationState, syncStatusMessage} from '../utils';
import {RevisionMetadataPanel} from './revision-metadata-panel';

require('./application-status-panel.scss');

interface Props {
    cpuMemoryData:models.ICpuMemory,
    name:string,
    application: models.Application;
    showOperation?: () => any;
    showConditions?: () => any;
}

export const ApplicationStatusPanel = ({application, showOperation, showConditions,cpuMemoryData,name}: Props) => {
    const today = new Date();

    let daysSinceLastSynchronized = 0;
    const history = application.status.history || [];
    if (history.length > 0) {
        const deployDate = new Date(history[history.length - 1].deployedAt);
        daysSinceLastSynchronized = Math.round(Math.abs((today.getTime() - deployDate.getTime()) / (24 * 60 * 60 * 1000)));
    }
    const cntByCategory = (application.status.conditions || []).reduce(
        (map, next) => map.set(utils.getConditionCategory(next), (map.get(utils.getConditionCategory(next)) || 0) + 1),
        new Map<string, number>()
    );
    const appOperationState = getAppOperationState(application);
    if (application.metadata.deletionTimestamp) {
        showOperation = null;
    }
    return (
        <Consumer>
            {ctx => (
                <div className='application-status-panel row'>
                    <div className='application-status-panel__item columns small-2'>
                        <div className='application-status-panel__item-value'>
                            <HealthStatusIcon state={application.status.health} />
                            &nbsp;
                            {application.status.health.status}
                            <HelpIcon title='应用健康状况' />
                        </div>
                        { (application.status.health.status == 'Progressing' || application.status.health.status == 'Healthy') && (
                            // TODO: add processing time here
                            <div className='application-status-panel__item-value'>
                                应用部署已用时间: 
                                &nbsp;
                                {ctx.applicationsTimeData[name] && ctx.applicationsTimeData[name].timerNum || '--'}
                            </div>
                        )}
                        <div className='application-status-panel__item-name'>{application.status.health.message}</div>
                    </div>
                    {appOperationState && (
                        // TODO: add resource calculation
                        <div className='application-status-panel__item columns small-2 '>
                            <div className='application-status-panel__item-value'>
                                占用资源: 
                                &nbsp;
                                CPU: {cpuMemoryData.requested.cpu}, 内存: {cpuMemoryData.requested.memory}
                            </div>
                            <div className='application-status-panel__item-value'>
                                可用资源: 
                                &nbsp;
                                CPU: {cpuMemoryData.allocatable.cpu}, 内存: {cpuMemoryData.allocatable.memory}
                            </div>
                            <div className='application-status-panel__item-value'>
                                资源比例: 
                                &nbsp;
                                {cpuMemoryData.ratio}
                            </div>
                        </div>
                    )}
                    <div className='application-status-panel__item columns small-2' style={{position: 'relative'}}>
                        <div className='application-status-panel__item-value'>
                            <ComparisonStatusIcon status={application.status.sync.status} label={true} />
                            <HelpIcon title='表明您的应用是否进行了同步' />
                        </div>
                        <div className='application-status-panel__item-name'>{syncStatusMessage(application)}</div>
                        <div className='application-status-panel__item-name'>
                            {application.status && application.status.sync && application.status.sync.revision && (
                                <RevisionMetadataPanel appName={application.metadata.name} type={application.spec.source.chart && 'helm'} revision={application.status.sync.revision} />
                            )}
                        </div>
                    </div>
                    {appOperationState && (
                        <div className='application-status-panel__item columns small-4 '>
                            <div className={`application-status-panel__item-value application-status-panel__item-value--${appOperationState.phase}`}>
                                <a onClick={() => showOperation && showOperation()}>
                                    <OperationState app={application} />
                                    <HelpIcon
                                        title={
                                            '表明您的应用是否同步成功。距离上一次同步已经过去了' +
                                            daysSinceLastSynchronized +
                                            '天，点击可查看上次更新。'
                                        }
                                    />
                                </a>
                            </div>
                            {appOperationState.syncResult && appOperationState.syncResult.revision && (
                                <div className='application-status-panel__item-name'>
                                    To <Revision repoUrl={application.spec.source.repoURL} revision={appOperationState.syncResult.revision} />
                                </div>
                            )}
                            <div className='application-status-panel__item-name'>
                                {appOperationState.phase} <Timestamp date={appOperationState.finishedAt || appOperationState.startedAt} />
                            </div>
                            {(appOperationState.syncResult && appOperationState.syncResult.revision && (
                                <RevisionMetadataPanel
                                    appName={application.metadata.name}
                                    type={application.spec.source.chart && 'helm'}
                                    revision={appOperationState.syncResult.revision}
                                />
                            )) || <div className='application-status-panel__item-name'>{appOperationState.message}</div>}
                        </div>
                    )}
                    {application.status.conditions && (
                        <div className={`application-status-panel__item columns small-2`}>
                            <div className='application-status-panel__item-value' onClick={() => showConditions && showConditions()}>
                                {cntByCategory.get('info') && <a className='info'>{cntByCategory.get('info')} Info</a>}
                                {cntByCategory.get('warning') && <a className='warning'>{cntByCategory.get('warning')} Warnings</a>}
                                {cntByCategory.get('error') && <a className='error'>{cntByCategory.get('error')} Errors</a>}
                            </div>
                        </div>
                    )}
                    <DataLoader
                        noLoaderOnInputChange={true}
                        input={application.metadata.name}
                        load={async name => {
                            return await services.applications.getApplicationSyncWindowState(name);
                        }}>
                        {(data: models.ApplicationSyncWindowState) => (
                            <React.Fragment>
                                <div className='application-status-panel__item columns small-2' style={{position: 'relative'}}>
                                    <div className='application-status-panel__item-value'>
                                        {data.assignedWindows && (
                                            <React.Fragment>
                                                <ApplicationSyncWindowStatusIcon project={application.spec.project} state={data} />
                                                <HelpIcon
                                                    title={
                                                        'The aggregate state of sync windows for this app. ' +
                                                        'Red: no syncs allowed. ' +
                                                        'Yellow: manual syncs allowed. ' +
                                                        'Green: all syncs allowed'
                                                    }
                                                />
                                            </React.Fragment>
                                        )}
                                    </div>
                                </div>
                            </React.Fragment>
                        )}
                    </DataLoader>
                </div>
            )}
        </Consumer>
        
    );
};
