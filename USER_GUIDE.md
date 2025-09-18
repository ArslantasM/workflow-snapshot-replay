# Workflow Snapshot & Replay - User Guide

## Quick Start

### 1. Install the Extension

### 2. Finding the Dashboard
- Go to the **Explorer** tab in the VS Code/Cursor sidebar
- Find the **"Workflow Snapshot & Replay"** section below the file tree
- This mini dashboard allows you to control all operations

## Dashboard Features

### Main Controls
- **Status Indicator**: Shows recording status (red/white)
- **Start Recording**: Begins new workflow recording
- **Stop Recording**: Ends active recording
- **Generate Report**: Creates Markdown report for current session
- **Replay Workflow**: Replays saved workflow
- **AI Assistant**: Opens analysis and optimization panel

### Session Information
During active recording, the dashboard displays:
- **Start Time**: When the session began
- **Event Count**: How many operations were recorded
- **Workspace**: Which project you're working on

### Recent Workflows
- Last 3 workflows are automatically listed
- Click to view their details
- "+X more..." provides access to full history

## Typical Usage Scenarios

### Scenario 1: Code Tutorial Preparation
```
1. Click "Start Recording" from dashboard
2. Write your code normally, create files
3. Run terminal commands (npm install, git commit, etc.)
4. Click "Stop Recording"
5. Use "Generate Report" to get detailed Markdown documentation
```

### Scenario 2: Bug Reproduction
```
1. Start recording
2. Repeat the steps that trigger the bug
3. Stop recording
4. Share the report with your development team
5. Use "Replay Workflow" to recreate the same issue on another machine
```

### Scenario 3: Student Project Tracking
```
1. Start recording at project beginning
2. Continue development process normally
3. Generate reports at each major milestone
4. Get code quality suggestions from AI assistant
5. Share final report with your mentor
```

## AI Assistant Usage

Click "AI Assistant" from the dashboard to access:

### Analysis Features
- **Workflow Analysis**: Evaluates your working habits
- **Development Suggestions**: Productivity improvement tips
- **Optimization**: Identifies unnecessary steps
- **Explanation**: Describes what your workflow accomplished

### AI Suggestion Examples
- "You're opening/closing files too frequently, use multi-tab"
- "Convert terminal commands into scripts"
- "Use automatic tools for code formatting"
- "Create keyboard shortcuts for these operations"

## Report Format

Generated Markdown reports include:

```markdown
# Workflow Report

## Session Information
- Session ID, start/end times
- Workspace information

## Summary Statistics
- Total event count
- Number of files changed
- Number of commands executed

## Timeline
All operations in chronological order:
1. 14:30:15 - File created: src/App.js
2. 14:30:45 - Text change: src/App.js
3. 14:31:20 - Terminal command: npm start
...

## Replay Instructions
Steps needed to reproduce this workflow
```

## Replay (Workflow Reproduction)

### Manual Replay
1. Click "Replay Workflow" from dashboard
2. Select workflow file in `.md` or `.json` format
3. Follow progress with progress bar
4. Operations are applied automatically

### What Happens During Replay
- **File Operations**: Creation, editing, deletion
- **Editor Activities**: Opening files
- **Terminal Commands**: Automatic execution
- **Wait Times**: Realistic timing

## Advanced Features

### Command Palette Integration
Access all commands via `Ctrl+Shift+P`:
- `Workflow Snapshot: Start Workflow Recording`
- `Workflow Snapshot: Open AI Assistant`
- `Workflow Snapshot: Show All Workflows`

### Settings
```json
{
  "workflowSnapshot.autoSave": true,
  "workflowSnapshot.outputFormat": "markdown",
  "workflowSnapshot.aiProvider": "local"
}
```

### Keyboard Shortcuts (Recommended)
```json
{
  "key": "ctrl+alt+r",
  "command": "workflowSnapshot.startRecording"
},
{
  "key": "ctrl+alt+s",
  "command": "workflowSnapshot.stopRecording"
}
```

## Troubleshooting

### Dashboard Not Visible
- Ensure Explorer tab is open
- Check that extension is installed (`Ctrl+Shift+X`)
- Restart VS Code

### Replay Not Working
- Ensure target workspace is open
- Check that file paths are correct
- Verify required tools are installed for terminal commands

### AI Assistant Won't Open
- Ensure webviews are enabled
- Check extension security settings

## Tips

### Efficient Usage
1. **Small Sessions**: 30-60 minute recordings are more manageable
2. **Meaningful Names**: Give workflow files descriptive names
3. **Regular Cleanup**: Periodically delete old workflows
4. **Follow AI Suggestions**: Use AI assistant for continuous improvement

### Team Collaboration
- Share workflow reports in team channels
- Use workflows for code reviews
- Provide example workflows to new team members during onboarding

## Resources

- [GitHub Repository](https://github.com/your-repo/workflow-snapshot-replay)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Issue Tracker](https://github.com/your-repo/workflow-snapshot-replay/issues)

---

**Happy coding!**
