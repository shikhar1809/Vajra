/**
 * Vajra - AEGIS Module Public API
 * 
 * Exports all AEGIS (Code Security) functionality
 */

// Code Scanner
export {
    CodeSecurityScanner,
    createScanner,
} from './code-scanner';

export type {
    ScanResult,
    Vulnerability,
    DependencyIssue,
    SecretFinding,
    Recommendation
} from './code-scanner';

// GitHub Actions
export {
    generateWorkflow,
    generatePreCommitConfig,
    generateCLI,
    getWorkflowFiles,
} from './github-actions';

export type {
    WorkflowConfig
} from './github-actions';

// Import types for use in function signatures
import type { ScanResult, DependencyIssue, SecretFinding } from './code-scanner';
import type { WorkflowConfig } from './github-actions';

/**
 * Quick access to code scanning
 */
export async function scanProject(projectPath?: string): Promise<ScanResult> {
    const { createScanner } = await import('./code-scanner');
    const scanner = createScanner(projectPath);
    return scanner.scan({ scanType: 'full', aiEnhanced: true });
}

/**
 * Quick scan for secrets only
 */
export async function scanSecrets(projectPath?: string): Promise<SecretFinding[]> {
    const { createScanner } = await import('./code-scanner');
    const scanner = createScanner(projectPath);
    const result = await scanner.scan({ scanType: 'secrets' });
    return result.secrets;
}

/**
 * Quick dependency scan
 */
export async function scanDependencies(projectPath?: string): Promise<DependencyIssue[]> {
    const { createScanner } = await import('./code-scanner');
    const scanner = createScanner(projectPath);
    const result = await scanner.scan({ scanType: 'sca' });
    return result.dependencies;
}

/**
 * Generate GitHub Actions workflow
 */
export function generateSecurityWorkflow(config?: Partial<WorkflowConfig>): string {
    const { generateWorkflow } = require('./github-actions');
    return generateWorkflow(config);
}

