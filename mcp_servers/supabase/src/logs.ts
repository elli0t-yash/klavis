import { stripIndent } from 'common-tags';

export function getLogQuery(
  service:
    | 'api'
    | 'branch-action'
    | 'postgres'
    | 'edge-function'
    | 'auth'
    | 'storage'
    | 'realtime',
  limit: number = 100
) {
  switch (service) {
    case 'api':
      return stripIndent`
        select
          id,
          log_attributes['identifier'] as identifier,
          timestamp,
          event_message,
          log_attributes['request.method'] as method,
          log_attributes['request.path'] as path,
          toInt32OrZero(log_attributes['response.status_code']) as status_code
        from logs
        where source = 'edge_logs'
        order by timestamp desc
        limit ${limit}
      `;
    case 'branch-action':
      return stripIndent`
        select
          log_attributes['workflow_run'] as workflow_run,
          timestamp,
          id,
          event_message
        from logs
        where source = 'workflow_run_logs'
        order by timestamp desc
        limit ${limit}
      `;
    case 'postgres':
      return stripIndent`
        select
          log_attributes['identifier'] as identifier,
          timestamp,
          id,
          event_message,
          log_attributes['parsed.error_severity'] as error_severity
        from logs
        where source = 'postgres_logs'
        order by timestamp desc
        limit ${limit}
      `;
    case 'edge-function':
      return stripIndent`
        select
          id,
          timestamp,
          event_message,
          toInt32OrZero(log_attributes['response.status_code']) as status_code,
          log_attributes['request.method'] as method,
          log_attributes['function_id'] as function_id,
          toFloat64OrZero(log_attributes['execution_time_ms']) as execution_time_ms,
          log_attributes['deployment_id'] as deployment_id,
          log_attributes['version'] as version
        from logs
        where source = 'function_edge_logs'
        order by timestamp desc
        limit ${limit}
      `;
    case 'auth':
      return stripIndent`
        select
          id,
          timestamp,
          event_message,
          log_attributes['level'] as level,
          log_attributes['status'] as status,
          log_attributes['path'] as path,
          log_attributes['msg'] as msg,
          log_attributes['error'] as error
        from logs
        where source = 'auth_logs'
        order by timestamp desc
        limit ${limit}
      `;
    case 'storage':
      return stripIndent`
        select id, timestamp, event_message
        from logs
        where source = 'storage_logs'
        order by timestamp desc
        limit ${limit}
      `;
    case 'realtime':
      return stripIndent`
        select id, timestamp, event_message
        from logs
        where source = 'realtime_logs'
        order by timestamp desc
        limit ${limit}
      `;
    default:
      throw new Error(`unsupported log service type: ${service}`);
  }
}
