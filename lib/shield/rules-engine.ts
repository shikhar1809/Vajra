/**
 * Firewall Rules Engine
 * Evaluates traffic against custom rules and determines blocking
 */

export interface FirewallRule {
    id: string
    name: string
    enabled: boolean
    priority: number
    conditions: RuleCondition[]
    action: 'block' | 'allow' | 'challenge'
    created_at: string
}

export interface RuleCondition {
    type: 'ip' | 'country' | 'path' | 'method' | 'bot_score' | 'rate_limit'
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_list'
    value: string | number | string[]
}

export interface TrafficRequest {
    ip: string
    country?: string
    path: string
    method: string
    bot_score?: number
    user_agent?: string
}

/**
 * Evaluate traffic against firewall rules
 */
export function evaluateRules(request: TrafficRequest, rules: FirewallRule[]): {
    action: 'block' | 'allow' | 'challenge'
    matchedRule?: FirewallRule
} {
    // Sort rules by priority (higher priority first)
    const sortedRules = [...rules]
        .filter(r => r.enabled)
        .sort((a, b) => b.priority - a.priority)

    // Evaluate each rule
    for (const rule of sortedRules) {
        if (matchesRule(request, rule)) {
            return {
                action: rule.action,
                matchedRule: rule,
            }
        }
    }

    // Default: allow
    return { action: 'allow' }
}

/**
 * Check if request matches rule conditions
 */
function matchesRule(request: TrafficRequest, rule: FirewallRule): boolean {
    // All conditions must match (AND logic)
    return rule.conditions.every(condition => matchesCondition(request, condition))
}

/**
 * Check if request matches a single condition
 */
function matchesCondition(request: TrafficRequest, condition: RuleCondition): boolean {
    const { type, operator, value } = condition

    switch (type) {
        case 'ip':
            return evaluateStringCondition(request.ip, operator, value as string)

        case 'country':
            return evaluateStringCondition(request.country || '', operator, value as string)

        case 'path':
            return evaluateStringCondition(request.path, operator, value as string)

        case 'method':
            return evaluateStringCondition(request.method, operator, value as string)

        case 'bot_score':
            return evaluateNumberCondition(request.bot_score || 0, operator, value as number)

        default:
            return false
    }
}

/**
 * Evaluate string condition
 */
function evaluateStringCondition(
    actual: string,
    operator: string,
    expected: string | string[]
): boolean {
    switch (operator) {
        case 'equals':
            return actual === expected

        case 'contains':
            return actual.includes(expected as string)

        case 'in_list':
            return Array.isArray(expected) && expected.includes(actual)

        default:
            return false
    }
}

/**
 * Evaluate number condition
 */
function evaluateNumberCondition(
    actual: number,
    operator: string,
    expected: number
): boolean {
    switch (operator) {
        case 'equals':
            return actual === expected

        case 'greater_than':
            return actual > expected

        case 'less_than':
            return actual < expected

        default:
            return false
    }
}

/**
 * Common rule templates
 */
export const RULE_TEMPLATES = {
    blockCountry: (countries: string[]): Omit<FirewallRule, 'id' | 'created_at'> => ({
        name: `Block ${countries.join(', ')}`,
        enabled: true,
        priority: 100,
        conditions: [
            {
                type: 'country',
                operator: 'in_list',
                value: countries,
            },
        ],
        action: 'block',
    }),

    blockHighBotScore: (threshold: number): Omit<FirewallRule, 'id' | 'created_at'> => ({
        name: `Block Bot Score > ${threshold}`,
        enabled: true,
        priority: 90,
        conditions: [
            {
                type: 'bot_score',
                operator: 'greater_than',
                value: threshold,
            },
        ],
        action: 'block',
    }),

    blockPath: (path: string): Omit<FirewallRule, 'id' | 'created_at'> => ({
        name: `Block ${path}`,
        enabled: true,
        priority: 80,
        conditions: [
            {
                type: 'path',
                operator: 'contains',
                value: path,
            },
        ],
        action: 'block',
    }),
}
