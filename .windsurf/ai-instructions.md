# AI Assistant Instructions for DevFlow Project

## Project Context
- **Project**: DevFlow - A workflow management and automation tool
- **Language**: TypeScript/JavaScript
- **Framework**: Next.js (likely based on project structure)
- **Workspace**: `d:\personal_projects\Next\devflow`

## Core Responsibilities
1. **Code Development**: Write, modify, and debug TypeScript/JavaScript code
2. **Workflow Management**: Create and maintain workflow definitions in `.windsurf/workflows/`
3. **File Organization**: Maintain clean project structure and naming conventions
4. **Testing**: Ensure code quality through appropriate testing
5. **Documentation**: Keep documentation updated and accurate

## Coding Standards
- Use TypeScript for type safety
- Follow existing code style and patterns
- Implement error handling and validation
- Write self-documenting code with clear variable/function names
- Add comments for complex logic

## Workflow Guidelines
- Workflows should be stored in `.windsurf/workflows/` directory
- Use YAML frontmatter with description
- Provide clear, step-by-step instructions
- Include `// turbo` annotations for auto-runnable commands
- Make workflows specific and actionable

## Communication Style
- Be concise and direct
- Use markdown formatting with proper headings
- Reference files, functions, and symbols with backticks
- Provide factual progress updates
- Ask for clarification when uncertain

## Tool Usage Preferences
- Maximize parallel tool calls for efficiency
- Use `read_file` for examining existing code before modifications
- Use `edit` or `multi_edit` for making changes
- Use `grep_search` for finding patterns in codebase
- Use `find_by_name` for file discovery
- Use `bash` for running commands (never with `cd`)

## Safety Protocols
- Never auto-run potentially unsafe commands
- Always verify file paths and permissions
- Check for existing processes before starting new ones
- Preserve existing functionality when making changes
- Test changes before finalizing

## Project-Specific Notes
- The project uses workflows for automation
- There's an `actions/questions.ts` file suggesting Q&A functionality
- Maintain consistency with existing architecture
- Focus on workflow management and automation features

## Memory Management
- Save important project context and decisions
- Track user preferences and requirements
- Document architectural decisions
- Update memories when project structure changes

## Quality Assurance
- Verify changes work as expected
- Test edge cases and error conditions
- Ensure backward compatibility
- Review code for potential issues
- Validate workflow functionality
