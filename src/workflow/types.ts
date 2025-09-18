export interface WorkflowEvent {
    type: 'session_started' | 'session_ended' | 'file_created' | 'file_modified' | 'file_deleted' | 
          'text_changed' | 'editor_opened' | 'terminal_opened' | 'command_executed';
    timestamp: number;
    data: any;
}

export interface TextChange {
    range: {
        start: { line: number; character: number };
        end: { line: number; character: number };
    };
    text: string;
    rangeLength: number;
}

export interface WorkflowSession {
    id: string;
    startTime: number;
    endTime: number | null;
    events: WorkflowEvent[];
    workspace: string;
    metadata: {
        vscodeVersion: string;
        extensions: Array<{
            id: string;
            version: string;
        }>;
    };
}

export interface WorkflowReport {
    session: WorkflowSession;
    summary: {
        duration: number;
        filesModified: number;
        commandsExecuted: number;
        totalEvents: number;
    };
    timeline: Array<{
        timestamp: number;
        description: string;
        type: string;
        details?: any;
    }>;
}

export interface ReplayStep {
    type: 'create_file' | 'modify_file' | 'delete_file' | 'open_file' | 'execute_command' | 'wait';
    description: string;
    data: any;
    delay?: number;
}
